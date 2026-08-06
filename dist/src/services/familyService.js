"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_GENOTYPES = exports.VALID_BLOOD_GROUPS = exports.VALID_RELATIONSHIP_STATUSES = exports.VALID_RELATIONSHIP_SUBTYPES = exports.VALID_RELATIONSHIP_TYPES = exports.HIERARCHICAL_RELATIONSHIP_TYPES = exports.VALID_GENDERS = exports.prisma = void 0;
exports.addPerson = addPerson;
exports.updatePerson = updatePerson;
exports.addRelationship = addRelationship;
exports.updateRelationship = updateRelationship;
exports.deleteRelationship = deleteRelationship;
exports.getRelationshipsForPerson = getRelationshipsForPerson;
exports.getImmediateFamily = getImmediateFamily;
exports.getAncestors = getAncestors;
exports.getDescendants = getDescendants;
exports.listPeople = listPeople;
exports.deletePerson = deletePerson;
exports.getClans = getClans;
exports.getRegions = getRegions;
exports.getParamountcies = getParamountcies;
exports.getSubStools = getSubStools;
exports.createRegion = createRegion;
exports.updateRegion = updateRegion;
exports.deleteRegion = deleteRegion;
exports.createParamountcy = createParamountcy;
exports.updateParamountcy = updateParamountcy;
exports.deleteParamountcy = deleteParamountcy;
exports.createSubStool = createSubStool;
exports.updateSubStool = updateSubStool;
exports.deleteSubStool = deleteSubStool;
exports.createMarriage = createMarriage;
exports.listMarriagesForPerson = listMarriagesForPerson;
exports.deleteMarriage = deleteMarriage;
exports.getAsantehenes = getAsantehenes;
exports.getAsantehemaas = getAsantehemaas;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
// Domain Enumeration Arrays for runtime validation
exports.VALID_GENDERS = ['Male', 'Female', 'Other', 'Unknown'];
exports.HIERARCHICAL_RELATIONSHIP_TYPES = ['Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)'];
exports.VALID_RELATIONSHIP_TYPES = ['Parent-Child', 'Spouse', 'Partner', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)'];
exports.VALID_RELATIONSHIP_SUBTYPES = ['Biological', 'Adoptive', 'Step', 'Foster', 'None', 'Asantehene -> Paramount Chief', 'Paramount Chief -> Divisional Chief', 'Divisional Chief -> Sub-Chief', 'Asantehemaa -> Paramount Queen Mother', 'Paramount Queen Mother -> Divisional Queen Mother', 'Divisional Queen Mother -> Sub Queen Mother'];
exports.VALID_RELATIONSHIP_STATUSES = ['Married', 'Divorced', 'Widowed', 'Separated', 'Active'];
exports.VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
exports.VALID_GENOTYPES = ['AA', 'AS', 'SS', 'AC', 'SC'];
/**
 * Maps raw database row properties to typed Person entity.
 */
function mapRawToPerson(row) {
    return {
        person_id: Number(row.person_id),
        first_name: row.first_name || (row.fullName ? row.fullName.split(' ')[0] : ''),
        last_name: row.last_name || (row.fullName ? row.fullName.split(' ').slice(1).join(' ') : ''),
        fullName: row.fullName || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        maiden_name: row.maiden_name,
        gender: row.gender,
        photoUrl: row.photoUrl || null,
        birth_date: row.birth_date ? new Date(row.birth_date) : null,
        birth_place: row.birth_place || null,
        death_date: row.death_date ? new Date(row.death_date) : null,
        death_place: row.death_place || null,
        burialPlace: row.burialPlace || null,
        is_living: row.is_living === 1 || row.is_living === true || row.is_living === 'true',
        bio: row.bio || null,
        ghana_card: row.ghana_card || null,
        gps_address: row.gps_address || null,
        phone: row.phone || null,
        email: row.email || null,
        currentAddress: row.currentAddress || null,
        hometown: row.hometown || null,
        profession: row.profession || null,
        employer: row.employer || null,
        church: row.church || null,
        baptismDetails: row.baptismDetails || null,
        bloodGroup: row.bloodGroup || null,
        genotype: row.genotype || null,
        educationJson: row.educationJson || null,
        documentsJson: row.documentsJson || null,
        biographyJson: row.biographyJson || null,
        fatherId: row.fatherId ? Number(row.fatherId) : null,
        motherId: row.motherId ? Number(row.motherId) : null,
        clan_id: row.clan_id ? Number(row.clan_id) : null,
        paramountcy_id: row.paramountcy_id ? Number(row.paramountcy_id) : null,
        sub_stool_id: row.sub_stool_id ? Number(row.sub_stool_id) : null,
        enstoolment_date: row.enstoolment_date ? new Date(row.enstoolment_date) : null
    };
}
/**
 * Checks recursively using CTE if targetId is a descendant of ancestorId.
 */
