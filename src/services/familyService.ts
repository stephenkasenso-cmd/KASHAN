import { PrismaClient, Person, Relationship, Source } from '@prisma/client';

export const prisma = new PrismaClient();

// Domain Enumeration Arrays for runtime validation
export const VALID_GENDERS = ['Male', 'Female', 'Other', 'Unknown'];
export const HIERARCHICAL_RELATIONSHIP_TYPES = ['Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)'];
export const VALID_RELATIONSHIP_TYPES = ['Parent-Child', 'Spouse', 'Partner', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)'];
export const VALID_RELATIONSHIP_SUBTYPES = ['Biological', 'Adoptive', 'Step', 'Foster', 'None', 'Asantehene -> Paramount Chief', 'Paramount Chief -> Divisional Chief', 'Divisional Chief -> Sub-Chief', 'Asantehemaa -> Paramount Queen Mother', 'Paramount Queen Mother -> Divisional Queen Mother', 'Divisional Queen Mother -> Sub Queen Mother'];
export const VALID_RELATIONSHIP_STATUSES = ['Married', 'Divorced', 'Widowed', 'Separated', 'Active'];
export const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const VALID_GENOTYPES = ['AA', 'AS', 'SS', 'AC', 'SC'];

export interface SiblingNode {
  person: Person;
  type: 'Full-Sibling' | 'Half-Sibling';
}

export interface ImmediateFamilyPayload {
  parents: Person[];
  children: Person[];
  spouses: Person[];
  partners: Person[];
  siblings: SiblingNode[];
}

export interface TreeBranchNode {
  person: Person;
  generation: number;
  childId?: number | null;
  parentId?: number | null;
}

/**
 * Maps raw database row properties to typed Person entity.
 */
function mapRawToPerson(row: any): Person {
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
    enstoolment_date: row.enstoolment_date ? new Date(row.enstoolment_date) : null,
    dynasticOrder: row.dynasticOrder ? Number(row.dynasticOrder) : null,
    dynasticNumber: row.dynasticNumber ? Number(row.dynasticNumber) : null,
    reignStartYear: row.reignStartYear ? Number(row.reignStartYear) : null,
    reignEndYear: row.reignEndYear ? Number(row.reignEndYear) : null,
    predecessorId: row.predecessorId ? Number(row.predecessorId) : null,
    successorId: row.successorId ? Number(row.successorId) : null
  };
}

/**
 * Checks recursively using CTE if targetId is a descendant of ancestorId.
 */
async function checkIsDescendant(ancestorId: number, targetId: number): Promise<boolean> {
  const result = await prisma.$queryRaw<any[]>`
    WITH RECURSIVE DescendantCheck AS (
      SELECT person_id_2 AS child_id
      FROM "Relationship"
      WHERE person_id_1 = ${ancestorId} 
        AND relationship_type IN ('Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)')

      UNION ALL

      SELECT r.person_id_2
      FROM "Relationship" r
      JOIN DescendantCheck dc ON dc.child_id = r.person_id_1
      WHERE r.relationship_type IN ('Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)')
    )
    SELECT EXISTS(SELECT 1 FROM DescendantCheck WHERE child_id = ${targetId}) AS is_descendant;
  `;
  const val = result[0] ? Object.values(result[0])[0] : 0;
  return val === 1 || val === true || Number(val) === 1;
}

export interface AddPersonInput {
  // Category 1: Identification
  first_name?: string;
  last_name?: string;
  fullName?: string | null;
  gender: string;
  photoUrl?: string | null;

  // Category 2: Birth
  birth_date?: Date | string | null;
  birth_place?: string | null;

  // Category 3: Direct Parent References
  fatherId?: number | null;
  motherId?: number | null;

  // Category 6: Residence & Contact
  currentAddress?: string | null;
  hometown?: string | null;
  phone?: string | null;
  email?: string | null;
  gps_address?: string | null;

  // Category 8 & 9: Occupation & Religion
  profession?: string | null;
  employer?: string | null;
  church?: string | null;
  baptismDetails?: string | null;

  // Category 11: Health Metrics
  bloodGroup?: string | null;
  genotype?: string | null;

  // Category 7, 12, 13: Structured JSON Metadata
  educationJson?: string | null;
  documentsJson?: string | null;
  biographyJson?: string | null;

  // Category 14: Death Records
  death_date?: Date | string | null;
  death_place?: string | null;
  burialPlace?: string | null;
  is_living?: boolean;
  bio?: string | null;

