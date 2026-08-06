import { prisma, addPerson, addRelationship, getImmediateFamily, getAncestors, getDescendants } from './src/services/familyService';
import { generateLineageSummary, runDataIntegrityCheck, compileBiographicalTimeline } from './src/services/reportService';

async function main() {
  console.log("🧹 Cleaning database...");
  await prisma.relationship.deleteMany({});
  await prisma.person.deleteMany({});
  console.log("✅ Database clean.");

  console.log("\n🌱 Seeding 3 Generations of Family Tree...");

  // Generation 1 (Grandparents)
  const g1Grandpa = await addPerson({
    first_name: "John",
    last_name: "Smith",
    maiden_name: null,
    gender: "Male",
    birth_date: new Date("1920-01-15"),
    birth_place: "New York, USA",
    death_date: new Date("1995-10-22"),
    death_place: "Boston, USA",
    is_living: false,
    bio: "Family patriarch. Served in WWII."
  });

  const g1Grandma = await addPerson({
    first_name: "Jane",
    last_name: "Smith",
    maiden_name: "Miller",
    gender: "Female",
    birth_date: new Date("1925-06-10"),
    birth_place: "Chicago, USA",
    death_date: new Date("2010-04-05"),
    death_place: "Boston, USA",
    is_living: false,
    bio: "Loving grandmother. Professional pianist."
  });

  // Link G1 Grandparents as Spouses
  await addRelationship(g1Grandpa.person_id, g1Grandma.person_id, "Spouse", "None", "Married", "1945-09-20");

  // Generation 2 (Parents & Uncles/Aunts)
  const g2Father = await addPerson({
    first_name: "Robert",
    last_name: "Smith",
    maiden_name: null,
    gender: "Male",
    birth_date: new Date("1950-03-12"),
    birth_place: "Boston, USA",
    death_date: null,
    death_place: null,
    is_living: true,
    bio: "Software engineer in the early days of personal computing."
  });

  const g2Uncle = await addPerson({
    first_name: "Thomas",
    last_name: "Smith",
    maiden_name: null,
    gender: "Male",
    birth_date: new Date("1953-08-25"),
    birth_place: "Boston, USA",
    death_date: null,
    death_place: null,
    is_living: true,
    bio: "World traveler and photographer."
  });

  // Link G1 to G2 children
  await addRelationship(g1Grandpa.person_id, g2Father.person_id, "Parent-Child", "Biological");
  await addRelationship(g1Grandma.person_id, g2Father.person_id, "Parent-Child", "Biological");
  await addRelationship(g1Grandpa.person_id, g2Uncle.person_id, "Parent-Child", "Biological");
  await addRelationship(g1Grandma.person_id, g2Uncle.person_id, "Parent-Child", "Biological");

  // Mother (joins the family)
  const g2Mother = await addPerson({
    first_name: "Sarah",
    last_name: "Smith",
    maiden_name: "Jones",
    gender: "Female",
    birth_date: new Date("1952-11-04"),
    birth_place: "London, UK",
    death_date: null,
    death_place: null,
    is_living: true,
    bio: "University professor of history."
  });

  // Sarah's other partner (for half-sibling tests)
  const g2OtherPartner = await addPerson({
    first_name: "Jack",
    last_name: "Miller",
    gender: "Male",
    birth_date: new Date("1950-05-05"),
    is_living: true,
    bio: "Local chef."
  });

  // Link G2 Father and Mother
  await addRelationship(g2Father.person_id, g2Mother.person_id, "Spouse", "None", "Married", "1975-06-14");

  // Generation 3 (Children)
  const g3Target = await addPerson({
    first_name: "Alice",
    last_name: "Smith",
    maiden_name: null,
    gender: "Female",
    birth_date: new Date("1980-07-20"),
    birth_place: "San Francisco, USA",
    death_date: null,
    death_place: null,
    is_living: true,
    bio: "Alice, our main target child."
  });

  const g3FullSibling = await addPerson({
    first_name: "Ben",
    last_name: "Smith",
    maiden_name: null,
    gender: "Male",
    birth_date: new Date("1983-09-12"),
    is_living: true,
    bio: "Alice's full brother."
  });

  const g3HalfSibling = await addPerson({
    first_name: "Clara",
    last_name: "Miller",
    maiden_name: null,
    gender: "Female",
    birth_date: new Date("1988-02-28"),
    is_living: true,
    bio: "Alice's half sister via Sarah & Jack."
  });

  // Link G2 Parents to Alice (Target) & Ben (Full Sibling)
  await addRelationship(g2Father.person_id, g3Target.person_id, "Parent-Child", "Biological");
  await addRelationship(g2Mother.person_id, g3Target.person_id, "Parent-Child", "Biological");
  await addRelationship(g2Father.person_id, g3FullSibling.person_id, "Parent-Child", "Biological");
  await addRelationship(g2Mother.person_id, g3FullSibling.person_id, "Parent-Child", "Biological");

  // Link G2 Mother Sarah and Jack Miller to Clara (Half Sibling)
  await addRelationship(g2Mother.person_id, g3HalfSibling.person_id, "Parent-Child", "Biological");
  await addRelationship(g2OtherPartner.person_id, g3HalfSibling.person_id, "Parent-Child", "Biological");

  console.log("✅ Seed complete.");

  console.log("\n🧪 Running Business Rule Validation Tests...");

  // Test 1: Self-loop Prevention
  try {
    console.log("🔄 Test 1: Attempting self-loop relationship...");
    await addRelationship(g3Target.person_id, g3Target.person_id, "Spouse", "None");
    console.error("❌ Test 1 Failed: Self-loop was allowed.");
  } catch (error: any) {
    console.log(`✅ Test 1 Success: Self-loop rejected with message: "${error.message}"`);
  }

  // Test 2: Graph Cycle Detection
  try {
    console.log("🔄 Test 2: Attempting cycle (make G2 Father Robert a child of G3 Alice)...");
    await addRelationship(g3Target.person_id, g2Father.person_id, "Parent-Child", "Biological");
    console.error("❌ Test 2 Failed: Cycle was allowed.");
  } catch (error: any) {
    console.log(`✅ Test 2 Success: Cycle rejected with message: "${error.message}"`);
  }

  // Test 3: Chronological rule 1 (parent born after child)
  try {
    console.log("🔄 Test 3: Attempting parent born after child...");
    const badParent = await addPerson({
      first_name: "Younger",
      last_name: "Parent",
      gender: "Male",
      birth_date: new Date("2000-01-01"),
      is_living: true
    });
    // Link g3Target (born 1980) as child of badParent (born 2000)
    await addRelationship(badParent.person_id, g3Target.person_id, "Parent-Child", "Biological");
    console.error("❌ Test 3 Failed: Chronological error was allowed.");
  } catch (error: any) {
    console.log(`✅ Test 3 Success: Chronological error rejected with message: "${error.message}"`);
  }

  // Test 4: Chronological rule 2 (child born > 9 months after parent death)
  try {
    console.log("🔄 Test 4: Attempting child born > 9 months after parent death...");
    const deadParent = await addPerson({
      first_name: "Passed",
      last_name: "Parent",
      gender: "Male",
      birth_date: new Date("1930-01-01"),
      death_date: new Date("1970-01-01"),
      is_living: false
    });
    // Link deadParent (died 1970) as parent of g3Target (born 1980)
    await addRelationship(deadParent.person_id, g3Target.person_id, "Parent-Child", "Biological");
    console.error("❌ Test 4 Failed: Death chronological check allowed.");
  } catch (error: any) {
    console.log(`✅ Test 4 Success: Death chronological check rejected with message: "${error.message}"`);
  }

  // Test 5: Duplicate Relationship Check
  try {
    console.log("🔄 Test 5: Attempting duplicate relationship...");
    // Robert and Sarah are already spouses. Let's try adding again.
    await addRelationship(g2Father.person_id, g2Mother.person_id, "Spouse", "None");
    console.error("❌ Test 5 Failed: Duplicate was allowed.");
  } catch (error: any) {
    console.log(`✅ Test 5 Success: Duplicate rejected with message: "${error.message}"`);
  }

  console.log("\n📊 Dumping Service Output JSONs...");

  // Retrieve Immediate Family for Alice (G3 Target)
  console.log("\n🏠 Immediate Family Payload for Alice:");
  const aliceFamily = await getImmediateFamily(g3Target.person_id);
  console.log(JSON.stringify(aliceFamily, null, 2));

  // Retrieve Ancestors for Alice (G3 Target)
  console.log("\n🌳 Ancestors Payload for Alice (maxGenerations: 5):");
  const aliceAncestors = await getAncestors(g3Target.person_id, 5);
  console.log(JSON.stringify(aliceAncestors, null, 2));

  // Retrieve Descendants for Grandpa John Smith (G1)
  console.log("\n🍁 Descendants Payload for John Smith (maxGenerations: 5):");
  const johnDescendants = await getDescendants(g1Grandpa.person_id, 5);
  console.log(JSON.stringify(johnDescendants, null, 2));

  console.log("\n📊 Running Reporting Service Tests...");

  // 1. Lineage Summary Test
  console.log("\n📈 Lineage Summary for Alice:");
  const aliceSummary = await generateLineageSummary(g3Target.person_id);
  console.log(JSON.stringify(aliceSummary, null, 2));

  // 2. Data Integrity Check Test
  console.log("\n📋 Data Integrity Scan Results:");
  const integrityReport = await runDataIntegrityCheck();
  console.log(JSON.stringify(integrityReport, null, 2));

  // 3. Biographical Timeline Test
  console.log("\n📅 Biographical Timeline for Alice:");
  const aliceTimeline = await compileBiographicalTimeline(g3Target.person_id);
  console.log(JSON.stringify(aliceTimeline, null, 2));

  console.log("\n🏁 Validation Suite and Reports Complete.");
}

main()
  .catch(err => {
    console.error("🔴 Test execution encountered crash error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