async function checkIsDescendant(ancestorId, targetId) {
    const result = await exports.prisma.$queryRaw `
    WITH RECURSIVE DescendantCheck AS (
      SELECT person_id_2 AS child_id
      FROM Relationship
      WHERE person_id_1 = ${ancestorId} 
        AND relationship_type IN ('Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)')

      UNION ALL

      SELECT r.person_id_2
      FROM Relationship r
      JOIN DescendantCheck dc ON dc.child_id = r.person_id_1
      WHERE r.relationship_type IN ('Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)')
    )
    SELECT EXISTS(SELECT 1 FROM DescendantCheck WHERE child_id = ${targetId}) AS is_descendant;
  `;
    const val = result[0] ? Object.values(result[0])[0] : 0;
    return val === 1 || val === true || Number(val) === 1;
}
/**
 * Add a new person with input validation across all 16 categories.
 */
async function addPerson(data) {
    if (!exports.VALID_GENDERS.includes(data.gender)) {
        throw new Error(`Validation Error: Invalid gender value '${data.gender}'. Allowed values: ${exports.VALID_GENDERS.join(', ')}`);
    }
    if (data.bloodGroup && !exports.VALID_BLOOD_GROUPS.includes(data.bloodGroup)) {
        throw new Error(`Validation Error: Invalid bloodGroup '${data.bloodGroup}'. Allowed values: ${exports.VALID_BLOOD_GROUPS.join(', ')}`);
    }
    if (data.genotype && !exports.VALID_GENOTYPES.includes(data.genotype)) {
        throw new Error(`Validation Error: Invalid genotype '${data.genotype}'. Allowed values: ${exports.VALID_GENOTYPES.join(', ')}`);
    }
    if (data.birth_date && data.death_date) {
        if (new Date(data.birth_date) > new Date(data.death_date)) {
            throw new Error("Validation Error: Birth date cannot be after death date.");
        }
    }
    // Synthesize names
    const firstName = data.first_name || (data.fullName ? data.fullName.split(' ')[0] : '');
    const lastName = data.last_name || (data.fullName ? data.fullName.split(' ').slice(1).join(' ') : '');
    const computedFullName = data.fullName || `${firstName} ${lastName}`.trim();
    const isLiving = data.is_living !== undefined ? Boolean(data.is_living) : true;
    return await exports.prisma.person.create({
        data: {
            first_name: firstName,
            last_name: lastName,
            fullName: computedFullName,
            maiden_name: data.maiden_name !== undefined ? data.maiden_name : null,
            gender: data.gender,
            photoUrl: data.photoUrl !== undefined ? data.photoUrl : null,
            birth_date: data.birth_date ? new Date(data.birth_date) : null,
            birth_place: data.birth_place !== undefined ? data.birth_place : null,
            death_date: data.death_date ? new Date(data.death_date) : null,
            death_place: data.death_place !== undefined ? data.death_place : null,
            burialPlace: data.burialPlace !== undefined ? data.burialPlace : null,
            is_living: isLiving,
            bio: data.bio !== undefined ? data.bio : null,
            ghana_card: data.ghana_card !== undefined ? data.ghana_card : null,
            gps_address: data.gps_address !== undefined ? data.gps_address : null,
            phone: data.phone !== undefined ? data.phone : null,
            email: data.email !== undefined ? data.email : null,
            currentAddress: data.currentAddress !== undefined ? data.currentAddress : null,
            hometown: data.hometown !== undefined ? data.hometown : null,
            profession: data.profession !== undefined ? data.profession : null,
            employer: data.employer !== undefined ? data.employer : null,
            church: data.church !== undefined ? data.church : null,
            baptismDetails: data.baptismDetails !== undefined ? data.baptismDetails : null,
            bloodGroup: data.bloodGroup !== undefined ? data.bloodGroup : null,
            genotype: data.genotype !== undefined ? data.genotype : null,
            educationJson: data.educationJson !== undefined ? data.educationJson : null,
            documentsJson: data.documentsJson !== undefined ? data.documentsJson : null,
            biographyJson: data.biographyJson !== undefined ? data.biographyJson : null,
            fatherId: data.fatherId !== undefined ? data.fatherId : null,
            motherId: data.motherId !== undefined ? data.motherId : null,
            clan_id: data.clan_id !== undefined ? data.clan_id : null,
            paramountcy_id: data.paramountcy_id !== undefined ? data.paramountcy_id : null,
            sub_stool_id: data.sub_stool_id !== undefined ? data.sub_stool_id : null,
            enstoolment_date: data.enstoolment_date ? new Date(data.enstoolment_date) : null
        }
    });
}
/**
 * Update person vital stats across all 16 categories.
 */
