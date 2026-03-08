import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

interface TokenPayload {
  userId: string;
  role: string;
  companyId?: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    
    // Injetar dados do usuário no request para uso nas rotas protegidas
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    const userRole = (user.role || '').toLowerCase();

    if (!user || (userRole !== 'super' && !allowedRoles.some(r => r.toLowerCase() === userRole))) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar este recurso' });
    }

    next();
  };
};
