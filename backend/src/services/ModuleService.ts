import prisma from '../lib/prisma';
import { makeApiRequest } from '../utils/apiHelper';
import * as HistoryService from './HistoryService';

export const createModule = async (data: any) => {
  const existingModule = await prisma.module.findUnique({
    where: { slug: data.slug }
  });

  if (existingModule) {
    throw new Error('Já existe um módulo com este slug');
  }

  return await prisma.module.create({
    data: {
      name: data.name,
      description: data.description,
      icon: data.icon,
      slug: data.slug
    },
    include: {
      bases: true
    }
  });
};

export const getAllModules = async () => {
  return await prisma.module.findMany({
    include: {
      bases: {
        where: { status: 'ACTIVE' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getModuleById = async (id: string) => {
  const module = await prisma.module.findUnique({
    where: { id },
    include: {
      bases: true
    }
  });

  if (!module) {
    throw new Error('Módulo não encontrado');
  }

  return module;
};

export const updateModule = async (id: string, data: any) => {
  const module = await prisma.module.findUnique({ where: { id } });
  
  if (!module) {
    throw new Error('Módulo não encontrado');
  }

  if (data.slug && data.slug !== module.slug) {
    const existingSlug = await prisma.module.findUnique({
      where: { slug: data.slug }
    });
    
    if (existingSlug) {
      throw new Error('Já existe um módulo com este slug');
    }
  }

  return await prisma.module.update({
    where: { id },
    data,
    include: {
      bases: true
    }
  });
};

export const deleteModule = async (id: string) => {
  const module = await prisma.module.findUnique({
    where: { id },
    include: { bases: true }
  });

  if (!module) {
    throw new Error('Módulo não encontrado');
  }

  if (module.bases.length > 0) {
    throw new Error('Não é possível deletar um módulo que possui bases vinculadas');
  }

  await prisma.module.delete({ where: { id } });
  
  return { message: 'Módulo deletado com sucesso' };
};

export const search = async (userId: string, baseId: string, document: string) => {
  // 1. Buscar usuário e verificar saldo
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { company: true } });
  if (!user) throw new Error('Usuário não encontrado');
  if (!user.active) throw new Error('Usuário inativo');

  // 2. Buscar Base e Módulo
  const base = await prisma.base.findUnique({ 
    where: { id: baseId },
    include: { module: true }
  });
  if (!base) throw new Error('Base não encontrada');
  if (base.status !== 'ACTIVE') throw new Error('Base inativa');

  // 3. Verificar saldo (usar saldo da empresa se houver, senão do usuário)
  console.log(`[ModuleService] Base Headers from DB:`, JSON.stringify(base.headers)); // DEBUG
  const balance = user.company ? user.company.balance : user.balance;
  if (balance < base.cost) throw new Error('Saldo insuficiente');

  // 4. Executar requisição externa
  const requestOptions = {
    url: base.baseUrl,
    method: base.method,
    headers: base.headers,
    bodyParams: base.bodyParams,
    replacements: {
      doc: document,
      token: process.env.API_KEY || '', // Token do sistema
      user_id: user.id
    }
  };

  let result;
  let status = 'success';
  try {
    const apiResponse = await makeApiRequest(requestOptions as any);
    
    // Se a API retornar erro HTTP (mesmo 200 com msg de erro), podemos tratar aqui
    if (apiResponse.status >= 400) {
       throw new Error(`API Externa retornou erro ${apiResponse.status}`);
    }
    
    result = apiResponse.data;
  } catch (error: any) {
    status = 'error';
    result = { error: error.message };
    throw error; // Repassar erro para o controller
  } finally {
    // 5. Salvar Histórico (independente de sucesso ou falha, mas só cobra se sucesso)
    if (status === 'success') {
      // Debitar saldo
      if (user.company) {
        await prisma.company.update({
          where: { id: user.company.id },
          data: { balance: { decrement: base.cost } }
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { balance: { decrement: base.cost } }
        });
      }

      // Registrar histórico
      await HistoryService.createSearchHistory({
        query: document,
        moduleSlug: base.module.slug,
        moduleName: base.module.name,
        baseName: base.name,
        cost: base.cost,
        result: result,
        userId: user.id,
        companyId: user.companyId,
        companyName: user.company?.name
      });
    }
  }

  return result;
};
