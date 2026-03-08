import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const listCompanies = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!['SUPER', 'ADMIN'].includes(user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' }
    });

    return res.json(companies);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return res.status(500).json({ error: 'Erro ao listar empresas' });
  }
};