async function updatePerson(id, data) {
    if (data.gender && !exports.VALID_GENDERS.includes(data.gender)) {
        throw new Error(`Validation Error: Invalid gender value '${data.gender}'. Allowed values: ${exports.VALID_GENDERS.join(', ')}`);
    }
    if (data.bloodGroup && !exports.VALID_BLOOD_GROUPS.includes(data.bloodGroup)) {
        throw new Error(`Validation Error: Invalid bloodGroup '${data.bloodGroup}'. Allowed values: ${exports.VALID_BLOOD_GROUPS.join(', ')}`);
    }
    if (data.genotype && !exports.VALID_GENOTYPES.includes(data.genotype)) {
        throw new Error(`Validation Error: Invalid genotype '${data.genotype}'. Allowed values: ${exports.VALID_GENOTYPES.join(', ')}`);
    }
    const existing = await exports.prisma.person.findUnique({ where: { person_id: id } });
    if (!existing) {
        throw new Error(`Not Found: Person with ID ${id} does not exist.`);
    }
    const birthDate = data.birth_date !== undefined ? (data.birth_date ? new Date(data.birth_date) : null) : existing.birth_date;
    const deathDate = data.death_date !== undefined ? (data.death_date ? new Date(data.death_date) : null) : existing.death_date;
    if (birthDate && deathDate) {
        if (birthDate > deathDate) {
            throw new Error("Validation Error: Birth date cannot be after death date.");
        }
    }
    const firstName = data.first_name !== undefined ? data.first_name : existing.first_name;
    const lastName = data.last_name !== undefined ? data.last_name : existing.last_name;
    const computedFullName = data.fullName !== undefined ? data.fullName : `${firstName} ${lastName}`.trim();
    return await exports.prisma.person.update({
        where: { person_id: id },
        data: {
            first_name: firstName,
            last_name: lastName,
            fullName: computedFullName,
            maiden_name: data.maiden_name !== undefined ? data.maiden_name : existing.maiden_name,
            gender: data.gender !== undefined ? data.gender : existing.gender,
            photoUrl: data.photoUrl !== undefined ? data.photoUrl : existing.photoUrl,
            birth_date: birthDate,
            birth_place: data.birth_place !== undefined ? data.birth_place : existing.birth_place,
            death_date: deathDate,
            death_place: data.death_place !== undefined ? data.death_place : existing.death_place,
            burialPlace: data.burialPlace !== undefined ? data.burialPlace : existing.burialPlace,
            is_living: data.is_living !== undefined ? data.is_living : existing.is_living,
            bio: data.bio !== undefined ? data.bio : existing.bio,
            ghana_card: data.ghana_card !== undefined ? data.ghana_card : existing.ghana_card,
            gps_address: data.gps_address !== undefined ? data.gps_address : existing.gps_address,
            phone: data.phone !== undefined ? data.phone : existing.phone,
            email: data.email !== undefined ? data.email : existing.email,
            currentAddress: data.currentAddress !== undefined ? data.currentAddress : existing.currentAddress,
            hometown: data.hometown !== undefined ? data.hometown : existing.hometown,
            profession: data.profession !== undefined ? data.profession : existing.profession,
            employer: data.employer !== undefined ? data.employer : existing.employer,
            church: data.church !== undefined ? data.church : existing.church,
            baptismDetails: data.baptismDetails !== undefined ? data.baptismDetails : existing.baptismDetails,
            bloodGroup: data.bloodGroup !== undefined ? data.bloodGroup : existing.bloodGroup,
            genotype: data.genotype !== undefined ? data.genotype : existing.genotype,
            educationJson: data.educationJson !== undefined ? data.educationJson : existing.educationJson,
            documentsJson: data.documentsJson !== undefined ? data.documentsJson : existing.documentsJson,
            biographyJson: data.biographyJson !== undefined ? data.biographyJson : existing.biographyJson,
            fatherId: data.fatherId !== undefined ? data.fatherId : existing.fatherId,
            motherId: data.motherId !== undefined ? data.motherId : existing.motherId,
            clan_id: data.clan_id !== undefined ? data.clan_id : existing.clan_id,
            paramountcy_id: data.paramountcy_id !== undefined ? data.paramountcy_id : existing.paramountcy_id,
            sub_stool_id: data.sub_stool_id !== undefined ? data.sub_stool_id : existing.sub_stool_id,
            enstoolment_date: data.enstoolment_date !== undefined ? (data.enstoolment_date ? new Date(data.enstoolment_date) : null) : existing.enstoolment_date
        }
    });
}
/**
 * Creates a relationship with comprehensive sorting and validation guards.
 */
