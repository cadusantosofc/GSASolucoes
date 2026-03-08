
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CRMController {
  static async list(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const where: any = {};

      if (user.role !== 'SUPER') {
        where.vendedorId = user.id;
      }

      const leads = await prisma.cRMLead.findMany({
        where,
        orderBy: { updatedAt: 'desc' }
      });

      return res.json(leads);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar leads' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { name, email, phone, document, funnel, proposta, notes } = req.body;

      const lead = await prisma.cRMLead.create({
        data: {
          name,
          email,
          phone,
          document,
          funnel: funnel || 'ORCAMENTO',
          proposta,
          notes,
          vendedorId: user.id
        }
      });

      return res.status(201).json(lead);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar lead' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const lead = await prisma.cRMLead.update({
        where: { id },
        data
      });

      return res.json(lead);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar lead' });
    }
  }
}
