import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const impersonateId = req.headers['x-impersonate-company-id'] as string;
    
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        companyId: true,
        active: true,
        isAtivo: true,
        phone: true,
        document: true,
        region: true,
        parentId: true,
        company: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            balance: true
          }
        }
      }
    });

    if (!userData || !userData.active) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    // Lógica de Impersonation para SUPER
    if (user.role === 'SUPER' && impersonateId) {
      const targetCompany = await prisma.company.findUnique({
        where: { id: impersonateId }
      });

      if (targetCompany) {
        return res.json({
          ...userData,
          companyId: targetCompany.id,
          company: targetCompany,
          balance: targetCompany.balance,
          isImpersonating: true
        });
      }
    }

    return res.json({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      balance: userData.balance,
      companyId: userData.companyId,
      company: userData.company,
      isAtivo: userData.isAtivo,
      phone: userData.phone,
      document: userData.document,
      region: userData.region,
      parentId: userData.parentId
    });
  } catch (error: any) {
    console.error('Erro ao buscar dados do usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
};

export const getSubordinates = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    let where: any = {};

    if (user.role === 'SUPER') {
      // Super vê o sistema inteiro
      where = {};
    } else if (user.role === 'ADMIN') {
      // Admin vê todos da sua empresa
      where = { companyId: user.companyId };
    } else if (user.role === 'GESTOR') {
      // Gestor vê quem ele criou
      where = { parentId: user.userId };
    } else if (user.role === 'VENDEDOR') {
      // Vendedor vê apenas seus clientes
      where = { parentId: user.userId };
    } else {
      return res.status(403).json({ error: 'Sem permissão para listar usuários' });
    }

    const subordinates = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        isAtivo: true,
        phone: true,
        document: true,
        region: true,
        balance: true,
        createdAt: true
      }
    });

    return res.json(subordinates);
  } catch (error: any) {
    console.error('Erro ao buscar subordinados:', error);
    return res.status(500).json({ error: 'Erro ao buscar subordinados' });
  }
};
