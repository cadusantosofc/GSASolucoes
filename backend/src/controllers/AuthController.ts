import { Request, Response } from 'express';
import * as AuthService from '../services/AuthService';
import { loginSchema, registerSchema } from '../schemas/authSchemas';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const creator = (req as any).user;
    const user = await AuthService.registerUser(data, creator);
    return res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
    }
    const message = error instanceof Error ? error.message : 'Erro interno';
    return res.status(error instanceof Error && error.message.includes('uso') ? 400 : 500).json({ error: message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await AuthService.loginUser(email, password);
    return res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }
    const message = error instanceof Error ? error.message : 'Erro interno';
    return res.status(401).json({ error: message });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      balance: user.balance,
      companyId: user.companyId,
      company: user.company
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
};