async function addRelationship(p1, p2, type, subtype, status, startDate, endDate) {
    // 1. Self-loop prevention
    if (p1 === p2) {
        throw new Error("Validation Error: Self-loops are not allowed. A person cannot establish a relationship with themselves.");
    }
    // 2. Domain Enumeration Validations
    if (!exports.VALID_RELATIONSHIP_TYPES.includes(type)) {
        throw new Error(`Validation Error: Invalid relationship type '${type}'. Allowed values: ${exports.VALID_RELATIONSHIP_TYPES.join(', ')}`);
    }
    if (!exports.VALID_RELATIONSHIP_SUBTYPES.includes(subtype)) {
        throw new Error(`Validation Error: Invalid relationship subtype '${subtype}'. Allowed values: ${exports.VALID_RELATIONSHIP_SUBTYPES.join(', ')}`);
    }
    if (status && !exports.VALID_RELATIONSHIP_STATUSES.includes(status)) {
        throw new Error(`Validation Error: Invalid relationship status '${status}'. Allowed values: ${exports.VALID_RELATIONSHIP_STATUSES.join(', ')}`);
    }
    // 3. Directional Sorting & Alignment
    let personId1 = p1;
    let personId2 = p2;
    if (exports.HIERARCHICAL_RELATIONSHIP_TYPES.includes(type)) {
        // Directional relationships: person_id_1 is Superior/Parent, person_id_2 is Subordinate/Child. Keep as is.
    }
    else {
        // Spouse/Partner relationships enforce p1 < p2 to prevent bidirection duplicates
        if (p1 > p2) {
            personId1 = p2;
            personId2 = p1;
        }
    }
    // Check if both individuals exist in the database
    const person1 = await exports.prisma.person.findUnique({ where: { person_id: personId1 } });
    const person2 = await exports.prisma.person.findUnique({ where: { person_id: personId2 } });
    if (!person1 || !person2) {
        throw new Error(`Validation Error: One or both persons do not exist. IDs: ${personId1}, ${personId2}`);
    }
    // 4. Duplicate Relationship Check
    const existingRel = await exports.prisma.relationship.findUnique({
        where: {
            person_pair_unique: {
                person_id_1: personId1,
                person_id_2: personId2
            }
        }
    });
    if (existingRel) {
        throw new Error(`Validation Error: A relationship already exists between Person ${personId1} and Person ${personId2}.`);
    }
    // 5. Graph Cycle Detection & Chronological integrity for Hierarchical Relationships
    if (exports.HIERARCHICAL_RELATIONSHIP_TYPES.includes(type)) {
        // Graph Cycle: proposed superior/parent (personId1) cannot be a subordinate/descendant of proposed subordinate/child (personId2)
        const isParentDescendant = await checkIsDescendant(personId2, personId1);
        if (isParentDescendant) {
            throw new Error(`Graph Cycle Error: Cannot set Person ${personId1} as superior of Person ${personId2} because Person ${personId1} is already a subordinate of Person ${personId2}.`);
        }
        // Chronological Integrity: parent birth date strictly before child birth date (Parent-Child only)
        if (type === 'Parent-Child') {
            if (person1.birth_date && person2.birth_date) {
                const pBirth = new Date(person1.birth_date);
                const cBirth = new Date(person2.birth_date);
                if (pBirth >= cBirth) {
                    throw new Error(`Chronological Error: Parent's birth date (${pBirth.toISOString().split('T')[0]}) must be strictly earlier than child's birth date (${cBirth.toISOString().split('T')[0]}).`);
                }
            }
            // Chronological Integrity: child birth date does not exceed parent death date by more than 9 months
            if (person1.death_date && person2.birth_date) {
                const pDeath = new Date(person1.death_date);
                const cBirth = new Date(person2.birth_date);
                const maxChildBirth = new Date(pDeath);
                maxChildBirth.setMonth(maxChildBirth.getMonth() + 9);
                if (cBirth > maxChildBirth) {
                    throw new Error(`Chronological Error: Child's birth date (${cBirth.toISOString().split('T')[0]}) cannot exceed parent's death date (${pDeath.toISOString().split('T')[0]}) by more than 9 months.`);
                }
            }
        }
    }
    return await exports.prisma.relationship.create({
        data: {
            person_id_1: personId1,
            person_id_2: personId2,
            relationship_type: type,
            subtype: subtype,
            status: status || null,
            start_date: startDate ? new Date(startDate) : null,
            end_date: endDate ? new Date(endDate) : null
        }
    });
}
/**
 * Updates an existing relationship by ID.
 */
