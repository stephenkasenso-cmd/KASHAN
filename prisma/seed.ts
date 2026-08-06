import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Royal Tree Management System Data...');

  // 1. Seed 8 Abusua Clans
  const clans = [
    { name: 'Aduana', totem: 'Dog / Fire' },
    { name: 'Agona', totem: 'Parrot' },
    { name: 'Asakyiri', totem: 'Vulture' },
    { name: 'Aseneɛ', totem: 'Bat' },
    { name: 'Asona', totem: 'Crow / Wild Boar' },
    { name: 'Bretuo', totem: 'Leopard' },
    { name: 'Ɛkoɔna', totem: 'Buffalo' },
    { name: 'Ɔyokoɔ', totem: 'Falcon / Hawk' },
  ];

  for (const clan of clans) {
    await prisma.clan.upsert({
      where: { name: clan.name },
      update: {},
      create: clan,
    });
  }

  // 2. Seed 16 Regions
  const regions = [
    'Ahafo Region',
    'Ashanti Region',
    'Bono Region',
    'Bono East Region',
    'Central Region',
    'Eastern Region',
    'Greater Accra Region',
    'North East Region',
    'Northern Region',
    'Oti Region',
    'Savannah Region',
    'Upper East Region',
    'Upper West Region',
    'Volta Region',
    'Western Region',
    'Western North Region'
  ];

  for (const regionName of regions) {
    await prisma.region.upsert({
      where: { name: regionName },
      update: {},
      create: { name: regionName },
    });
  }

  // 3. Seed Asanteman Paramountcies (Ashanti Region)
  const ashantiRegion = await prisma.region.findUnique({ where: { name: 'Ashanti Region' } });
  if (ashantiRegion) {
    const paramountcies = [
      'Kumasi Traditional Council (Asantehene)',
      'Mampong Traditional Council',
      'Juaben Traditional Council',
      'Bekwai Traditional Council',
      'Kokofu Traditional Council',
      'Nsuta Traditional Council',
      'Ejisu Traditional Council',
      'Offinso Traditional Council',
      'Essumeja Traditional Council',
      'Agona Traditional Council',
      'Manso Nkwanta Traditional Council',
      'Tafo Traditional Council'
    ];

    for (const pName of paramountcies) {
      const existing = await prisma.paramountcy.findFirst({
        where: { name: pName, region_id: ashantiRegion.id }
      });
      if (!existing) {
        await prisma.paramountcy.create({
          data: {
            name: pName,
            region_id: ashantiRegion.id
          }
        });
      }
    }
  }

  // 4. Seed All 16 Asantehenes (Monarchs of Asanteman) into Person table
  const asantehenes = [
    { first_name: "Otumfuo Nana", last_name: "Osei Tutu I", fullName: "Otumfuo Nana Osei Tutu I", gender: "Male", is_living: false, birth_place: "Kokofu", death_place: "Kumasi", bio: "1st Asantehene (1680/1695–1717). Founder of the Asante Kingdom alongside Okomfo Anokye." },
    { first_name: "Otumfuo Nana", last_name: "Opoku Ware I", fullName: "Otumfuo Nana Opoku Ware I", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "2nd Asantehene (1720–1750). Greatly expanded the territorial borders of Asanteman." },
    { first_name: "Otumfuo Nana", last_name: "Kusi Oboadum", fullName: "Otumfuo Nana Kusi Oboadum", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "3rd Asantehene (1750–1764). Focused on diplomatic consolidation and peace." },
    { first_name: "Otumfuo Nana", last_name: "Osei Kwadwo Okoawia", fullName: "Otumfuo Nana Osei Kwadwo Okoawia", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "4th Asantehene (1764–1777). Introduced administrative reforms (Kwadwoan Reforms)." },
    { first_name: "Otumfuo Nana", last_name: "Osei Kwame Panyin", fullName: "Otumfuo Nana Osei Kwame Panyin", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "5th Asantehene (1777–1803). Known for intellectual openness and administrative reform." },
    { first_name: "Otumfuo Nana", last_name: "Opoku Fofie", fullName: "Otumfuo Nana Opoku Fofie", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "6th Asantehene (1803–1804). Brief reign focused on peace negotiations." },
    { first_name: "Otumfuo Nana", last_name: "Osei Tutu Kwame Asiba Bonsu", fullName: "Otumfuo Nana Osei Tutu Kwame Asiba Bonsu", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "7th Asantehene (1804–1824). Led Asanteman during major Anglo-Asante conflicts." },
    { first_name: "Otumfuo Nana", last_name: "Osei Yaw Akoto", fullName: "Otumfuo Nana Osei Yaw Akoto", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "8th Asantehene (1824–1834). Commanded the Asante forces during the Battle of Duduwa." },
    { first_name: "Otumfuo Nana", last_name: "Kwaku Dua I", fullName: "Otumfuo Nana Kwaku Dua I", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "9th Asantehene (1834–1867). Period of economic stability and international diplomacy." },
    { first_name: "Otumfuo Nana", last_name: "Kofi Karikari", fullName: "Otumfuo Nana Kofi Karikari", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "10th Asantehene (1867–1874). Reigned during the 1874 Sagrenti War." },
    { first_name: "Otumfuo Nana", last_name: "Mensa Bonsu", fullName: "Otumfuo Nana Mensa Bonsu", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "11th Asantehene (1874–1883). Rebuilt Kumasi and reorganized the army." },
    { first_name: "Otumfuo Nana", last_name: "Kwaku Dua II", fullName: "Otumfuo Nana Kwaku Dua II", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "12th Asantehene (1884). Brief 40-day reign." },
    { first_name: "Otumfuo Nana", last_name: "Prempeh I", fullName: "Otumfuo Nana Prempeh I", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "13th Asantehene (1888–1931). Defended Asante sovereignty; exiled to Seychelles (1896-1924)." },
    { first_name: "Otumfuo Nana", last_name: "Osei Agyeman Prempeh II", fullName: "Otumfuo Nana Osei Agyeman Prempeh II", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "14th Asantehene (1931–1970). Restored the Ashanti Confederacy in 1935." },
    { first_name: "Otumfuo Nana", last_name: "Opoku Ware II", fullName: "Otumfuo Nana Opoku Ware II", gender: "Male", is_living: false, birth_place: "Kumasi", death_place: "Kumasi", bio: "15th Asantehene (1970–1999). Eminent lawyer and diplomat who modernized traditional administration." },
    { first_name: "Otumfuo", last_name: "Osei Tutu II", fullName: "Otumfuo Osei Tutu II", gender: "Male", is_living: true, birth_place: "Kumasi", bio: "16th Asantehene (1999–Present). Current monarch of the Asante Kingdom, chancellor of KNUST, peace mediator." }
  ];

  for (const a of asantehenes) {
    const existing = await prisma.person.findFirst({
      where: { fullName: a.fullName }
    });
    if (!existing) {
      await prisma.person.create({
        data: {
          first_name: a.first_name,
          last_name: a.last_name,
          fullName: a.fullName,
          gender: a.gender,
          is_living: a.is_living,
          birth_place: a.birth_place || null,
          death_place: a.death_place || null,
          bio: a.bio
        }
      });
    }
  }

  // 5. Seed Major Asantehemaas (Queen Mothers) into Person table
  const asantehemaas = [
    { first_name: "Nana", last_name: "Nyako Kusiamoa", fullName: "Nana Nyako Kusiamoa", gender: "Female", is_living: false, bio: "1st Asantehemaa of the Asante Kingdom. Matriarch co-founder of the Oyoko dynasty." },
    { first_name: "Nana", last_name: "Nketia Tim Abamo", fullName: "Nana Nketia Tim Abamo", gender: "Female", is_living: false, bio: "2nd Asantehemaa. Senior Oyoko royal matriarch." },
    { first_name: "Nana", last_name: "Akua Afriyie", fullName: "Nana Akua Afriyie", gender: "Female", is_living: false, bio: "3rd Asantehemaa. Co-ruler during 18th-century territorial expansion." },
    { first_name: "Nana", last_name: "Konadu Yiadom I", fullName: "Nana Konadu Yiadom I", gender: "Female", is_living: false, bio: "4th Asantehemaa. Prominent Oyoko matriarch whose lineage produced multiple Asantehenes." },
    { first_name: "Nana", last_name: "Akyaawa Yikwan", fullName: "Nana Akyaawa Yikwan", gender: "Female", is_living: false, bio: "5th Asantehemaa. Famous royal diplomat who negotiated peace treaties in the 1830s." },
    { first_name: "Nana", last_name: "Afua Sarpong", fullName: "Nana Afua Sarpong", gender: "Female", is_living: false, bio: "6th Asantehemaa. Presided over customary judicial court at Manhyia." },
    { first_name: "Nana", last_name: "Yaa Dufie", fullName: "Nana Yaa Dufie", gender: "Female", is_living: false, bio: "7th Asantehemaa. Custodian of royal genealogies." },
    { first_name: "Nana", last_name: "Afua Kobi I", fullName: "Nana Afua Kobi I", gender: "Female", is_living: false, bio: "8th Asantehemaa. Mother of Asantehene Kofi Karikari and Mensa Bonsu." },
    { first_name: "Nana", last_name: "Yaa Akyaa", fullName: "Nana Yaa Akyaa I", gender: "Female", is_living: false, bio: "9th Asantehemaa (reigned 1884–1896). Powerful matriarch who shaped 19th-century Asante politics." },
    { first_name: "Nana", last_name: "Konadu Yiadom II", fullName: "Nana Konadu Yiadom II", gender: "Female", is_living: false, bio: "12th Asantehemaa (reigned 1917–1945). Presided during the return of Prempeh I from Seychelles." },
    { first_name: "Nana Afia Kobi", last_name: "Serwaa Ampem II", fullName: "Nana Afia Kobi Serwaa Ampem II", gender: "Female", is_living: false, bio: "13th Asantehemaa (reigned 1977–2016). Mother of Otumfuo Osei Tutu II; revered matriarch of Asanteman." },
    { first_name: "Nana Ama Konadu", last_name: "Yiadom III", fullName: "Nana Ama Konadu Yiadom III", gender: "Female", is_living: false, bio: "14th Asantehemaa (reigned 2017–2025). Elder sister of Otumfuo Osei Tutu II." },
    { first_name: "Nana Yaa", last_name: "Akyaa II", fullName: "Nana Yaa Akyaa II", gender: "Female", is_living: true, bio: "15th Asantehemaa (enstoold July 6, 2026). Supreme head of Asantehemaa Customary Court at Manhyia Palace." }
  ];

  for (const q of asantehemaas) {
    const existing = await prisma.person.findFirst({
      where: { fullName: q.fullName }
    });
    if (!existing) {
      await prisma.person.create({
        data: {
          first_name: q.first_name,
          last_name: q.last_name,
          fullName: q.fullName,
          gender: q.gender,
          is_living: q.is_living,
          bio: q.bio
        }
      });
    }
  }

  // 6. Seed Traditional Stools (Kings, Queen Mothers, Paramounts, Sub-Stools, Divisional Wings)
  console.log('Seeding Traditional Stools...');

  // Delete any existing stools to ensure clean seed
  await prisma.traditionalStool.deleteMany({});

  // 6a. Central/Supreme Stools
  const goldenStool = await prisma.traditionalStool.create({
    data: {
      stoolName: "Sika Dwa Kofi (Golden Stool)",
      title: "Asantehene",
      town: "Kumasi",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "KING",
      currentOccupant: "Otumfuo Osei Tutu II",
      clan: "Oyoko",
      palaceName: "Manhyia Palace",
      seatLocation: "Kumasi, Ashanti Region",
      enstoolmentDate: new Date("1999-04-26"),
      imageUrl: "/images/golden_stool.jpg",
      militaryWing: "Supreme Commander"
    }
  });

  const asantehemaaStool = await prisma.traditionalStool.create({
    data: {
      stoolName: "Yiadom Stool (Asantehemaa Stool)",
      title: "Asantehemaa",
      town: "Kumasi",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "QUEEN_MOTHER_SUPREME",
      currentOccupant: "Nana Yaa Akyaa II",
      clan: "Oyoko",
      palaceName: "Manhyia Palace Court",
      seatLocation: "Kumasi, Ashanti Region",
      enstoolmentDate: new Date("2026-07-06"),
      imageUrl: null
    }
  });

  // Link Asantehene and Asantehemaa
  await prisma.traditionalStool.update({
    where: { id: goldenStool.id },
    data: { queenMotherStoolId: asantehemaaStool.id }
  });

  // 6b. Amantoo Founding Stools (Mampong, Juaben, Bekwai, Kokofu, Nsuta, Essumeja)
  // Mampong
  const mampongChief = await prisma.traditionalStool.create({
    data: {
      stoolName: "Amaniampong Silver Stool",
      title: "Mamponhene",
      town: "Mampong",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHENE",
      currentOccupant: "Daasebre Osei Bonsu II",
      clan: "Bretuo",
      palaceName: "Amaniampong Palace",
      seatLocation: "Mampong, Ashanti Region",
      enstoolmentDate: new Date("1996-03-24"),
      militaryWing: "Krontihene",
      parentStoolId: goldenStool.id
    }
  });

  const mampongQueen = await prisma.traditionalStool.create({
    data: {
      stoolName: "Mampong Queen Mother Stool",
      title: "Mamponghemaa",
      town: "Mampong",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHEMAA",
      currentOccupant: "Nana Amaniamponghemaa",
      clan: "Bretuo",
      palaceName: "Amaniampong Palace Court",
      seatLocation: "Mampong, Ashanti Region",
      parentStoolId: asantehemaaStool.id
    }
  });

  await prisma.traditionalStool.update({
    where: { id: mampongChief.id },
    data: { queenMotherStoolId: mampongQueen.id }
  });

  // Juaben
  const juabenChief = await prisma.traditionalStool.create({
    data: {
      stoolName: "Yiadom and Hwedie Stool",
      title: "Juabenhene",
      town: "Juaben",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHENE",
      currentOccupant: "Nana Otuo Siriboe II",
      clan: "Oyoko",
      palaceName: "Yiadom Palace",
      seatLocation: "Juaben, Ashanti Region",
      enstoolmentDate: new Date("1971-08-19"),
      militaryWing: "Nifahene",
      parentStoolId: goldenStool.id
    }
  });

  const juabenQueen = await prisma.traditionalStool.create({
    data: {
      stoolName: "Juaben Queen Mother Stool",
      title: "Juabenhemaa",
      town: "Juaben",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHEMAA",
      currentOccupant: "Nana Akosua Akyamaa III",
      clan: "Oyoko",
      palaceName: "Yiadom Palace Court",
      seatLocation: "Juaben, Ashanti Region",
      notes: "Senior Amantoo Queen Mother seat.",
      parentStoolId: asantehemaaStool.id
    }
  });

  await prisma.traditionalStool.update({
    where: { id: juabenChief.id },
    data: { queenMotherStoolId: juabenQueen.id }
  });

  // Bekwai
  const bekwaiChief = await prisma.traditionalStool.create({
    data: {
      stoolName: "Bekwai Paramount Stool",
      title: "Bekwaihene",
      town: "Bekwai",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHENE",
      currentOccupant: "Nana Karikari Appau II",
      clan: "Oyoko",
      palaceName: "Bekwai Palace",
      seatLocation: "Bekwai, Ashanti Region",
      parentStoolId: goldenStool.id
    }
  });

  const bekwaiQueen = await prisma.traditionalStool.create({
    data: {
      stoolName: "Bekwai Queen Mother Stool",
      title: "Bekwaihemaa",
      town: "Bekwai",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHEMAA",
      currentOccupant: "Nana Ama Yaa Asantewaa II",
      clan: "Oyoko",
      palaceName: "Bekwai Palace Court",
      seatLocation: "Bekwai, Ashanti Region",
      notes: "Paramount Queen Mother of Bekwai.",
      parentStoolId: asantehemaaStool.id
    }
  });

  await prisma.traditionalStool.update({
    where: { id: bekwaiChief.id },
    data: { queenMotherStoolId: bekwaiQueen.id }
  });

  // Kokofu
  const kokofuChief = await prisma.traditionalStool.create({
    data: {
      stoolName: "Kokofu Paramount Stool",
      title: "Kokofuhene",
      town: "Kokofu",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHENE",
      currentOccupant: "Barima Offe Akwasi Okogyeasuo II",
      clan: "Oyoko",
      palaceName: "Kokofu Palace",
      seatLocation: "Kokofu, Ashanti Region",
      parentStoolId: goldenStool.id
    }
  });

  const kokofuQueen = await prisma.traditionalStool.create({
    data: {
      stoolName: "Kokofu Queen Mother Stool",
      title: "Kokofuhemaa",
      town: "Kokofu",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHEMAA",
      currentOccupant: "Nana Osseiwyee II",
      clan: "Oyoko",
      palaceName: "Kokofu Palace Court",
      seatLocation: "Kokofu, Ashanti Region",
      notes: "Amantoo founding state seat.",
      parentStoolId: asantehemaaStool.id
    }
  });

  await prisma.traditionalStool.update({
    where: { id: kokofuChief.id },
    data: { queenMotherStoolId: kokofuQueen.id }
  });

  // Nsuta
  const nsutaChief = await prisma.traditionalStool.create({
    data: {
      stoolName: "Nsuta Paramount Stool",
      title: "Nsutahene",
      town: "Nsuta",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHENE",
      currentOccupant: "Nana Yaw Sekyere II",
      clan: "Oyoko",
      palaceName: "Nsuta Palace",
      seatLocation: "Nsuta, Ashanti Region",
      parentStoolId: goldenStool.id
    }
  });

  const nsutaQueen = await prisma.traditionalStool.create({
    data: {
      stoolName: "Nsuta Queen Mother Stool",
      title: "Nsutahemaa",
      town: "Nsuta",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHEMAA",
      currentOccupant: "Nana Ataa Birago",
      clan: "Oyoko",
      palaceName: "Nsuta Palace Court",
      seatLocation: "Nsuta, Ashanti Region",
      notes: "Amantoo founding state seat.",
      parentStoolId: asantehemaaStool.id
    }
  });

  await prisma.traditionalStool.update({
    where: { id: nsutaChief.id },
    data: { queenMotherStoolId: nsutaQueen.id }
  });

  // Essumeja
  const essumejaChief = await prisma.traditionalStool.create({
    data: {
      stoolName: "Essumeja Paramount Stool",
      title: "Essumejahene",
      town: "Essumeja",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHENE",
      currentOccupant: "Odiadeɛba Kofi Nana VI",
      clan: "Aduana",
      palaceName: "Essumeja Palace",
      seatLocation: "Essumeja, Ashanti Region",
      parentStoolId: goldenStool.id
    }
  });

  const essumejaQueen = await prisma.traditionalStool.create({
    data: {
      stoolName: "Essumeja Queen Mother Stool",
      title: "Essumejahemaa",
      town: "Essumeja",
      region: "Ashanti",
      category: "AMANTOO_FOUNDING",
      rank: "AMANHEMAA",
      currentOccupant: "Nana Adwoa Akyaa",
      clan: "Aduana",
      palaceName: "Essumeja Palace Court",
      seatLocation: "Essumeja, Ashanti Region",
      notes: "Origin seat of Asanteman.",
      parentStoolId: asantehemaaStool.id
    }
  });

  await prisma.traditionalStool.update({
    where: { id: essumejaChief.id },
    data: { queenMotherStoolId: essumejaQueen.id }
  });

  // 6c. Regional & Divisional Stools
  // Ejisu
  const ejisuChief = await prisma.traditionalStool.create({
    data: {
      stoolName: "Ejisu Paramount Stool",
      title: "Ejisuhene",
      town: "Ejisu",
      region: "Ashanti",
      category: "REGIONAL_PARAMOUNT",
      rank: "AMANHENE",
      currentOccupant: "Oguakro Afrane Okese IV",
      clan: "Asona",
      palaceName: "Ejisu Palace",
      seatLocation: "Ejisu, Ashanti Region",
      parentStoolId: goldenStool.id
    }
  });

  const ejisuQueen = await prisma.traditionalStool.create({
    data: {
      stoolName: "Ejisu Queen Mother Stool",
      title: "Ejisuhemaa",
      town: "Ejisu",
      region: "Ashanti",
      category: "REGIONAL_PARAMOUNT",
      rank: "AMANHEMAA",
      currentOccupant: "Nana Yaa Asantewaa II",
      clan: "Asona",
      palaceName: "Ejisu Palace Court",
      seatLocation: "Ejisu, Ashanti Region",
      notes: "Historic seat of Heroine Yaa Asantewaa.",
      parentStoolId: asantehemaaStool.id
    }
  });

  await prisma.traditionalStool.update({
    where: { id: ejisuChief.id },
    data: { queenMotherStoolId: ejisuQueen.id }
  });

  // Offinso
  const offinsoChief = await prisma.traditionalStool.create({
    data: {
      stoolName: "Offinso Paramount Stool",
      title: "Offinsohene",
      town: "Offinso",
      region: "Ashanti",
      category: "REGIONAL_PARAMOUNT",
      rank: "AMANHENE",
      currentOccupant: "Nana Wiafe Akenten III",
      clan: "Asona",
      palaceName: "Wiafe Akenten Palace",
      seatLocation: "Offinso, Ashanti Region",
      parentStoolId: goldenStool.id
    }
  });

  const offinsoQueen = await prisma.traditionalStool.create({
    data: {
      stoolName: "Offinso Queen Mother Stool",
      title: "Offinsohemaa",
      town: "Offinso",
      region: "Ashanti",
      category: "REGIONAL_PARAMOUNT",
      rank: "AMANHEMAA",
      currentOccupant: "Nana Ama Serwaa Nyarko",
      clan: "Asona",
      palaceName: "Offinso Palace Court",
      seatLocation: "Offinso, Ashanti Region",
      notes: "Asona royal lineage.",
      parentStoolId: asantehemaaStool.id
    }
  });

  await prisma.traditionalStool.update({
    where: { id: offinsoChief.id },
    data: { queenMotherStoolId: offinsoQueen.id }
  });

  // 6d. Kumasi Traditional Council Sub-Queen Mothers (Fekuo / Divisional Sub-Stools)
  const fekuoStools = [
    { title: "Kumasi Gyaasehemaa", currentOccupant: "Nana Gyaasehemaa", category: "KUMASI_DIVISIONAL", rank: "DIVISIONAL_QUEEN_MOTHER", clan: "Oyoko", notes: "Gyaase division sub-queen mother.", parentId: asantehemaaStool.id },
    { title: "Ankobeahemaa", currentOccupant: "Nana Ankobeahemaa", category: "KUMASI_DIVISIONAL", rank: "DIVISIONAL_QUEEN_MOTHER", clan: "Oyoko", notes: "Ankobea division sub-queen mother.", parentId: asantehemaaStool.id },
    { title: "Krontihemaa", currentOccupant: "Nana Krontihemaa", category: "KUMASI_DIVISIONAL", rank: "DIVISIONAL_QUEEN_MOTHER", clan: "Bretuo", notes: "Kronti division sub-queen mother.", parentId: asantehemaaStool.id },
    { title: "Adontenhemaa", currentOccupant: "Nana Adontenhemaa", category: "KUMASI_DIVISIONAL", rank: "DIVISIONAL_QUEEN_MOTHER", clan: "Oyoko", notes: "Adonten division sub-queen mother.", parentId: asantehemaaStool.id },
    { title: "Akwamuhemaa", currentOccupant: "Nana Akwamuhemaa", category: "KUMASI_DIVISIONAL", rank: "DIVISIONAL_QUEEN_MOTHER", clan: "Oyoko", notes: "Akwamu division sub-queen mother.", parentId: asantehemaaStool.id }
  ];

  for (const f of fekuoStools) {
    await prisma.traditionalStool.create({
      data: {
        stoolName: f.title + " Stool",
        title: f.title,
        town: "Kumasi",
        region: "Ashanti",
        category: f.category,
        rank: f.rank,
        currentOccupant: f.currentOccupant,
        clan: f.clan,
        palaceName: "Manhyia Palace Court",
        seatLocation: "Kumasi, Ashanti Region",
        notes: f.notes,
        parentStoolId: f.parentId
      }
    });
  }

  // 6e. Traditional Stools outside Ashanti (Universal scope across Ghana)
  const nonAshantiStools = [
    { town: "Koforidua", region: "Eastern", title: "Juabenhemaa of New Juaben", stoolName: "New Juaben Queen Mother Stool", rank: "AMANHEMAA", category: "GENERAL_GHANA_TRADITIONAL", currentOccupant: "Nana Nana Yaa Daani II", clan: "Oyoko" },
    { town: "Ho", region: "Volta", title: "Fiaga of Asogli State (Paramount Chief)", stoolName: "Asogli Paramount Stool", rank: "AMANHENE", category: "GENERAL_GHANA_TRADITIONAL", currentOccupant: "Togbe Afede XIV", clan: "Asogli" },
    { town: "Ho", region: "Volta", title: "Mamaga of Asogli State", stoolName: "Asogli Queen Mother Stool", rank: "AMANHEMAA", category: "GENERAL_GHANA_TRADITIONAL", currentOccupant: "Mamaga Akua Moro II", clan: "Asogli" }
  ];

  for (const na of nonAshantiStools) {
    await prisma.traditionalStool.create({
      data: {
        stoolName: na.stoolName,
        title: na.title,
        town: na.town,
        region: na.region,
        category: na.category,
        rank: na.rank,
        currentOccupant: na.currentOccupant,
        clan: na.clan,
        palaceName: na.town + " Palace",
        seatLocation: na.town + ", " + na.region + " Region"
      }
    });
  }

  console.log('Traditional Stools seeding completed successfully.');

  // 7. Seed 16 Asantehenes Dynastic Succession & Matrilineal Lineage
  console.log('Seeding 16 Asantehenes Dynastic Succession & Matrilineal Data...');

  const oyokoClan = await prisma.clan.findFirst({ where: { name: { contains: 'yoko' } } });
  const oyokoClanId = oyokoClan ? oyokoClan.id : null;

  // Key Royal Queen Mothers (Matrilineal Lineage)
  const nanaManu = await prisma.person.upsert({
    where: { person_id: 9901 },
    update: {},
    create: {
      person_id: 9901,
      first_name: 'Nana',
      last_name: 'Manu Kotosii',
      fullName: 'Nana Manu Kotosii',
      gender: 'Female',
      is_living: false,
      bio: 'Mother of Otumfuo Osei Tutu I (Founding Asantehene)',
      clan_id: oyokoClanId
    }
  });

  const nanaNkatia = await prisma.person.upsert({
    where: { person_id: 9902 },
    update: {},
    create: {
      person_id: 9902,
      first_name: 'Nana',
      last_name: 'Nkatia Ntim Abamo',
      fullName: 'Nana Nkatia Ntim Abamo',
      gender: 'Female',
      is_living: false,
      bio: 'Mother of Otumfuo Opoku Ware I',
      clan_id: oyokoClanId
    }
  });

  const nanaAkuaYiadomI = await prisma.person.upsert({
    where: { person_id: 9903 },
    update: {},
    create: {
      person_id: 9903,
      first_name: 'Asantehemaa',
      last_name: 'Akua Yiadom I',
      fullName: 'Asantehemaa Akua Yiadom I',
      gender: 'Female',
      is_living: false,
      bio: 'Asantehemaa Akua Yiadom I, mother of Osei Kwadwo and Osei Kwame Panyin',
      clan_id: oyokoClanId
    }
  });

  // Array of 16 Asantehenes
  const asanteheneData = [
    { id: 9001, order: 1, name: 'Otumfuo Osei Tutu I', start: 1701, end: 1717, motherId: nanaManu.person_id, bio: '1st Asantehene, Founder of the Asante Empire with Okomfo Anokye.' },
    { id: 9002, order: 2, name: 'Otumfuo Opoku Ware I', start: 1720, end: 1750, motherId: nanaNkatia.person_id, bio: '2nd Asantehene, expanded the Asante Confederacy into a vast regional empire.' },
    { id: 9003, order: 3, name: 'Otumfuo Kusi Obodom', start: 1750, end: 1764, motherId: null, bio: '3rd Asantehene, maintained peace and stabilized trade routes.' },
    { id: 9004, order: 4, name: 'Otumfuo Osei Kwadwo Okoawia', start: 1764, end: 1777, motherId: nanaAkuaYiadomI.person_id, bio: '4th Asantehene, introduced major administrative and military reforms.' },
    { id: 9005, order: 5, name: 'Otumfuo Osei Kwame Panyin', start: 1777, end: 1803, motherId: nanaAkuaYiadomI.person_id, bio: '5th Asantehene, known for administrative centralization and intellectual leadership.' },
    { id: 9006, order: 6, name: 'Otumfuo Osei Fofie', start: 1803, end: 1804, motherId: null, bio: '6th Asantehene, brief reign filled with spiritual reconciliation.' },
    { id: 9007, order: 7, name: 'Otumfuo Osei Bonsu (Osei Tutu Kwame)', start: 1804, end: 1824, motherId: null, bio: '7th Asantehene, led Asante through strategic wars and treaties.' },
    { id: 9008, order: 8, name: 'Otumfuo Osei Yaw Akoto', start: 1824, end: 1834, motherId: null, bio: '8th Asantehene, led forces during the Battle of Dudowa.' },
    { id: 9009, order: 9, name: 'Otumfuo Kwaku Dua I', start: 1834, end: 1867, motherId: null, bio: '9th Asantehene, era of economic prosperity and diplomatic treaties.' },
    { id: 9010, order: 10, name: 'Otumfuo Kofi Karikari', start: 1867, end: 1874, motherId: null, bio: '10th Asantehene, reigned during the Sagrenti War of 1874.' },
    { id: 9011, order: 11, name: 'Otumfuo Mensa Bonsu', start: 1874, end: 1883, motherId: null, bio: '11th Asantehene, rebuilt Kumasi and reorganized military forces.' },
    { id: 9012, order: 12, name: 'Otumfuo Kwaku Dua II', start: 1884, end: 1884, motherId: null, bio: '12th Asantehene, brief reign during political transitions.' },
    { id: 9013, order: 13, name: 'Otumfuo Prempeh I (Kwaku Dua III)', start: 1888, end: 1931, motherId: null, bio: '13th Asantehene, resisted British colonization, exiled to Seychelles and restored.' },
    { id: 9014, order: 14, name: 'Otumfuo Sir Osei Tutu Agyeman Prempeh II', start: 1931, end: 1970, motherId: null, bio: '14th Asantehene, restored the Asante Confederacy in 1935.' },
    { id: 9015, order: 15, name: 'Otumfuo Opoku Ware II', start: 1970, end: 1999, motherId: null, bio: '15th Asantehene, distinguished lawyer and diplomat.' },
    { id: 9016, order: 16, name: 'Otumfuo Osei Tutu II', start: 1999, end: 2026, motherId: null, bio: '16th Asantehene, current reigning monarch of the Asante Kingdom.' }
  ];

  // Upsert all 16 Asantehenes
  for (const a of asanteheneData) {
    const parts = a.name.split(' ');
    const fName = parts.slice(0, 2).join(' ');
    const lName = parts.slice(2).join(' ') || parts[1] || '';

    await prisma.person.upsert({
      where: { person_id: a.id },
      update: {
        dynasticOrder: a.order,
        dynasticNumber: a.order,
        reignStartYear: a.start,
        reignEndYear: a.end,
        motherId: a.motherId,
        clan_id: oyokoClanId,
        profession: 'Asantehene'
      },
      create: {
        person_id: a.id,
        first_name: fName,
        last_name: lName,
        fullName: a.name,
        gender: 'Male',
        dynasticOrder: a.order,
        dynasticNumber: a.order,
        reignStartYear: a.start,
        reignEndYear: a.end,
        motherId: a.motherId,
        clan_id: oyokoClanId,
        profession: 'Asantehene',
        bio: a.bio
      }
    });
  }

  // Link predecessorId / successorId sequentially across all 16 Asantehenes
  for (let i = 0; i < asanteheneData.length; i++) {
    const currentId = asanteheneData[i].id;
    const predecessorId = i > 0 ? asanteheneData[i - 1].id : null;
    const successorId = i < asanteheneData.length - 1 ? asanteheneData[i + 1].id : null;

    await prisma.person.update({
      where: { person_id: currentId },
      data: {
        predecessorId,
        successorId
      }
    });
  }

  console.log('16 Asantehenes Dynastic Succession & Matrilineal Data seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
