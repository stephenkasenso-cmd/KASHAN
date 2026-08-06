"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLineageSummary = generateLineageSummary;
exports.runDataIntegrityCheck = runDataIntegrityCheck;
exports.compileBiographicalTimeline = compileBiographicalTimeline;
const familyService_1 = require("./familyService");
/**
 * Aggregates generation metrics and locations on a person's tree branch.
 */
async function generateLineageSummary(personId) {
    const person = await familyService_1.prisma.person.findUnique({
        where: { person_id: personId }
    });
    if (!person) {
        throw new Error(`Not Found: Person with ID ${personId} does not exist.`);
    }
    // Retrieve full ancestor and descendant nodes (up to 100 generations)
    const ancestors = await (0, familyService_1.getAncestors)(personId, 100);
    const descendants = await (0, familyService_1.getDescendants)(personId, 100);
    const totalAncestors = ancestors.length;
    const totalDescendants = descendants.length;
    const maxAncestorGen = ancestors.reduce((max, node) => node.generation > max ? node.generation : max, 0);
    const maxDescendantGen = descendants.reduce((max, node) => node.generation > max ? node.generation : max, 0);
    // Compile unique location list
    const locationSet = new Set();
    if (person.birth_place)
        locationSet.add(person.birth_place.trim());
    if (person.death_place)
        locationSet.add(person.death_place.trim());
    ancestors.forEach(anc => {
        if (anc.person.birth_place)
            locationSet.add(anc.person.birth_place.trim());
        if (anc.person.death_place)
            locationSet.add(anc.person.death_place.trim());
    });
    descendants.forEach(desc => {
        if (desc.person.birth_place)
            locationSet.add(desc.person.birth_place.trim());
        if (desc.person.death_place)
            locationSet.add(desc.person.death_place.trim());
    });
    const historicalLocations = Array.from(locationSet).filter(Boolean).sort();
    return {
        person_id: person.person_id,
        full_name: `${person.first_name} ${person.last_name}`,
        total_ancestors: totalAncestors,
        total_descendants: totalDescendants,
        max_ancestor_generation: maxAncestorGen,
        max_descendant_generation: maxDescendantGen,
        historical_locations: historicalLocations
    };
}
/**
 * Scans database tables for missing vitals, lack of sources, and loose genders.
 */
async function runDataIntegrityCheck() {
    const missingBirthPeople = await familyService_1.prisma.person.findMany({
        where: { birth_date: null },
        select: { person_id: true, first_name: true, last_name: true }
    });
    const lackingSourcesPeople = await familyService_1.prisma.person.findMany({
        where: { sources: { none: {} } },
        select: { person_id: true, first_name: true, last_name: true }
    });
    const ambiguousGenderPeople = await familyService_1.prisma.person.findMany({
        where: { gender: { notIn: ['Male', 'Female'] } },
        select: { person_id: true, first_name: true, last_name: true, gender: true }
    });
    return {
        missing_birth_dates: missingBirthPeople.map(p => ({
            person_id: p.person_id,
            name: `${p.first_name} ${p.last_name}`
        })),
        lacking_sources: lackingSourcesPeople.map(p => ({
            person_id: p.person_id,
            name: `${p.first_name} ${p.last_name}`
        })),
        ambiguous_genders: ambiguousGenderPeople.map(p => ({
            person_id: p.person_id,
            name: `${p.first_name} ${p.last_name}`,
            gender: p.gender
        }))
    };
}
/**
 * Compiles a sorted chronological timeline combining target's, parents', and children's vitals.
 */
