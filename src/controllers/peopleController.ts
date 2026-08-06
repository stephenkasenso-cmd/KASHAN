import { Request, Response, NextFunction } from 'express';
import * as familyService from '../services/familyService';

/**
 * Handle POST /api/people (Create a new person)
 */
export async function createPersonHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      first_name,
      last_name,
      fullName,
      maiden_name,
      gender,
      photoUrl,
      birth_date,
      birth_place,
      death_date,
      death_place,
      burialPlace,
      is_living,
      bio,
      ghana_card,
      gps_address,
      phone,
      email,
      currentAddress,
      hometown,
      profession,
      employer,
      church,
      baptismDetails,
      bloodGroup,
      genotype,
      educationJson,
      documentsJson,
      biographyJson,
      fatherId,
      motherId,
      clan_id,
      paramountcy_id,
      sub_stool_id,
      enstoolment_date
    } = req.body;

    const fName = first_name || (fullName ? fullName.split(' ')[0] : '');
    const lName = last_name || (fullName ? fullName.split(' ').slice(1).join(' ') : '');

    if ((!fName && !fullName) || !gender) {
      res.status(400).json({
        error: "Validation Error: Name and 'gender' are required fields."
      });
      return;
    }

    const person = await familyService.addPerson({
      first_name: fName,
      last_name: lName,
      fullName: fullName || `${fName} ${lName}`.trim(),
      maiden_name: maiden_name || null,
      gender,
      photoUrl: photoUrl || null,
      birth_date: birth_date ? new Date(birth_date) : null,
      birth_place: birth_place || null,
      death_date: death_date ? new Date(death_date) : null,
      death_place: death_place || null,
      burialPlace: burialPlace || null,
      is_living: is_living !== undefined ? Boolean(is_living) : true,
      bio: bio || null,
      ghana_card: ghana_card || null,
      gps_address: gps_address || null,
      phone: phone || null,
      email: email || null,
      currentAddress: currentAddress || null,
      hometown: hometown || null,
      profession: profession || null,
      employer: employer || null,
      church: church || null,
      baptismDetails: baptismDetails || null,
      bloodGroup: bloodGroup || null,
      genotype: genotype || null,
      educationJson: typeof educationJson === 'object' ? JSON.stringify(educationJson) : educationJson || null,
      documentsJson: typeof documentsJson === 'object' ? JSON.stringify(documentsJson) : documentsJson || null,
      biographyJson: typeof biographyJson === 'object' ? JSON.stringify(biographyJson) : biographyJson || null,
      fatherId: fatherId ? Number(fatherId) : null,
      motherId: motherId ? Number(motherId) : null,
      clan_id: clan_id ? Number(clan_id) : null,
      paramountcy_id: paramountcy_id ? Number(paramountcy_id) : null,
      sub_stool_id: sub_stool_id ? Number(sub_stool_id) : null,
      enstoolment_date: enstoolment_date ? new Date(enstoolment_date) : null
    });

    res.status(201).json(person);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/people/:id/family (Retrieve immediate family)
 */
export async function getImmediateFamilyHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const personId = parseInt(req.params.id, 10);
    if (isNaN(personId)) {
      res.status(400).json({ error: "Validation Error: 'id' parameter must be a valid integer." });
      return;
    }

    const family = await familyService.getImmediateFamily(personId);
    res.json(family);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/people/:id/ancestors (Retrieve ancestors tree branch)
 */
export async function getAncestorsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const personId = parseInt(req.params.id, 10);
    if (isNaN(personId)) {
      res.status(400).json({ error: "Validation Error: 'id' parameter must be a valid integer." });
      return;
    }

    const generationsQuery = req.query.generations ? parseInt(req.query.generations as string, 10) : 5;
    if (isNaN(generationsQuery) || generationsQuery <= 0) {
      res.status(400).json({ error: "Validation Error: 'generations' query parameter must be a positive integer." });
      return;
    }

    const ancestors = await familyService.getAncestors(personId, generationsQuery);
    res.json(ancestors);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/people/:id/descendants (Retrieve descendants tree branch)
 */
export async function getDescendantsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const personId = parseInt(req.params.id, 10);
    if (isNaN(personId)) {
      res.status(400).json({ error: "Validation Error: 'id' parameter must be a valid integer." });
      return;
    }

    const generationsQuery = req.query.generations ? parseInt(req.query.generations as string, 10) : 5;
    if (isNaN(generationsQuery) || generationsQuery <= 0) {
      res.status(400).json({ error: "Validation Error: 'generations' query parameter must be a positive integer." });
      return;
    }

    const descendants = await familyService.getDescendants(personId, generationsQuery);
    res.json(descendants);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/people (List all registered people)
 */
