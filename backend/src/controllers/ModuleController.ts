import { Request, Response } from 'express';
import { createModuleSchema, updateModuleSchema } from '../schemas/moduleSchemas';
import * as ModuleService from '../services/ModuleService';

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createModuleSchema.parse(req.body);
    const module = await ModuleService.createModule(validatedData);
    
    return res.status(201).json(module);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    return res.status(400).json({ error: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const modules = await ModuleService.getAllModules();
    return res.json(modules);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao buscar módulos' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const module = await ModuleService.getModuleById(id);
    return res.json(module);
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateModuleSchema.parse(req.body);
    const module = await ModuleService.updateModule(id, validatedData);
    
    return res.json(module);
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
    const result = await ModuleService.deleteModule(id);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { baseId, document } = req.body;

    if (!baseId || !document) {
      return res.status(400).json({ error: 'BaseId e Documento são obrigatórios' });
    }

    const result = await ModuleService.search(user.userId, baseId, document);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
