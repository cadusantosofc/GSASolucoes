import { Request, Response } from 'express';
import { createBaseSchema, updateBaseSchema } from '../schemas/moduleSchemas';
import * as BaseService from '../services/BaseService';

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createBaseSchema.parse(req.body);
    const base = await BaseService.createBase(validatedData);
    
    return res.status(201).json(base);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const bases = await BaseService.getAllBases();
    return res.json(bases);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao buscar bases' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const base = await BaseService.getBaseById(id);
    return res.json(base);
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
};

export const getByModule = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const bases = await BaseService.getBasesByModule(moduleId);
    return res.json(bases);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao buscar bases do módulo' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateBaseSchema.parse(req.body);
    const base = await BaseService.updateBase(id, validatedData);
    
    return res.json(base);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await BaseService.deleteBase(id);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