async function updateRelationship(relationshipId, type, subtype, status, startDate, endDate) {
    const existing = await exports.prisma.relationship.findUnique({
        where: { relationship_id: relationshipId }
    });
    if (!existing) {
        throw new Error(`Not Found: Relationship with ID ${relationshipId} does not exist.`);
    }
    // Domain validation
    if (!exports.VALID_RELATIONSHIP_TYPES.includes(type)) {
        throw new Error(`Validation Error: Invalid relationship type '${type}'. Allowed values: ${exports.VALID_RELATIONSHIP_TYPES.join(', ')}`);
    }
    if (!exports.VALID_RELATIONSHIP_SUBTYPES.includes(subtype)) {
        throw new Error(`Validation Error: Invalid relationship subtype '${subtype}'. Allowed values: ${exports.VALID_RELATIONSHIP_SUBTYPES.join(', ')}`);
    }
    if (status && !exports.VALID_RELATIONSHIP_STATUSES.includes(status)) {
        throw new Error(`Validation Error: Invalid relationship status '${status}'. Allowed values: ${exports.VALID_RELATIONSHIP_STATUSES.join(', ')}`);
    }
    return await exports.prisma.relationship.update({
        where: { relationship_id: relationshipId },
        data: {
            relationship_type: type,
            subtype: subtype,
            status: status || null,
            start_date: startDate ? new Date(startDate) : null,
            end_date: endDate ? new Date(endDate) : null
        }
    });
}
/**
 * Deletes a relationship by ID.
 */
async function deleteRelationship(relationshipId) {
    const existing = await exports.prisma.relationship.findUnique({
        where: { relationship_id: relationshipId }
    });
    if (!existing) {
        throw new Error(`Not Found: Relationship with ID ${relationshipId} does not exist.`);
    }
    return await exports.prisma.relationship.delete({
        where: { relationship_id: relationshipId }
    });
}
/**
 * Lists all relationships for a person (both as person_id_1 and person_id_2).
 */
