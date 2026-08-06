import { Request, Response } from 'express';
import { getClans, getRegions, getParamountcies, getSubStools } from '../services/familyService';

export const listClansHandler = async (req: Request, res: Response) => {
  try {
    const clans = await getClans();
    res.json(clans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clans' });
  }
};

export const listRegionsHandler = async (req: Request, res: Response) => {
  try {
    const regions = await getRegions();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
};

export const listParamountciesHandler = async (req: Request, res: Response) => {
  try {
    const paramountcies = await getParamountcies();
    res.json(paramountcies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch paramountcies' });
  }
};

export const listSubStoolsHandler = async (req: Request, res: Response) => {
  try {
    const subStools = await getSubStools();
    res.json(subStools);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sub-stools' });
  }
};

export const createRegionHandler = async (req: Request, res: Response, next: any) => {
  try {
    const { createRegion } = await import('../services/familyService');
    const region = await createRegion(req.body.name);
    res.status(201).json(region);
  } catch (error) { next(error); }
};

export const updateRegionHandler = async (req: Request, res: Response, next: any) => {
  try {
    const { updateRegion } = await import('../services/familyService');
    const region = await updateRegion(Number(req.params.id), req.body.name);
    res.json(region);
  } catch (error) { next(error); }
};

export const deleteRegionHandler = async (req: Request, res: Response, next: any) => {
  try {
    const { deleteRegion } = await import('../services/familyService');
    await deleteRegion(Number(req.params.id));
    res.json({ message: 'Region deleted' });
  } catch (error) { next(error); }
};

export const createParamountcyHandler = async (req: Request, res: Response, next: any) => {
  try {
    const { createParamountcy } = await import('../services/familyService');
    const param = await createParamountcy(req.body.name, Number(req.body.regionId));
    res.status(201).json(param);
  } catch (error) { next(error); }
};

export const updateParamountcyHandler = async (req: Request, res: Response, next: any) => {
  try {
    const { updateParamountcy } = await import('../services/familyService');
    const param = await updateParamountcy(Number(req.params.id), req.body.name, Number(req.body.regionId));
    res.json(param);
  } catch (error) { next(error); }
};

export const deleteParamountcyHandler = async (req: Request, res: Response, next: any) => {
  try {
    const { deleteParamountcy } = await import('../services/familyService');
    await deleteParamountcy(Number(req.params.id));
    res.json({ message: 'Paramountcy deleted' });
  } catch (error) { next(error); }
};

export const createSubStoolHandler = async (req: Request, res: Response, next: any) => {
  try {
    const { createSubStool } = await import('../services/familyService');
    const stool = await createSubStool(req.body.name, Number(req.body.paramountcyId));
    res.status(201).json(stool);
  } catch (error) { next(error); }
};

export const updateSubStoolHandler = async (req: Request, res: Response, next: any) => {
  try {
    const { updateSubStool } = await import('../services/familyService');
    const stool = await updateSubStool(Number(req.params.id), req.body.name, Number(req.body.paramountcyId));
    res.json(stool);
  } catch (error) { next(error); }
};

export const deleteSubStoolHandler = async (req: Request, res: Response, next: any) => {
  try {
    const { deleteSubStool } = await import('../services/familyService');
    await deleteSubStool(Number(req.params.id));
    res.json({ message: 'Sub-Stool deleted' });
  } catch (error) { next(error); }
};
