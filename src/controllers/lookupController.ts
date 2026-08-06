import { Request, Response } from 'express';

const PROFESSIONS = [
  // Healthcare & Medical
  'Medicine & Surgery',
  'Nursing & Midwifery',
  'Pharmacy & Pharmaceutical Sciences',
  'Dentistry & Oral Health',
  'Public Health & Epidemiology',
  'Veterinary Medicine',
  'Clinical Psychology & Counselling',
  'Physiotherapy & Rehabilitation',
  'Medical Laboratory Science',
  'Optometry & Vision Care',

  // Engineering & Technology
  'Software Engineering & IT',
  'Civil Engineering & Construction',
  'Mechanical Engineering',
  'Electrical & Electronics Engineering',
  'Chemical & Process Engineering',
  'Mining & Geological Engineering',
  'Telecommunications Engineering',
  'Data Science & Artificial Intelligence',
  'Cybersecurity & Information Assurance',

  // Legal & Governance
  'Law & Judicial Services',
  'Civil Service & Public Administration',
  'Diplomacy & International Relations',
  'Traditional Chieftaincy Administration',
  'Human Rights & Policy Advocacy',

  // Education & Research
  'Teaching & Education (Primary / Secondary)',
  'University Lecturing & Academic Research',
  'Librarianship & Information Science',

  // Business & Finance
  'Banking & Finance',
  'Accounting & Auditing',
  'Insurance & Actuarial Science',
  'Business & Entrepreneurship',
  'Marketing & Advertising',
  'Human Resources & Talent Management',
  'Real Estate & Property Development',
  'Supply Chain & Logistics Management',
  'Trade & Commerce',

  // Agriculture & Environment
  'Agriculture & Agribusiness',
  'Forestry & Environmental Science',
  'Fisheries & Marine Science',
  'Food Science & Nutrition',

  // Creative & Media
  'Media, Journalism & Broadcasting',
  'Art, Design & Cultural Craftsmanship',
  'Music & Performing Arts',
  'Film, Photography & Multimedia',
  'Architecture & Urban Planning',
  'Fashion Design & Textiles',

  // Trades & Skilled Labour
  'Carpentry & Woodwork',
  'Welding & Metalwork',
  'Plumbing & Pipefitting',
  'Electrical Installation & Wiring',
  'Auto Mechanics & Vehicle Engineering',
  'Masonry & Building Construction',
  'Tailoring & Dressmaking',
  'Catering & Hospitality',
  'Hairdressing & Cosmetology',

  // Security & Defence
  'Armed Forces & Military Service',
  'Police & Law Enforcement',
  'Fire Service & Emergency Response',
  'Private Security & Investigations',

  // Transport & Aviation
  'Aviation & Piloting',
  'Maritime & Shipping',
  'Transport & Fleet Management',

  // Social Services & Religion
  'Social Work & Community Development',
  'Clergy & Religious Ministry',
  'NGO & Nonprofit Administration',

  // Other
  'Sports & Athletics',
  'Tourism & Travel Management',
  'Mining & Extractive Industries',
  'Oil & Gas / Energy Sector',
  'Retired',
  'Student',
  'Unemployed / Seeking Employment',
  'Other'
];

const RELIGIONS = [
  // Christian Denominations
  'Methodist Church Ghana',
  'Presbyterian Church of Ghana',
  'Catholic Church (Roman Catholic)',
  'Pentecostal / Charismatic',
  'Anglican Church',
  'Seventh-day Adventist (SDA)',
  'Baptist Church',
  'Church of Christ',
  'Evangelical Presbyterian Church',
  'Apostolic Church',
  'Church of Pentecost',
  'Assemblies of God',
  'Salvation Army',
  'Jehovah\'s Witnesses',
  'The Church of Jesus Christ of Latter-day Saints',
  'Orthodox Church',
  'Other Christian / Inter-denominational',

  // Islam
  'Islam (Sunni)',
  'Islam (Shia)',
  'Islam (Ahmadiyya)',
  'Islam (Sufi / Tijaniyya)',

  // Traditional & Indigenous
  'Traditional / African Ancestral Veneration',
  'Traditional / Akan Ancestral Veneration',

  // Other World Religions
  'Hinduism',
  'Buddhism',
  'Judaism',
  'Baháʼí Faith',
  'Sikhism',

  // Other
  'Agnostic / Non-religious',
  'Atheist',
  'Other / Unspecified'
];

