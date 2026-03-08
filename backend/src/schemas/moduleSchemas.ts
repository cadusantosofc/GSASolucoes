import { z } from 'zod';

export const createModuleSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  description: z.string().min(5, 'Descrição deve ter no mínimo 5 caracteres'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
});

export const updateModuleSchema = createModuleSchema.partial();

export const createBaseSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  description: z.string().optional(),
  cost: z.number().min(0, 'Custo não pode ser negativo'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  baseUrl: z.string().url('URL inválida'),
  method: z.enum(['GET', 'POST']).default('GET'),
  headers: z.record(z.string()).optional(),
  bodyParams: z.record(z.any()).optional(),
  moduleId: z.string().uuid('ID do módulo inválido')
});

export const updateBaseSchema = createBaseSchema.partial().omit({ moduleId: true });
