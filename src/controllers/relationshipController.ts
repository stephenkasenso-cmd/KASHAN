import { Request, Response, NextFunction } from 'express';
import * as familyService from '../services/familyService';

/**
 * Handle POST /api/relationships (Link two people together)
 */
export async function createRelationshipHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      person_id_1,
      person_id_2,
      relationship_type,
      subtype,
      status,
      start_date,
      end_date
    } = req.body;

    if (person_id_1 === undefined || person_id_2 === undefined || !relationship_type) {
      res.status(400).json({
        error: "Validation Error: 'person_id_1', 'person_id_2', and 'relationship_type' are required fields."
      });
      return;
    }

    const p1 = parseInt(person_id_1, 10);
    const p2 = parseInt(person_id_2, 10);

    if (isNaN(p1) || isNaN(p2)) {
      res.status(400).json({
        error: "Validation Error: 'person_id_1' and 'person_id_2' must be valid integers."
      });
      return;
    }

    const relationship = await familyService.addRelationship(
      p1,
      p2,
      relationship_type,
      subtype || 'None',
      status || null,
      start_date ? new Date(start_date) : null,
      end_date ? new Date(end_date) : null
    );

    res.status(201).json(relationship);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle PUT /api/relationships/:id (Update a relationship)
 */
export async function updateRelationshipHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Validation Error: 'id' must be a valid integer." });
      return;
    }

    const { relationship_type, subtype, status, start_date, end_date } = req.body;

    if (!relationship_type) {
      res.status(400).json({ error: "Validation Error: 'relationship_type' is required." });
      return;
    }

    const updated = await familyService.updateRelationship(
      id,
      relationship_type,
      subtype || 'None',
      status || null,
      start_date ? new Date(start_date) : null,
      end_date ? new Date(end_date) : null
    );

    res.status(200).json(updated);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle DELETE /api/relationships/:id (Remove a relationship)
 */
export async function deleteRelationshipHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Validation Error: 'id' must be a valid integer." });
      return;
    }

    const deleted = await familyService.deleteRelationship(id);
    res.status(200).json({ message: 'Relationship deleted successfully.', deleted });
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/people/:id/relationships (List all relationships for a person)
 */
export async function listRelationshipsForPersonHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const personId = parseInt(req.params.id, 10);
    if (isNaN(personId)) {
      res.status(400).json({ error: "Validation Error: 'id' must be a valid integer." });
      return;
    }

    const relationships = await familyService.getRelationshipsForPerson(personId);
    res.status(200).json(relationships);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle POST /api/relationships/establish (Establish a validated relationship link)
 */
export async function establishRelationshipHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      person1Id,
      person2Id,
      person_id_1,
      person_id_2,
      category,
      relationshipType,
      relationship_type,
      subtype,
      traditionalRole,
      startDate,
      start_date,
      endDate,
      end_date,
      notes
    } = req.body;

    const p1 = person1Id !== undefined ? person1Id : person_id_1;
    const p2 = person2Id !== undefined ? person2Id : person_id_2;

    if (p1 === undefined || p2 === undefined) {
      res.status(400).json({
        error: "Validation Error: 'person1Id' and 'person2Id' are required fields."
      });
      return;
    }

    const relationship = await familyService.establishRelationship({
      person1Id: parseInt(p1, 10),
      person2Id: parseInt(p2, 10),
      category: category || 'PARENT_CHILD',
      relationshipType: relationshipType || relationship_type,
      subtype,
      traditionalRole,
      startDate: startDate || start_date,
      endDate: endDate || end_date,
      notes
    });

    res.status(201).json(relationship);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/relationships/available-types (Retrieve available & recommended relationship types between two entities)
 */
export async function getAvailableTypesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const p1 = req.query.p1 || req.query.person1Id;
    const p2 = req.query.p2 || req.query.person2Id;

    if (!p1 || !p2) {
      res.status(400).json({
        error: "Validation Error: Query parameters 'p1' and 'p2' are required."
      });
      return;
    }

    const result = await familyService.getAvailableRelationshipTypes(
      parseInt(String(p1), 10),
      parseInt(String(p2), 10)
    );

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
}

