import { Request, Response, NextFunction } from 'express';
import * as familyService from '../services/familyService';

/**
 * Handle POST /api/marriages (Create a marriage record)
 */
export async function createMarriageHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { spouse1Id, spouse2Id, marriageDate, marriagePlace } = req.body;

    if (!spouse1Id || !spouse2Id) {
      res.status(400).json({
        error: "Validation Error: 'spouse1Id' and 'spouse2Id' are required fields."
      });
      return;
    }

    const marriage = await familyService.createMarriage(
      Number(spouse1Id),
      Number(spouse2Id),
      marriageDate ? new Date(marriageDate) : null,
      marriagePlace || null
    );

    res.status(201).json(marriage);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/marriages/person/:id (List marriages for a person)
 */
export async function listMarriagesForPersonHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const personId = parseInt(req.params.id, 10);
    if (isNaN(personId)) {
      res.status(400).json({ error: "Validation Error: 'id' parameter must be a valid integer." });
      return;
    }

    const marriages = await familyService.listMarriagesForPerson(personId);
    res.json(marriages);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle DELETE /api/marriages/:id (Delete a marriage record)
 */
export async function deleteMarriageHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Validation Error: 'id' parameter must be a valid integer." });
      return;
    }

    const deleted = await familyService.deleteMarriage(id);
    res.json({ message: "Marriage record deleted successfully", marriage: deleted });
  } catch (error: any) {
    next(error);
  }
}
