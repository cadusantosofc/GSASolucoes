
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProcessController {
  static async list(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { role, id, companyId } = user;

      let where: any = {};

      // Filtro Hierárquico
      if (role === 'SUPER') {
        // Super vê tudo ou filtrado por empresa via header impersonate
        const impId = req.headers['x-impersonate-company-id'] as string;
        if (impId) where.companyId = impId;
      } else if (role === 'ADMIN') {
        // Admin vê tudo da sua empresa
        where.companyId = companyId;
      } else if (['GESTOR', 'VENDEDOR'].includes(role)) {
        // Dono do processo ou subordinados (simplificado para dono por enquanto)
        where.ownerId = id;
      } else if (role === 'CLIENTE') {
        // Cliente vê apenas os seus
        where.clientId = id;
      }

      const processes = await prisma.process.findMany({
        where,
        include: {
          client: { select: { name: true, email: true } },
          owner: { select: { name: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(processes);
    } catch (error: any) {
      console.error('Erro ao listar processos:', error);
      return res.status(500).json({ error: 'Erro interno ao listar processos' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { type, clientId, description, debtValue, setupFee } = req.body;

      // Apenas Vendedor, Gestor, Admin ou Super podem criar processos para clientes
      if (user.role === 'CLIENTE') {
        return res.status(403).json({ error: 'Clientes não podem criar processos diretamente' });
      }

      // Calcular honorários (10% da dívida se aplicável ao tipo)
      let totalFee = 0;
      if (debtValue) {
        totalFee = debtValue * 0.1;
      }

      const process = await prisma.process.create({
        data: {
          type,
          clientId,
          ownerId: user.id,
          companyId: user.companyId,
          description,
          debtValue,
          setupFee: setupFee || 997.00,
          totalFee,
          status: 'ENVIADO'
        },
        include: {
          client: { select: { name: true } }
        }
      });

      return res.status(201).json(process);
    } catch (error: any) {
      console.error('Erro ao criar processo:', error);
      return res.status(500).json({ error: 'Erro interno ao criar processo' });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, sugestao } = req.body;
      const user = (req as any).user;

      // Apenas equipe interna pode mudar status
      if (user.role === 'CLIENTE') {
        return res.status(403).json({ error: 'Permissão negada para alterar status' });
      }

      const process = await prisma.process.update({
        where: { id },
        data: { 
          status,
          updatedAt: new Date()
        }
      });

      return res.json(process);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }
}
