import prisma from '../lib/prisma';

export const createBase = async (data: any) => {
  // Verifica se o módulo existe
  const module = await prisma.module.findUnique({
    where: { id: data.moduleId }
  });

  if (!module) {
    throw new Error('Módulo não encontrado');
  }

  return await prisma.base.create({
    data: {
      name: data.name,
      description: data.description,
      cost: data.cost,
      status: data.status || 'ACTIVE',
      baseUrl: data.baseUrl,
      method: data.method || 'GET',
      headers: data.headers || {},
      bodyParams: data.bodyParams || {},
      moduleId: data.moduleId
    },
    include: {
      module: true
    }
  });
};

export const getAllBases = async () => {
  return await prisma.base.findMany({
    include: {
      module: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getBaseById = async (id: string) => {
  const base = await prisma.base.findUnique({
    where: { id },
    include: {
      module: true
    }
  });

  if (!base) {
    throw new Error('Base não encontrada');
  }

  return base;
};

export const getBasesByModule = async (moduleId: string) => {
  return await prisma.base.findMany({
    where: { moduleId },
    include: {
      module: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateBase = async (id: string, data: any) => {
  const base = await prisma.base.findUnique({ where: { id } });
  
  if (!base) {
    throw new Error('Base não encontrada');
  }

  return await prisma.base.update({
    where: { id },
    data,
    include: {
      module: true
    }
  });
};

export const deleteBase = async (id: string) => {
  const base = await prisma.base.findUnique({ where: { id } });

  if (!base) {
    throw new Error('Base não encontrada');
  }

  await prisma.base.delete({ where: { id } });
  
  return { message: 'Base deletada com sucesso' };
};