async function getRelationshipsForPerson(personId) {
    const rels = await exports.prisma.relationship.findMany({
        where: {
            OR: [
                { person_id_1: personId },
                { person_id_2: personId }
            ]
        }
    });
    return rels;
}
/**
 * Retrieves Parents, Children, Spouses, Partners, and Siblings (with classification).
 */
async function getImmediateFamily(personId) {
    const target = await exports.prisma.person.findUnique({ where: { person_id: personId } });
    if (!target) {
        throw new Error(`Not Found: Person with ID ${personId} does not exist.`);
    }
    // 1. Fetch parents / superiors
    const parentRelations = await exports.prisma.relationship.findMany({
        where: {
            person_id_2: personId,
            relationship_type: { in: exports.HIERARCHICAL_RELATIONSHIP_TYPES }
        },
        include: {
            person_1: true
        }
    });
    const parents = parentRelations.map(r => r.person_1);
    // 2. Fetch children / subordinates
    const childRelations = await exports.prisma.relationship.findMany({
        where: {
            person_id_1: personId,
            relationship_type: { in: exports.HIERARCHICAL_RELATIONSHIP_TYPES }
        },
        include: {
            person_2: true
        }
    });
    const children = childRelations.map(r => r.person_2);
    // 3. Fetch spouses/partners
    const partnerRelations = await exports.prisma.relationship.findMany({
        where: {
            OR: [
                { person_id_1: personId },
                { person_id_2: personId }
            ],
            relationship_type: { in: ['Spouse', 'Partner'] }
        },
        include: {
            person_1: true,
            person_2: true
        }
    });
    const spouses = [];
    const partners = [];
    for (const rel of partnerRelations) {
        const other = rel.person_id_1 === personId ? rel.person_2 : rel.person_1;
        if (rel.relationship_type === 'Spouse') {
            spouses.push(other);
        }
        else {
            partners.push(other);
        }
    }
    // 4. Fetch siblings and classify (Full vs. Half)
    const parentIds = parents.map(p => p.person_id);
    const siblings = [];
    if (parentIds.length > 0) {
        const siblingRelations = await exports.prisma.relationship.findMany({
            where: {
                person_id_1: { in: parentIds },
                relationship_type: { in: exports.HIERARCHICAL_RELATIONSHIP_TYPES },
                person_id_2: { not: personId }
            },
            select: {
                person_id_2: true
            }
        });
        const siblingIds = Array.from(new Set(siblingRelations.map(r => r.person_id_2)));
        if (siblingIds.length > 0) {
            const siblingsWithParents = await exports.prisma.person.findMany({
                where: { person_id: { in: siblingIds } },
                include: {
                    relationships2: {
                        where: { relationship_type: { in: exports.HIERARCHICAL_RELATIONSHIP_TYPES } },
                        select: { person_id_1: true }
                    }
                }
            });
            for (const sib of siblingsWithParents) {
                const sibParentIds = sib.relationships2.map(r => r.person_id_1);
                const overlap = sibParentIds.filter(id => parentIds.includes(id)).length;
                let type = 'Half-Sibling';
                if (parentIds.length >= 2) {
                    if (overlap >= 2) {
                        type = 'Full-Sibling';
                    }
                }
                else {
                    if (overlap === 1 && sibParentIds.length === 1) {
                        type = 'Full-Sibling';
                    }
                }
                const { relationships2, ...cleanPerson } = sib;
                siblings.push({
                    person: cleanPerson,
                    type
                });
            }
        }
    }
    return {
        parents,
        children,
        spouses,
        partners,
        siblings
    };
}
/**
 * Optimized SQL CTE to traverse ancestral line / command hierarchy upwards.
 */