  // Additional Chieftaincy / Royal Identifiers
  maiden_name?: string | null;
  ghana_card?: string | null;
  clan_id?: number | null;
  paramountcy_id?: number | null;
  sub_stool_id?: number | null;
  enstoolment_date?: Date | string | null;
}

/**
 * Add a new person with input validation across all 16 categories.
 */
export async function addPerson(data: AddPersonInput): Promise<Person> {
  if (!VALID_GENDERS.includes(data.gender)) {
    throw new Error(`Validation Error: Invalid gender value '${data.gender}'. Allowed values: ${VALID_GENDERS.join(', ')}`);
  }

  if (data.bloodGroup && !VALID_BLOOD_GROUPS.includes(data.bloodGroup)) {
    throw new Error(`Validation Error: Invalid bloodGroup '${data.bloodGroup}'. Allowed values: ${VALID_BLOOD_GROUPS.join(', ')}`);
  }

  if (data.genotype && !VALID_GENOTYPES.includes(data.genotype)) {
    throw new Error(`Validation Error: Invalid genotype '${data.genotype}'. Allowed values: ${VALID_GENOTYPES.join(', ')}`);
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

  return await prisma.person.create({
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
export async function updatePerson(id: number, data: Partial<AddPersonInput>): Promise<Person> {
  if (data.gender && !VALID_GENDERS.includes(data.gender)) {
    throw new Error(`Validation Error: Invalid gender value '${data.gender}'. Allowed values: ${VALID_GENDERS.join(', ')}`);
  }

  if (data.bloodGroup && !VALID_BLOOD_GROUPS.includes(data.bloodGroup)) {
    throw new Error(`Validation Error: Invalid bloodGroup '${data.bloodGroup}'. Allowed values: ${VALID_BLOOD_GROUPS.join(', ')}`);
  }

  if (data.genotype && !VALID_GENOTYPES.includes(data.genotype)) {
    throw new Error(`Validation Error: Invalid genotype '${data.genotype}'. Allowed values: ${VALID_GENOTYPES.join(', ')}`);
  }

  const existing = await prisma.person.findUnique({ where: { person_id: id } });
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

  return await prisma.person.update({
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
export async function addRelationship(
  p1: number,
  p2: number,
  type: string,
  subtype: string,
  status?: string | null,
  startDate?: Date | string | null,
  endDate?: Date | string | null
): Promise<Relationship> {
  // 1. Self-loop prevention
  if (p1 === p2) {
    throw new Error("Validation Error: Self-loops are not allowed. A person cannot establish a relationship with themselves.");
  }

  // 2. Domain Enumeration Validations
  if (!VALID_RELATIONSHIP_TYPES.includes(type)) {
    throw new Error(`Validation Error: Invalid relationship type '${type}'. Allowed values: ${VALID_RELATIONSHIP_TYPES.join(', ')}`);
  }
  if (!VALID_RELATIONSHIP_SUBTYPES.includes(subtype)) {
    throw new Error(`Validation Error: Invalid relationship subtype '${subtype}'. Allowed values: ${VALID_RELATIONSHIP_SUBTYPES.join(', ')}`);
  }
  if (status && !VALID_RELATIONSHIP_STATUSES.includes(status)) {
    throw new Error(`Validation Error: Invalid relationship status '${status}'. Allowed values: ${VALID_RELATIONSHIP_STATUSES.join(', ')}`);
  }

  // 3. Directional Sorting & Alignment
  let personId1 = p1;
  let personId2 = p2;

  if (HIERARCHICAL_RELATIONSHIP_TYPES.includes(type)) {
    // Directional relationships: person_id_1 is Superior/Parent, person_id_2 is Subordinate/Child. Keep as is.
  } else {
    // Spouse/Partner relationships enforce p1 < p2 to prevent bidirection duplicates
    if (p1 > p2) {
      personId1 = p2;
      personId2 = p1;
    }
  }

  // Check if both individuals exist in the database
  const person1 = await prisma.person.findUnique({ where: { person_id: personId1 } });
  const person2 = await prisma.person.findUnique({ where: { person_id: personId2 } });

  if (!person1 || !person2) {
    throw new Error(`Validation Error: One or both persons do not exist. IDs: ${personId1}, ${personId2}`);
  }

  // 4. Duplicate Relationship Check
  const existingRel = await prisma.relationship.findFirst({
    where: {
      person_id_1: personId1,
      person_id_2: personId2
    }
  });
  if (existingRel) {
    throw new Error(`Validation Error: A relationship already exists between Person ${personId1} and Person ${personId2}.`);
  }

  // 5. Graph Cycle Detection & Chronological integrity for Hierarchical Relationships
  if (HIERARCHICAL_RELATIONSHIP_TYPES.includes(type)) {
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

  return await prisma.relationship.create({
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
export async function updateRelationship(
  relationshipId: number,
  type: string,
  subtype: string,
  status?: string | null,
  startDate?: Date | string | null,
  endDate?: Date | string | null
): Promise<Relationship> {
  const existing = await prisma.relationship.findUnique({
    where: { relationship_id: relationshipId }
  });
  if (!existing) {
    throw new Error(`Not Found: Relationship with ID ${relationshipId} does not exist.`);
  }

  // Domain validation
  if (!VALID_RELATIONSHIP_TYPES.includes(type)) {
    throw new Error(`Validation Error: Invalid relationship type '${type}'. Allowed values: ${VALID_RELATIONSHIP_TYPES.join(', ')}`);
  }
  if (!VALID_RELATIONSHIP_SUBTYPES.includes(subtype)) {
    throw new Error(`Validation Error: Invalid relationship subtype '${subtype}'. Allowed values: ${VALID_RELATIONSHIP_SUBTYPES.join(', ')}`);
  }
  if (status && !VALID_RELATIONSHIP_STATUSES.includes(status)) {
    throw new Error(`Validation Error: Invalid relationship status '${status}'. Allowed values: ${VALID_RELATIONSHIP_STATUSES.join(', ')}`);
  }

  return await prisma.relationship.update({
    where: { relationship_id: relationshipId },
    data: {
      relationship_type: type,
      subtype: subtype,
      status: status || null,
      start_date: startDate ? new Date(startDate as string) : null,
      end_date: endDate ? new Date(endDate as string) : null
    }
  });
}

/**
 * Deletes a relationship by ID and clears associated foreign key pointers cleanly.
 */
export async function deleteRelationship(relationshipId: number): Promise<Relationship> {
  const existing = await prisma.relationship.findUnique({
    where: { relationship_id: relationshipId }
  });
  if (!existing) {
    throw new Error(`Not Found: Relationship with ID ${relationshipId} does not exist.`);
  }

  // Clear pointers based on category / type
  if (existing.category === 'DYNASTIC_SUCCESSOR') {
    await prisma.person.updateMany({
      where: { person_id: existing.person_id_2, predecessorId: existing.person_id_1 },
      data: { predecessorId: null }
    });
    await prisma.person.updateMany({
      where: { person_id: existing.person_id_1, successorId: existing.person_id_2 },
      data: { successorId: null }
    });
  } else if (existing.category === 'PARENT_CHILD') {
    await prisma.person.updateMany({
      where: { person_id: existing.person_id_2, motherId: existing.person_id_1 },
      data: { motherId: null }
    });
    await prisma.person.updateMany({
      where: { person_id: existing.person_id_2, fatherId: existing.person_id_1 },
      data: { fatherId: null }
    });
  }

  return await prisma.relationship.delete({
    where: { relationship_id: relationshipId }
  });
}

export type RelationshipCategory = 
  | 'PARENT_CHILD'
  | 'SIBLING'
  | 'SPOUSE'
  | 'DYNASTIC_SUCCESSOR'
  | 'QUEEN_MOTHER_STOOL_PAIR'
  | 'FEKUO_SUB_STOOL';

export interface EstablishRelationshipInput {
  person1Id: number;
  person2Id: number;
  category: RelationshipCategory | string;
  relationshipType?: string;
  subtype?: string;
  traditionalRole?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  notes?: string | null;
}

/**
 * Establishes a validated relationship between two entities adhering to Akan customary,
 * biological, and peer-succession rules.
 */
export async function establishRelationship(data: EstablishRelationshipInput): Promise<Relationship> {
  const p1Id = Number(data.person1Id);
  const p2Id = Number(data.person2Id);
  const category = (data.category || 'PARENT_CHILD').toUpperCase() as RelationshipCategory;

  if (p1Id === p2Id) {
    throw new Error("Validation Error: Cannot establish a relationship between a person and themselves.");
  }

  const p1 = await prisma.person.findUnique({ where: { person_id: p1Id } });
  const p2 = await prisma.person.findUnique({ where: { person_id: p2Id } });

  if (!p1 || !p2) {
    throw new Error(`Validation Error: Person ${!p1 ? p1Id : p2Id} not found.`);
  }

  let type = data.relationshipType || 'Parent-Child';
  let subtype = data.subtype || 'Biological';

  // Validation rules by category
  if (category === 'DYNASTIC_SUCCESSOR') {
    type = 'Dynastic Peer Link';
    subtype = 'Succession';
    // Sovereign Equality Rule:
    // Link horizontally as peers. Do NOT set fatherId or motherId.
    // Update predecessorId on Person2 pointing to Person1, and successorId on Person1 pointing to Person2.
    await prisma.person.update({
      where: { person_id: p2Id },
      data: { predecessorId: p1Id }
    });
    await prisma.person.update({
      where: { person_id: p1Id },
      data: { successorId: p2Id }
    });
  } else if (category === 'PARENT_CHILD') {
    type = 'Parent-Child';
    subtype = data.subtype || 'Biological';

    // Bi-directional Graph Protection: Prevent circular biological parent links
    const isP2AncestorOfP1 = await checkIsDescendant(p2Id, p1Id);
    if (isP2AncestorOfP1) {
      throw new Error(`Graph Cycle Error: Cannot set Person ${p1Id} as parent of Person ${p2Id} because Person ${p1Id} is already a descendant of Person ${p2Id}.`);
    }

    if (p1.gender === 'Female') {
      await prisma.person.update({
        where: { person_id: p2Id },
        data: {
          motherId: p1Id,
          // Matrilineal Bloodline Rule: automatically classify child into mother's Abusua (Clan)
          ...(p1.clan_id ? { clan_id: p1.clan_id } : {})
        }
      });
    } else if (p1.gender === 'Male') {
      await prisma.person.update({
        where: { person_id: p2Id },
        data: { fatherId: p1Id }
      });
    }
  } else if (category === 'QUEEN_MOTHER_STOOL_PAIR') {
    type = 'Stool Counterpart Pair';
    subtype = 'Traditional Pairing';
  } else if (category === 'FEKUO_SUB_STOOL') {
    type = 'Divisional Wing Link';
    subtype = 'Fekuo';
  } else if (category === 'SIBLING') {
    type = 'Sibling';
    subtype = data.subtype || 'Biological';
  } else if (category === 'SPOUSE') {
    type = 'Spouse';
    subtype = 'Marriage';
  }

  const relationship = await prisma.relationship.upsert({
    where: {
      person_pair_category_unique: {
        person_id_1: p1Id,
        person_id_2: p2Id,
        category: category as any
      }
    },
    update: {
      relationship_type: type,
      subtype: subtype,
      traditionalRole: data.traditionalRole || null,
      start_date: data.startDate ? new Date(data.startDate) : null,
      end_date: data.endDate ? new Date(data.endDate) : null,
      notes: data.notes || null
    },
    create: {
      person_id_1: p1Id,
      person_id_2: p2Id,
      category: category as any,
      relationship_type: type,
      subtype: subtype,
      traditionalRole: data.traditionalRole || null,
      start_date: data.startDate ? new Date(data.startDate) : null,
      end_date: data.endDate ? new Date(data.endDate) : null,
      notes: data.notes || null
    }
  });

  return relationship;
}

/**
 * Evaluates titles/status of person1 and person2 to return recommended relationship types.
 */
export async function getAvailableRelationshipTypes(person1Id: number, person2Id: number) {
  const p1 = await prisma.person.findUnique({ where: { person_id: person1Id } });
  const p2 = await prisma.person.findUnique({ where: { person_id: person2Id } });

  if (!p1 || !p2) {
    throw new Error("Validation Error: One or both persons not found.");
  }

  const p1IsRoyal = Boolean(p1.dynasticNumber !== null || p1.profession === 'Asantehene' || p1.first_name?.includes('Otumfuo') || p1.first_name?.includes('Asantehemaa') || (p1.bio && p1.bio.includes('Asantehene')));
  const p2IsRoyal = Boolean(p2.dynasticNumber !== null || p2.profession === 'Asantehene' || p2.first_name?.includes('Otumfuo') || p2.first_name?.includes('Asantehemaa') || (p2.bio && p2.bio.includes('Asantehene')));

  const recommendedCategories: string[] = [];
  if (p1IsRoyal && p2IsRoyal) {
    recommendedCategories.push('DYNASTIC_SUCCESSOR', 'QUEEN_MOTHER_STOOL_PAIR', 'FEKUO_SUB_STOOL');
  } else {
    recommendedCategories.push('PARENT_CHILD', 'SIBLING', 'SPOUSE');
  }

  return {
    person1: { id: p1.person_id, name: p1.fullName || `${p1.first_name} ${p1.last_name}`, isRoyal: p1IsRoyal },
    person2: { id: p2.person_id, name: p2.fullName || `${p2.first_name} ${p2.last_name}`, isRoyal: p2IsRoyal },
    recommendedCategories,
    allCategories: [
      { category: 'PARENT_CHILD', label: 'Parent-Child', description: 'Biological or adoptive parent to child relationship' },
      { category: 'SIBLING', label: 'Sibling', description: 'Maternal or paternal brother/sister link' },
      { category: 'SPOUSE', label: 'Spouse', description: 'Marriage or marital partnership link' },
      { category: 'DYNASTIC_SUCCESSOR', label: 'Dynastic Successor', description: 'Horizontal peer link on Golden Stool (Predecessor -> Successor)' },
      { category: 'QUEEN_MOTHER_STOOL_PAIR', label: 'Stool Counterpart (Chief & Queen Mother)', description: 'Structural pairing of male Chief and female Queen Mother' },
      { category: 'FEKUO_SUB_STOOL', label: 'Divisional Sub-Stool (Fekuo)', description: 'Paramountcy to divisional wing or sub-stool link' }
    ]
  };
}

/**
 * Lists all relationships for a person (both as person_id_1 and person_id_2).
 */
export async function getRelationshipsForPerson(personId: number): Promise<any[]> {
  const rels = await prisma.relationship.findMany({
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
export async function getImmediateFamily(personId: number): Promise<ImmediateFamilyPayload> {
  const target = await prisma.person.findUnique({ where: { person_id: personId } });
  if (!target) {
    throw new Error(`Not Found: Person with ID ${personId} does not exist.`);
  }

  // 1. Fetch parents / superiors
  const parentRelations = await prisma.relationship.findMany({
    where: {
      person_id_2: personId,
      relationship_type: { in: HIERARCHICAL_RELATIONSHIP_TYPES }
    },
    include: {
      person_1: true
    }
  });
  const parents = parentRelations.map(r => r.person_1);

  // 2. Fetch children / subordinates
  const childRelations = await prisma.relationship.findMany({
    where: {
      person_id_1: personId,
      relationship_type: { in: HIERARCHICAL_RELATIONSHIP_TYPES }
    },
    include: {
      person_2: true
    }
  });
  const children = childRelations.map(r => r.person_2);

  // 3. Fetch spouses/partners
  const partnerRelations = await prisma.relationship.findMany({
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

  const spouses: Person[] = [];
  const partners: Person[] = [];

  for (const rel of partnerRelations) {
    const other = rel.person_id_1 === personId ? rel.person_2 : rel.person_1;
    if (rel.relationship_type === 'Spouse') {
      spouses.push(other);
    } else {
      partners.push(other);
    }
  }

  // 4. Fetch siblings and classify (Full vs. Half)
  const parentIds = parents.map(p => p.person_id);
  const siblings: SiblingNode[] = [];

  if (parentIds.length > 0) {
    const siblingRelations = await prisma.relationship.findMany({
      where: {
        person_id_1: { in: parentIds },
        relationship_type: { in: HIERARCHICAL_RELATIONSHIP_TYPES },
        person_id_2: { not: personId }
      },
      select: {
        person_id_2: true
      }
    });

    const siblingIds = Array.from(new Set(siblingRelations.map(r => r.person_id_2)));

    if (siblingIds.length > 0) {
      const siblingsWithParents = await prisma.person.findMany({
        where: { person_id: { in: siblingIds } },
        include: {
          relationships2: {
            where: { relationship_type: { in: HIERARCHICAL_RELATIONSHIP_TYPES } },
            select: { person_id_1: true }
          }
        }
      });

      for (const sib of siblingsWithParents) {
        const sibParentIds = sib.relationships2.map(r => r.person_id_1);
        const overlap = sibParentIds.filter(id => parentIds.includes(id)).length;
        
        let type: 'Full-Sibling' | 'Half-Sibling' = 'Half-Sibling';
        if (parentIds.length >= 2) {
          if (overlap >= 2) {
            type = 'Full-Sibling';
          }
        } else {
          if (overlap === 1 && sibParentIds.length === 1) {
            type = 'Full-Sibling';
          }
        }

        const { relationships2, ...cleanPerson } = sib;
        siblings.push({
          person: cleanPerson as Person,
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
export async function getAncestors(personId: number, maxGenerations: number): Promise<TreeBranchNode[]> {
  const target = await prisma.person.findUnique({ where: { person_id: personId } });
  if (!target) {
    throw new Error(`Not Found: Person with ID ${personId} does not exist.`);
  }

  const rawAncestors = await prisma.$queryRaw<any[]>`
    WITH RECURSIVE AncestorTree AS (
      SELECT 
        person_id, first_name, last_name, maiden_name, gender, 
        birth_date, birth_place, death_date, death_place, is_living, bio,
        0 AS generation,
        CAST(NULL AS INTEGER) AS child_id
      FROM "Person"
      WHERE person_id = ${personId}

      UNION ALL

      SELECT 
        p.person_id, p.first_name, p.last_name, p.maiden_name, p.gender, 
        p.birth_date, p.birth_place, p.death_date, p.death_place, p.is_living, p.bio,
        at.generation + 1 AS generation,
        at.person_id AS child_id
      FROM "Person" p
      JOIN "Relationship" r ON (r.person_id_1 = p.person_id AND r.relationship_type IN ('Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)'))
      JOIN AncestorTree at ON at.person_id = r.person_id_2
      WHERE at.generation < ${maxGenerations}
        -- Exclude linking peer kings as parent-child unless explicit biological relationship exists
        AND NOT (
          (p."dynasticNumber" IS NOT NULL OR p.profession = 'Asantehene')
          AND r.subtype != 'Biological'
        )
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
export async function getDescendants(personId: number, maxGenerations: number): Promise<TreeBranchNode[]> {
  const target = await prisma.person.findUnique({ where: { person_id: personId } });
  if (!target) {
    throw new Error(`Not Found: Person with ID ${personId} does not exist.`);
  }

  const rawDescendants = await prisma.$queryRaw<any[]>`
    WITH RECURSIVE DescendantTree AS (
      SELECT 
        person_id, first_name, last_name, maiden_name, gender, 
        birth_date, birth_place, death_date, death_place, is_living, bio,
        0 AS generation,
        CAST(NULL AS INTEGER) AS parent_id
      FROM "Person"
      WHERE person_id = ${personId}

      UNION ALL

      SELECT 
        p.person_id, p.first_name, p.last_name, p.maiden_name, p.gender, 
        p.birth_date, p.birth_place, p.death_date, p.death_place, p.is_living, p.bio,
        dt.generation + 1 AS generation,
        dt.person_id AS parent_id
      FROM "Person" p
      JOIN "Relationship" r ON (r.person_id_2 = p.person_id AND r.relationship_type IN ('Parent-Child', 'Traditional Command (Chiefs)', 'Traditional Command (Queen Mothers)'))
      JOIN DescendantTree dt ON dt.person_id = r.person_id_1
      WHERE dt.generation < ${maxGenerations}
        -- Exclude linking peer kings as parent-child unless explicit biological relationship exists
        AND NOT (
          (p."dynasticNumber" IS NOT NULL OR p.profession = 'Asantehene')
          AND r.subtype != 'Biological'
        )
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
export async function listPeople(): Promise<Person[]> {
  return await prisma.person.findMany({
    orderBy: { first_name: 'asc' }
  });
}

/**
 * Delete a person by ID.
 */
export async function deletePerson(id: number): Promise<Person> {
  const existing = await prisma.person.findUnique({ where: { person_id: id } });
  if (!existing) {
    throw new Error(`Not Found: Person with ID ${id} does not exist.`);
  }

  // Delete relationships and sources referencing this person first if needed, though schema has Cascade
  await prisma.relationship.deleteMany({
    where: {
      OR: [
        { person_id_1: id },
        { person_id_2: id }
      ]
    }
  });

  await prisma.source.deleteMany({
    where: { person_id: id }
  });

  return await prisma.person.delete({
    where: { person_id: id }
  });
}

/**
 * ROYAL TREE MANAGEMENT SYSTEM FUNCTIONS
 */

export async function getClans() {
  return await prisma.clan.findMany({ orderBy: { name: 'asc' } });
}

export async function getRegions() {
  return await prisma.region.findMany({ orderBy: { name: 'asc' } });
}

export async function getParamountcies() {
  return await prisma.paramountcy.findMany({
    include: { region: true },
    orderBy: { name: 'asc' }
  });
}

export async function getSubStools() {
  return await prisma.subStool.findMany({
    include: { paramountcy: true },
    orderBy: { name: 'asc' }
  });
}

// Regions CRUD
export async function createRegion(name: string) {
  return await prisma.region.create({ data: { name } });
}
export async function updateRegion(id: number, name: string) {
  return await prisma.region.update({ where: { id }, data: { name } });
}
export async function deleteRegion(id: number) {
  // Strict rejection: check if there are any paramountcies attached
  const count = await prisma.paramountcy.count({ where: { region_id: id } });
  if (count > 0) throw new Error(`Cannot delete region. It has ${count} associated paramountcies.`);
  return await prisma.region.delete({ where: { id } });
}

// Paramountcies CRUD
export async function createParamountcy(name: string, regionId: number) {
  return await prisma.paramountcy.create({ data: { name, region_id: regionId } });
}
export async function updateParamountcy(id: number, name: string, regionId: number) {
  return await prisma.paramountcy.update({ where: { id }, data: { name, region_id: regionId } });
}
export async function deleteParamountcy(id: number) {
  // Strict rejection: check if there are any sub-stools attached
  const count = await prisma.subStool.count({ where: { paramountcy_id: id } });
  if (count > 0) throw new Error(`Cannot delete paramountcy. It has ${count} associated sub-stools.`);
  return await prisma.paramountcy.delete({ where: { id } });
}

// Sub-Stools CRUD
export async function createSubStool(name: string, paramountcyId: number) {
  return await prisma.subStool.create({ data: { name, paramountcy_id: paramountcyId } });
}
export async function updateSubStool(id: number, name: string, paramountcyId: number) {
  return await prisma.subStool.update({ where: { id }, data: { name, paramountcy_id: paramountcyId } });
}
export async function deleteSubStool(id: number) {
  return await prisma.subStool.delete({ where: { id } });
}

// Marriage CRUD
export async function createMarriage(spouse1Id: number, spouse2Id: number, marriageDate?: Date | string | null, marriagePlace?: string | null) {
  if (spouse1Id === spouse2Id) {
    throw new Error("Validation Error: Cannot establish marriage between the same person.");
  }
  const person1 = await prisma.person.findUnique({ where: { person_id: spouse1Id } });
  const person2 = await prisma.person.findUnique({ where: { person_id: spouse2Id } });

  if (!person1 || !person2) {
    throw new Error(`Validation Error: One or both spouses do not exist. IDs: ${spouse1Id}, ${spouse2Id}`);
  }

  return await prisma.marriage.create({
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

export async function listMarriagesForPerson(personId: number) {
  return await prisma.marriage.findMany({
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

export async function deleteMarriage(id: number) {
  return await prisma.marriage.delete({ where: { id } });
}

// Royal Ancestors Lookups
export async function getAsantehenes(): Promise<Person[]> {
  return await prisma.person.findMany({
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

export async function getAsantehemaas(): Promise<Person[]> {
  return await prisma.person.findMany({
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

/**
 * Traverses upward and sideways through motherId and maternal siblings (Oyoko Abusua matrilineal line).
 */
export interface MatrilinealTreeNode {
  person: Person;
  mother?: MatrilinealTreeNode | null;
  maternalSiblings: Person[];
  maternalAncestors: Person[];
  clan?: any;
}

export async function getMatrilinealTree(personId: number): Promise<MatrilinealTreeNode> {
  const targetPerson = await prisma.person.findUnique({
    where: { person_id: personId },
    include: {
      mother: {
        include: {
          mother: true,
          clan: true
        }
      },
      clan: true
    }
  });

  if (!targetPerson) {
    throw new Error(`Validation Error: Person with ID ${personId} not found.`);
  }

  // 1. Gather all maternal ancestors by traversing motherId upwards
  const maternalAncestors: Person[] = [];
  let currentMotherId = targetPerson.motherId;
  const visitedAncestors = new Set<number>();

  while (currentMotherId && !visitedAncestors.has(currentMotherId)) {
    visitedAncestors.add(currentMotherId);
    const motherPerson = await prisma.person.findUnique({
      where: { person_id: currentMotherId },
      include: { clan: true }
    });
    if (motherPerson) {
      maternalAncestors.push(motherPerson);
      currentMotherId = motherPerson.motherId;
    } else {
      break;
    }
  }

  // 2. Gather maternal siblings (persons who share targetPerson's motherId)
  let maternalSiblings: Person[] = [];
  if (targetPerson.motherId) {
    maternalSiblings = await prisma.person.findMany({
      where: {
        motherId: targetPerson.motherId,
        person_id: { not: targetPerson.person_id }
      },
      include: { clan: true }
    });
  }

  // 3. Construct recursive mother node if mother exists
  let motherNode: MatrilinealTreeNode | null = null;
  if (targetPerson.mother) {
    const mothersSiblings = targetPerson.mother.motherId
      ? await prisma.person.findMany({
          where: {
            motherId: targetPerson.mother.motherId,
            person_id: { not: targetPerson.mother.person_id }
          },
          include: { clan: true }
        })
      : [];

    motherNode = {
      person: targetPerson.mother,
      mother: null,
      maternalSiblings: mothersSiblings,
      maternalAncestors: maternalAncestors.slice(1),
      clan: (targetPerson.mother as any).clan
    };
  }

  return {
    person: targetPerson,
    mother: motherNode,
    maternalSiblings,
    maternalAncestors,
    clan: targetPerson.clan
  };
}

/**
 * Returns an ordered array of Asantehenes linked sequentially from dynasticOrder 1 to 16
 * with predecessor/successor metadata.
 */
export async function getDynasticSuccessionChain() {
  const asantehenes = await prisma.person.findMany({
    where: {
      dynasticOrder: { not: null }
    },
    orderBy: {
      dynasticOrder: 'asc'
    },
    include: {
      predecessor: {
        select: {
          person_id: true,
          fullName: true,
          first_name: true,
          last_name: true,
          dynasticOrder: true,
          reignStartYear: true,
          reignEndYear: true
        }
      },
      successor: {
        select: {
          person_id: true,
          fullName: true,
          first_name: true,
          last_name: true,
          dynasticOrder: true,
          reignStartYear: true,
          reignEndYear: true
        }
      },
      mother: {
        select: {
          person_id: true,
          fullName: true,
          first_name: true,
          last_name: true
        }
      },
      clan: true
    }
  });

  if (asantehenes.length === 0) {
    const fallbackRoyals = await prisma.person.findMany({
      where: {
        OR: [
          { bio: { contains: 'Asantehene' } },
          { profession: { contains: 'Asantehene' } },
          { first_name: { contains: 'Otumfuo' } }
        ]
      },
      orderBy: { person_id: 'asc' },
      include: {
        predecessor: true,
        successor: true,
        mother: true,
        clan: true
      }
    });
    return fallbackRoyals;
  }

  return asantehenes;
}

export interface AsantehenePeerNode {
  dynasticNumber: number;
  dynasticOrder: number;
  personId: number;
  fullName: string;
  reignDates: string;
  reignStartYear: number | null;
  reignEndYear: number | null;
  predecessorId: number | null;
  successorId: number | null;
  mother: {
    personId: number;
    fullName: string;
  } | null;
  clan: {
    id: number;
    name: string;
  } | null;
  bio: string | null;
  layout: {
    displayMode: 'horizontal-peer';
    positionIndex: number;
  };
}

/**
 * Returns all Asantehenes ordered by dynasticNumber (1 to 16) with their reign dates
 * and predecessor/successor IDs, explicitly formatted for horizontal UI rendering.
 */
export async function getDynasticPeerChain(): Promise<AsantehenePeerNode[]> {
  const asantehenes = await prisma.person.findMany({
    where: {
      OR: [
        { dynasticNumber: { not: null } },
        { dynasticOrder: { not: null } },
        { profession: 'Asantehene' }
      ]
    },
    orderBy: [
      { dynasticNumber: 'asc' },
      { dynasticOrder: 'asc' }
    ],
    include: {
      mother: {
        select: {
          person_id: true,
          fullName: true,
          first_name: true,
          last_name: true
        }
      },
      clan: true
    }
  });

  return asantehenes.map((a, idx) => {
    const num = a.dynasticNumber || a.dynasticOrder || (idx + 1);
    const startStr = a.reignStartYear ? String(a.reignStartYear) : '?';
    const endStr = a.reignEndYear ? (a.reignEndYear === 2026 ? 'Present' : String(a.reignEndYear)) : '?';

    return {
      dynasticNumber: num,
      dynasticOrder: num,
      personId: a.person_id,
      fullName: a.fullName || `${a.first_name} ${a.last_name}`.trim(),
      reignDates: `${startStr} – ${endStr}`,
      reignStartYear: a.reignStartYear,
      reignEndYear: a.reignEndYear,
      predecessorId: a.predecessorId,
      successorId: a.successorId,
      mother: a.mother ? {
        personId: a.mother.person_id,
        fullName: a.mother.fullName || `${a.mother.first_name} ${a.mother.last_name}`.trim()
      } : null,
      clan: a.clan ? {
        id: a.clan.id,
        name: a.clan.name
      } : null,
      bio: a.bio,
      layout: {
        displayMode: 'horizontal-peer',
        positionIndex: num
      }
    };
  });
}


