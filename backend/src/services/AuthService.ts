import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

export const registerUser = async (data: any, creator?: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new Error('Este email já está em uso');
  }

  // Validação de Hierarquia
  const roleHierarchy: Record<string, number> = {
    'SUPER': 100,
    'ADMIN': 80,
    'GESTOR': 60,
    'VENDEDOR': 40,
    'CLIENTE': 20,
    'USER': 20
  };

  const requestedRole = (data.role as string || 'USER').toUpperCase();
  const creatorRole = (creator?.role || 'USER').toUpperCase();
  
  if (creator) {
    const creatorLevel = roleHierarchy[creatorRole] || 0;
    const targetLevel = roleHierarchy[requestedRole] || 0;

    // Apenas SUPER/ADMIN podem criar papéis de mesmo nível ou superiores (até seu limite)
    // Gestores e Vendedores SÓ podem criar papéis estritamente menores
    if (creatorRole !== 'SUPER' && creatorRole !== 'ADMIN') {
      if (targetLevel >= creatorLevel) {
        throw new Error(`Seu nível (${creatorRole}) não permite criar usuários com nível ${requestedRole}`);
      }
    } else if (creatorRole === 'ADMIN' && requestedRole === 'SUPER') {
      throw new Error('Administradores não podem criar Super Usuários');
    }
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);
  let companyId = data.companyId || null;

  if (data.companyName && (!creator || ['SUPER', 'ADMIN'].includes(creatorRole))) {
    const company = await prisma.company.create({
      data: {
        name: data.companyName,
        cnpj: data.cnpj,
      }
    });
    companyId = company.id;
  }

  // Se não for Admin/Super, o parentId DEVE ser o do criador
  let finalParentId = data.parentId;
  if (creator && !['SUPER', 'ADMIN'].includes(creatorRole)) {
    finalParentId = creator.userId;
    // Forçar o companyId do criador também se não for admin
    const creatorUser = await prisma.user.findUnique({ where: { id: creator.userId } });
    if (creatorUser) companyId = creatorUser.companyId;
  }

  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: requestedRole as Role,
      companyId: companyId,
      parentId: finalParentId,
      phone: data.phone,
      document: data.document,
      region: data.region,
      isAtivo: data.isAtivo || false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      balance: true,
      parentId: true,
    }
  });
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true }
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    await new Promise(r => setTimeout(r, 1000));
    throw new Error('Email ou senha incorretos');
  }

  if (!user.active) {
    throw new Error('Sua conta está desativada');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, companyId: user.companyId, parentId: user.parentId },
    String(process.env.JWT_SECRET),
    { expiresIn: String(process.env.JWT_EXPIRES_IN || '15d') as any }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance,
      companyId: user.companyId,
      company: user.company,
      parentId: user.parentId,
      phone: user.phone,
      document: user.document,
      region: user.region,
      isAtivo: user.isAtivo,
      active: user.active
    }
  };
};