async function getAncestors(personId, maxGenerations) {
    const target = await exports.prisma.person.findUnique({ where: { person_id: personId } });
    if (!target) {
        throw new Error(`Not Found: Person with ID ${personId} does not exist.`);
    }
    const rawAncestors = await exports.prisma.$queryRaw `
    WITH RECURSIVE AncestorTree AS (
      SELECT 
        person_id, first_name, last_name, maiden_name, gender, 
        birth_date, birth_place, death_date, death_place, is_living, bio,
        0 AS generation,
        CAST(NULL AS INTEGER) AS child_id
      FROM Person
      WHERE person_id = ${personId}

      UNION ALL

      SELECT 
        p.person_id, p.first_name, p.last_name, p.maiden_name, p.gender, 
        p.birth_date, p.birth_place, p.death_date, p.death_place, p.is_living, p.bio,
        at.generation + 1 AS generation,
        at.person_id AS child_id
      FROM Person p
      JOIN Relationship r ON (r.person_id_1 = p.person_id AND r.relationship_type IN ('Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)'))
      JOIN AncestorTree at ON at.person_id = r.person_id_2
      WHERE at.generation < ${maxGenerations}
    )
    SELECT * FROM AncestorTree WHERE generation > 0 ORDER BY generation ASC;
  `;
    return rawAncestors.map(row => ({
        person: mapRawToPerson(row),
        generation: Number(row.generation),
        childId: row.child_id ? Number(row.child_id) : null
    }));
}
/**
 * Optimized SQL CTE to traverse descendant line / command hierarchy downwards.
 */
async function getDescendants(personId, maxGenerations) {
    const target = await exports.prisma.person.findUnique({ where: { person_id: personId } });
    if (!target) {
        throw new Error(`Not Found: Person with ID ${personId} does not exist.`);
    }
    const rawDescendants = await exports.prisma.$queryRaw `
    WITH RECURSIVE DescendantTree AS (
      SELECT 
        person_id, first_name, last_name, maiden_name, gender, 
        birth_date, birth_place, death_date, death_place, is_living, bio,
        0 AS generation,
        CAST(NULL AS INTEGER) AS parent_id
      FROM Person
      WHERE person_id = ${personId}

      UNION ALL

      SELECT 
        p.person_id, p.first_name, p.last_name, p.maiden_name, p.gender, 
        p.birth_date, p.birth_place, p.death_date, p.death_place, p.is_living, p.bio,
        dt.generation + 1 AS generation,
        dt.person_id AS parent_id
      FROM Person p
      JOIN Relationship r ON (r.person_id_2 = p.person_id AND r.relationship_type IN ('Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)'))
      JOIN DescendantTree dt ON dt.person_id = r.person_id_1
      WHERE dt.generation < ${maxGenerations}
    )
    SELECT * FROM DescendantTree WHERE generation > 0 ORDER BY generation ASC;
  `;
    return rawDescendants.map(row => ({
        person: mapRawToPerson(row),
        generation: Number(row.generation),
        parentId: row.parent_id ? Number(row.parent_id) : null
    }));
}
/**
 * Retrieve all registered people.
 */
async function listPeople() {
    return await exports.prisma.person.findMany({
        orderBy: { first_name: 'asc' }
    });
}
/**
 * Delete a person by ID.
 */
async function deletePerson(id) {
    const existing = await exports.prisma.person.findUnique({ where: { person_id: id } });
    if (!existing) {
        throw new Error(`Not Found: Person with ID ${id} does not exist.`);
    }
    // Delete relationships and sources referencing this person first if needed, though schema has Cascade
    await exports.prisma.relationship.deleteMany({
        where: {
            OR: [
                { person_id_1: id },
                { person_id_2: id }
            ]
        }
    });
    await exports.prisma.source.deleteMany({
        where: { person_id: id }
    });
    return await exports.prisma.person.delete({
        where: { person_id: id }
    });
}
/**
 * ROYAL TREE MANAGEMENT SYSTEM FUNCTIONS
 */