const EMPLOYERS = [
  // Government & Civil Service (Ghana)
  'Ghana Civil Service',
  'Ghana Health Service (GHS)',
  'Ghana Education Service (GES)',
  'Judicial Service of Ghana',
  'Ghana Revenue Authority (GRA)',
  'Ghana Immigration Service',
  'Ghana Police Service',
  'Ghana Armed Forces (GAF)',
  'Ghana Fire Service',
  'Ghana Prisons Service',
  'National Service Secretariat',
  'Audit Service',
  'Electoral Commission of Ghana',
  'Ghana Statistical Service',

  // Traditional & Palace Administration
  'Manhyia Palace Administration',
  'Asante Traditional Council',
  'National House of Chiefs',

  // Healthcare Institutions
  'Komfo Anokye Teaching Hospital (KATH)',
  'Korle Bu Teaching Hospital (KBTH)',
  'Tamale Teaching Hospital',
  'Cape Coast Teaching Hospital',
  'Ridge Hospital, Accra',
  'Ghana Health Service District Hospital',
  '37 Military Hospital',

  // Educational Institutions
  'University of Ghana (Legon)',
  'Kwame Nkrumah University of Science and Technology (KNUST)',
  'University of Cape Coast (UCC)',
  'University for Development Studies (UDS)',
  'University of Education, Winneba (UEW)',
  'Ashesi University',
  'Ghana Institute of Management & Public Administration (GIMPA)',
  'Academic City University College',
  'Primary / Secondary School (Specify)',

  // Financial Institutions
  'Bank of Ghana',
  'GCB Bank',
  'Ecobank Ghana',
  'Stanbic Bank Ghana',
  'Absa Bank Ghana',
  'Fidelity Bank Ghana',
  'CalBank',
  'Prudential Bank',
  'Standard Chartered Bank Ghana',
  'ADB (Agricultural Development Bank)',
  'National Investment Bank (NIB)',
  'Social Security and National Insurance Trust (SSNIT)',

  // Energy, Oil & Mining
  'Ghana National Petroleum Corporation (GNPC)',
  'Volta River Authority (VRA)',
  'Electricity Company of Ghana (ECG)',
  'Ghana Grid Company (GRIDCo)',
  'Tullow Oil Ghana',
  'AngloGold Ashanti',
  'Newmont Goldcorp Ghana',
  'Gold Fields Ghana',

  // Telecommunications
  'MTN Ghana',
  'Vodafone Ghana',
  'AirtelTigo Ghana',
  'Glo Ghana',

  // International Organisations
  'United Nations (UN)',
  'World Health Organization (WHO)',
  'World Bank',
  'International Monetary Fund (IMF)',
  'African Union (AU)',
  'ECOWAS Commission',
  'USAID',
  'UK DFID / FCDO',
  'European Union (EU)',
  'UNICEF',
  'UNESCO',

  // Multinational Companies
  'Google',
  'Microsoft',
  'Amazon',
  'Meta (Facebook)',
  'Apple',
  'IBM',
  'Deloitte',
  'PricewaterhouseCoopers (PwC)',
  'KPMG',
  'Ernst & Young (EY)',
  'McKinsey & Company',
  'Unilever Ghana',
  'Nestlé Ghana',
  'Coca-Cola Bottling Company Ghana',
  'Toyota Ghana',
  'Shell / Vivo Energy Ghana',
  'TotalEnergies Ghana',

  // Media
  'Ghana Broadcasting Corporation (GBC)',
  'Multimedia Group (Joy FM)',
  'Despite Media Group',
  'Media General (TV3)',

  // NGOs & Nonprofits
  'World Vision Ghana',
  'Plan International Ghana',
  'ActionAid Ghana',
  'Save the Children Ghana',
  'Red Cross Society Ghana',

  // Other
  'Private / Self-Employed',
  'Startup / Small Business',
  'Freelance / Contract Work',
  'Religious Institution (Church / Mosque)',
  'Retired',
  'Not Applicable',
  'Other (Specify)'
];

export const getProfessions = (req: Request, res: Response) => {
  res.json(PROFESSIONS);
};

export const getReligions = (req: Request, res: Response) => {
  res.json(RELIGIONS);
};

export const getEmployers = (req: Request, res: Response) => {
  res.json(EMPLOYERS);
};
