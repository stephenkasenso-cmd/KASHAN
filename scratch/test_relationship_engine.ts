import { prisma, establishRelationship } from '../src/services/familyService';

async function verifyRelationshipEngine() {
  console.log("🧪 Verifying Relationship Validation Engine Rules...\n");

  // Test 1: Establish DYNASTIC_SUCCESSOR link between Otumfuo Opoku Ware II (9015) and Otumfuo Osei Tutu II (9016)
  console.log("1. Establishing DYNASTIC_SUCCESSOR link between Otumfuo Opoku Ware II and Otumfuo Osei Tutu II...");
  const dynasticRel = await establishRelationship({
    person1Id: 9015,
    person2Id: 9016,
    category: 'DYNASTIC_SUCCESSOR',
    traditionalRole: '16th Asantehene Enstoolment',
    notes: 'Horizontal peer succession on Golden Stool'
  });
  console.log("  ✅ Dynastic Relationship Created:", dynasticRel.category, dynasticRel.relationship_type);

  const k1 = await prisma.person.findUnique({ where: { person_id: 9015 } });
  const k2 = await prisma.person.findUnique({ where: { person_id: 9016 } });

  console.log("  🔍 Sovereign Equality Check:");
  console.log(`     King 1 (Opoku Ware II) fatherId: ${k1?.fatherId}, successorId: ${k1?.successorId}`);
  console.log(`     King 2 (Osei Tutu II) fatherId: ${k2?.fatherId}, predecessorId: ${k2?.predecessorId}`);
  if (k2?.fatherId === 9015) {
    console.error("  ❌ FAILED: fatherId was incorrectly set for peer kings.");
  } else {
    console.log("  ✅ PASSED: fatherId was NOT modified. Peer kings remain equal sovereign nodes.");
  }

  // Test 2: Establish PARENT_CHILD mother link between Nana Afia Kobi Serwaa Ampem II and Otumfuo Osei Tutu II
  console.log("\n2. Establishing PARENT_CHILD link for Nana Afia Kobi Serwaa Ampem II (Asantehemaa) -> Otumfuo Osei Tutu II...");
  const oyokoClan = await prisma.clan.findFirst({ where: { name: { contains: 'yoko' } } });

  const queenMother = await prisma.person.upsert({
    where: { person_id: 9910 },
    update: { clan_id: oyokoClan?.id },
    create: {
      person_id: 9910,
      first_name: 'Nana Afia Kobi',
      last_name: 'Serwaa Ampem II',
      fullName: 'Nana Afia Kobi Serwaa Ampem II',
      gender: 'Female',
      is_living: false,
      clan_id: oyokoClan?.id,
      bio: '13th Asantehemaa of the Asante Kingdom'
    }
  });

  const motherChildRel = await establishRelationship({
    person1Id: queenMother.person_id,
    person2Id: 9016,
    category: 'PARENT_CHILD',
    subtype: 'Biological'
  });
  console.log("  ✅ Mother-Child Relationship Created:", motherChildRel.category);

  const k2Updated = await prisma.person.findUnique({ where: { person_id: 9016 } });
  console.log("  🔍 Matrilineal Inheritance Check:");
  console.log(`     Osei Tutu II motherId: ${k2Updated?.motherId}`);
  console.log(`     Osei Tutu II clan_id: ${k2Updated?.clan_id} (Oyoko Clan ID: ${oyokoClan?.id})`);

  if (k2Updated?.motherId === queenMother.person_id && k2Updated?.clan_id === oyokoClan?.id) {
    console.log("  ✅ PASSED: Child correctly inherited mother's Abusua (Oyoko Clan).");
  } else {
    console.error("  ❌ FAILED: Matrilineal clan inheritance check failed.");
  }

  console.log("\n🏁 All Relationship Engine Verification Tests Complete.");
}

verifyRelationshipEngine()
  .catch(err => console.error("🔴 Error:", err))
  .finally(() => prisma.$disconnect());