async function getClans() {
    return await exports.prisma.clan.findMany({ orderBy: { name: 'asc' } });
}
async function getRegions() {
    return await exports.prisma.region.findMany({ orderBy: { name: 'asc' } });
}
async function getParamountcies() {
    return await exports.prisma.paramountcy.findMany({
        include: { region: true },
        orderBy: { name: 'asc' }
    });
}
async function getSubStools() {
    return await exports.prisma.subStool.findMany({
        include: { paramountcy: true },
        orderBy: { name: 'asc' }
    });
}
// Regions CRUD
async function createRegion(name) {
    return await exports.prisma.region.create({ data: { name } });
}
async function updateRegion(id, name) {
    return await exports.prisma.region.update({ where: { id }, data: { name } });
}
async function deleteRegion(id) {
    // Strict rejection: check if there are any paramountcies attached
    const count = await exports.prisma.paramountcy.count({ where: { region_id: id } });
    if (count > 0)
        throw new Error(`Cannot delete region. It has ${count} associated paramountcies.`);
    return await exports.prisma.region.delete({ where: { id } });
}
// Paramountcies CRUD
async function createParamountcy(name, regionId) {
    return await exports.prisma.paramountcy.create({ data: { name, region_id: regionId } });
}
async function updateParamountcy(id, name, regionId) {
    return await exports.prisma.paramountcy.update({ where: { id }, data: { name, region_id: regionId } });
}
async function deleteParamountcy(id) {
    // Strict rejection: check if there are any sub-stools attached
    const count = await exports.prisma.subStool.count({ where: { paramountcy_id: id } });
    if (count > 0)
        throw new Error(`Cannot delete paramountcy. It has ${count} associated sub-stools.`);
    return await exports.prisma.paramountcy.delete({ where: { id } });
}
// Sub-Stools CRUD
async function createSubStool(name, paramountcyId) {
    return await exports.prisma.subStool.create({ data: { name, paramountcy_id: paramountcyId } });
}
async function updateSubStool(id, name, paramountcyId) {
    return await exports.prisma.subStool.update({ where: { id }, data: { name, paramountcy_id: paramountcyId } });
}
async function deleteSubStool(id) {
    return await exports.prisma.subStool.delete({ where: { id } });
}
// Marriage CRUD
async function createMarriage(spouse1Id, spouse2Id, marriageDate, marriagePlace) {
    if (spouse1Id === spouse2Id) {
        throw new Error("Validation Error: Cannot establish marriage between the same person.");
    }
    const person1 = await exports.prisma.person.findUnique({ where: { person_id: spouse1Id } });
    const person2 = await exports.prisma.person.findUnique({ where: { person_id: spouse2Id } });
    if (!person1 || !person2) {
        throw new Error(`Validation Error: One or both spouses do not exist. IDs: ${spouse1Id}, ${spouse2Id}`);
    }
    return await exports.prisma.marriage.create({
        data: {
            spouse1Id,
            spouse2Id,
            marriageDate: marriageDate ? new Date(marriageDate) : null,
            marriagePlace: marriagePlace || null
        },
        include: {
            spouse1: true,
            spouse2: true
        }
    });
}
async function listMarriagesForPerson(personId) {
    return await exports.prisma.marriage.findMany({
        where: {
            OR: [
                { spouse1Id: personId },
                { spouse2Id: personId }
            ]
        },
        include: {
            spouse1: true,
            spouse2: true
        }
    });
}
async function deleteMarriage(id) {
    return await exports.prisma.marriage.delete({ where: { id } });
}
// Royal Ancestors Lookups
async function getAsantehenes() {
    return await exports.prisma.person.findMany({
        where: {
            OR: [
                { bio: { contains: 'Asantehene' } },
                { first_name: { contains: 'Otumfuo' } },
                { last_name: { contains: 'Tutu' } },
                { last_name: { contains: 'Prempeh' } }
            ]
        },
        orderBy: { person_id: 'asc' }
    });
}
async function getAsantehemaas() {
    return await exports.prisma.person.findMany({
        where: {
            OR: [
                { bio: { contains: 'Asantehemaa' } },
                { first_name: { contains: 'Asantehemaa' } },
                { last_name: { contains: 'Asantehemaa' } },
                { last_name: { contains: 'Yiadom' } }
            ]
        },
        orderBy: { person_id: 'asc' }
    });
}
//# sourceMappingURL=familyService.js.map