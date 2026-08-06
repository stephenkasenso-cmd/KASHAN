import { Request, Response, NextFunction } from 'express';
import * as reportService from '../services/reportService';

/**
 * Handle GET /api/reports/lineage/:personId
 */
export async function getLineageReportHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const personId = parseInt(req.params.personId, 10);
    if (isNaN(personId)) {
      res.status(400).json({ error: "Validation Error: 'personId' parameter must be a valid integer." });
      return;
    }

    const report = await reportService.generateLineageSummary(personId);
    res.json(report);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/reports/integrity
 */
export async function getDataIntegrityReportHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const report = await reportService.runDataIntegrityCheck();
    res.json(report);
  } catch (error: any) {
    next(error);
  }
}

/**
 * Handle GET /api/reports/biography/:personId
 */
export async function getBiographicalReportHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const personId = parseInt(req.params.personId, 10);
    if (isNaN(personId)) {
      res.status(400).json({ error: "Validation Error: 'personId' parameter must be a valid integer." });
      return;
    }

    const report = await reportService.compileBiographicalTimeline(personId);
    res.json(report);
  } catch (error: any) {
    next(error);
  }
}