export async function listPeopleHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const people = await familyService.listPeople();
    res.json(people);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle PUT /api/people/:id (Update a person's profile details)
 */
export async function updatePersonHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Validation Error: 'id' parameter must be a valid integer." });
      return;
    }

    const {
      first_name,
      last_name,
      fullName,
      maiden_name,
      gender,
      photoUrl,
      birth_date,
      birth_place,
      death_date,
      death_place,
      burialPlace,
      is_living,
      bio,
      ghana_card,
      gps_address,
      phone,
      email,
      currentAddress,
      hometown,
      profession,
      employer,
      church,
      baptismDetails,
      bloodGroup,
      genotype,
      educationJson,
      documentsJson,
      biographyJson,
      fatherId,
      motherId,
      clan_id,
      paramountcy_id,
      sub_stool_id,
      enstoolment_date
    } = req.body;

    const fName = first_name || (fullName ? fullName.split(' ')[0] : undefined);
    const lName = last_name || (fullName ? fullName.split(' ').slice(1).join(' ') : undefined);

    if ((!fName && !fullName) || !gender) {
      res.status(400).json({
        error: "Validation Error: Name and 'gender' are required fields."
      });
      return;
    }

    const person = await familyService.updatePerson(id, {
      first_name: fName,
      last_name: lName,
      fullName: fullName || (fName && lName ? `${fName} ${lName}`.trim() : undefined),
      maiden_name: maiden_name !== undefined ? maiden_name : undefined,
      gender,
      photoUrl: photoUrl !== undefined ? photoUrl : undefined,
      birth_date: birth_date !== undefined ? (birth_date ? new Date(birth_date) : null) : undefined,
      birth_place: birth_place !== undefined ? birth_place : undefined,
      death_date: is_living ? null : (death_date !== undefined ? (death_date ? new Date(death_date) : null) : undefined),
      death_place: is_living ? null : (death_place !== undefined ? death_place : undefined),
      burialPlace: is_living ? null : (burialPlace !== undefined ? burialPlace : undefined),
      is_living: is_living !== undefined ? Boolean(is_living) : undefined,
      bio: bio !== undefined ? bio : undefined,
      ghana_card: ghana_card !== undefined ? ghana_card : undefined,
      gps_address: gps_address !== undefined ? gps_address : undefined,
      phone: phone !== undefined ? phone : undefined,
      email: email !== undefined ? email : undefined,
      currentAddress: currentAddress !== undefined ? currentAddress : undefined,
      hometown: hometown !== undefined ? hometown : undefined,
      profession: profession !== undefined ? profession : undefined,
      employer: employer !== undefined ? employer : undefined,
      church: church !== undefined ? church : undefined,
      baptismDetails: baptismDetails !== undefined ? baptismDetails : undefined,
      bloodGroup: bloodGroup !== undefined ? bloodGroup : undefined,
      genotype: genotype !== undefined ? genotype : undefined,
      educationJson: educationJson !== undefined ? (typeof educationJson === 'object' ? JSON.stringify(educationJson) : educationJson) : undefined,
      documentsJson: documentsJson !== undefined ? (typeof documentsJson === 'object' ? JSON.stringify(documentsJson) : documentsJson) : undefined,
      biographyJson: biographyJson !== undefined ? (typeof biographyJson === 'object' ? JSON.stringify(biographyJson) : biographyJson) : undefined,
      fatherId: fatherId !== undefined ? (fatherId ? Number(fatherId) : null) : undefined,
      motherId: motherId !== undefined ? (motherId ? Number(motherId) : null) : undefined,
      clan_id: clan_id !== undefined ? (clan_id ? Number(clan_id) : null) : undefined,
      paramountcy_id: paramountcy_id !== undefined ? (paramountcy_id ? Number(paramountcy_id) : null) : undefined,
      sub_stool_id: sub_stool_id !== undefined ? (sub_stool_id ? Number(sub_stool_id) : null) : undefined,
      enstoolment_date: enstoolment_date !== undefined ? (enstoolment_date ? new Date(enstoolment_date) : null) : undefined
    });

    res.json(person);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle DELETE /api/people/:id (Delete a person record)
 */
export async function deletePersonHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Validation Error: 'id' parameter must be a valid integer." });
      return;
    }

    const deletedPerson = await familyService.deletePerson(id);
    res.json({ message: "Person deleted successfully", person: deletedPerson });
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/people/royals/asantehenes (Fetch all 16 Asantehenes)
 */
export async function getAsantehenesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const asantehenes = await familyService.getAsantehenes();
    res.json(asantehenes);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/people/royals/asantehemaas (Fetch all major Asantehemaas)
 */
export async function getAsantehemaasHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const asantehemaas = await familyService.getAsantehemaas();
    res.json(asantehemaas);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/family/asantehene/succession-chain
 */
export async function getDynasticSuccessionChainHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const chain = await familyService.getDynasticSuccessionChain();
    res.json(chain);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/family/asantehene/:id/matrilineal-tree
 */
export async function getMatrilinealTreeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Validation Error: 'id' parameter must be a valid integer." });
      return;
    }

    const tree = await familyService.getMatrilinealTree(id);
    res.json(tree);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/royals/asantehene/peer-chain & GET /api/family/asantehene/peer-chain
 */
export async function getDynasticPeerChainHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const peerChain = await familyService.getDynasticPeerChain();
    res.json(peerChain);
  } catch (error: any) {
    next(error);
  }
}