async function compileBiographicalTimeline(personId) {
    const target = await familyService_1.prisma.person.findUnique({
        where: { person_id: personId }
    });
    if (!target) {
        throw new Error(`Not Found: Person with ID ${personId} does not exist.`);
    }
    const family = await (0, familyService_1.getImmediateFamily)(personId);
    const events = [];
    // 1. Target personal events
    if (target.birth_date) {
        events.push({
            date: new Date(target.birth_date),
            date_string: new Date(target.birth_date).toISOString(),
            event_type: 'Birth',
            description: `Birth of target individual, ${target.first_name} ${target.last_name}.`
        });
    }
    if (!target.is_living && target.death_date) {
        events.push({
            date: new Date(target.death_date),
            date_string: new Date(target.death_date).toISOString(),
            event_type: 'Death',
            description: `Death of target individual, ${target.first_name} ${target.last_name}.`
        });
    }
    // 2. Parents' vital events
    family.parents.forEach(parent => {
        if (parent.birth_date) {
            events.push({
                date: new Date(parent.birth_date),
                date_string: new Date(parent.birth_date).toISOString(),
                event_type: 'Parent_Birth',
                description: `Birth of parent, ${parent.first_name} ${parent.last_name}.`,
                relative_name: `${parent.first_name} ${parent.last_name}`,
                relative_relation: 'Parent'
            });
        }
        if (!parent.is_living && parent.death_date) {
            events.push({
                date: new Date(parent.death_date),
                date_string: new Date(parent.death_date).toISOString(),
                event_type: 'Parent_Death',
                description: `Death of parent, ${parent.first_name} ${parent.last_name}.`,
                relative_name: `${parent.first_name} ${parent.last_name}`,
                relative_relation: 'Parent'
            });
        }
    });
    // 3. Children's vital events
    family.children.forEach(child => {
        if (child.birth_date) {
            events.push({
                date: new Date(child.birth_date),
                date_string: new Date(child.birth_date).toISOString(),
                event_type: 'Child_Birth',
                description: `Birth of child, ${child.first_name} ${child.last_name}.`,
                relative_name: `${child.first_name} ${child.last_name}`,
                relative_relation: 'Child'
            });
        }
        if (!child.is_living && child.death_date) {
            events.push({
                date: new Date(child.death_date),
                date_string: new Date(child.death_date).toISOString(),
                event_type: 'Child_Death',
                description: `Death of child, ${child.first_name} ${child.last_name}.`,
                relative_name: `${child.first_name} ${child.last_name}`,
                relative_relation: 'Child'
            });
        }
    });
    // 4. Target relationships (Spouse / Partner marriages)
    const relationships = await familyService_1.prisma.relationship.findMany({
        where: {
            OR: [
                { person_id_1: personId },
                { person_id_2: personId }
            ]
        },
        include: {
            person_1: true,
            person_2: true
        }
    });
    relationships.forEach(rel => {
        const isSpouse = rel.relationship_type === 'Spouse';
        const isPartner = rel.relationship_type === 'Partner';
        if (isSpouse || isPartner) {
            const partner = rel.person_id_1 === personId ? rel.person_2 : rel.person_1;
            const partnerName = `${partner.first_name} ${partner.last_name}`;
            if (rel.start_date) {
                events.push({
                    date: new Date(rel.start_date),
                    date_string: new Date(rel.start_date).toISOString(),
                    event_type: isSpouse ? 'Marriage' : 'Partnership',
                    description: `Established ${rel.relationship_type.toLowerCase()} relationship with ${partnerName}.`,
                    relative_name: partnerName,
                    relative_relation: rel.relationship_type
                });
            }
            if (rel.end_date) {
                events.push({
                    date: new Date(rel.end_date),
                    date_string: new Date(rel.end_date).toISOString(),
                    event_type: isSpouse ? 'Marriage' : 'Partnership',
                    description: `Ended ${rel.relationship_type.toLowerCase()} relationship with ${partnerName} (${rel.status || 'Dissolved'}).`,
                    relative_name: partnerName,
                    relative_relation: rel.relationship_type
                });
            }
        }
    });
    // Sort events chronologically by date
    const sortedTimeline = events.sort((a, b) => a.date.getTime() - b.date.getTime());
    return {
        person_id: target.person_id,
        full_name: `${target.first_name} ${target.last_name}`,
        timeline: sortedTimeline
    };
}
//# sourceMappingURL=reportService.js.map