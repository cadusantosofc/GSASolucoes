import prisma from '../lib/prisma';

export const createSearchHistory = async (data: any) => {
  const history = await prisma.searchHistory.create({
    data: {
      query: data.query,
      moduleSlug: data.moduleSlug,
      moduleName: data.moduleName,
      baseName: data.baseName,
      cost: data.cost,
      result: data.result,
      userId: data.userId,
      companyId: data.companyId,
      companyName: data.companyName
    }
  });

  return history;
};

export const getUserHistory = async (userId: string, limit: number = 50) => {
  return await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      sharedLinks: {
        where: {
          expiresAt: {
            gte: new Date() // Apenas links não expirados
          }
        }
      }
    }
  });
};

export const getCompanyHistory = async (companyId: string, limit: number = 50) => {
  return await prisma.searchHistory.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      sharedLinks: {
        where: {
          expiresAt: {
            gte: new Date()
          }
        }
      }
    }
  });
};

export const getHistoryById = async (id: string, userId: string) => {
  const history = await prisma.searchHistory.findUnique({
    where: { id },
    include: {
      sharedLinks: true
    }
  });

  if (!history) {
    throw new Error('Histórico não encontrado');
  }

  // Verificar se o usuário tem permissão
  if (history.userId !== userId) {
    throw new Error('Sem permissão para acessar este histórico');
  }

  return history;
};

export const createSharedLink = async (searchHistoryId: string, userId: string) => {
  // Verificar se o histórico existe e pertence ao usuário
  const history = await prisma.searchHistory.findUnique({
    where: { id: searchHistoryId }
  });

  if (!history) {
    throw new Error('Histórico não encontrado');
  }

  if (history.userId !== userId) {
    throw new Error('Sem permissão para compartilhar este histórico');
  }

  // Criar link com expiração de 24 horas
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const sharedLink = await prisma.sharedLink.create({
    data: {
      searchHistoryId,
      expiresAt
    }
  });

  return sharedLink;
};

export const getSharedLink = async (token: string) => {
  const sharedLink = await prisma.sharedLink.findUnique({
    where: { token },
    include: {
      searchHistory: true
    }
  });

  if (!sharedLink) {
    throw new Error('Link não encontrado');
  }

  // Verificar se expirou
  if (new Date() > sharedLink.expiresAt) {
    throw new Error('Link expirado');
  }

  // Incrementar contador de acessos
  await prisma.sharedLink.update({
    where: { id: sharedLink.id },
    data: {
      accessCount: {
        increment: 1
      }
    }
  });

  return sharedLink.searchHistory;
};

export const revokeSharedLink = async (linkId: string, userId: string) => {
  const sharedLink = await prisma.sharedLink.findUnique({
    where: { id: linkId },
    include: {
      searchHistory: true
    }
  });

  if (!sharedLink) {
    throw new Error('Link não encontrado');
  }

  if (sharedLink.searchHistory.userId !== userId) {
    throw new Error('Sem permissão para revogar este link');
  }

  await prisma.sharedLink.delete({
    where: { id: linkId }
  });

  return { message: 'Link revogado com sucesso' };
};

// Job para limpar links expirados (executar periodicamente)
export const cleanExpiredLinks = async () => {
  const result = await prisma.sharedLink.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });

  return { deleted: result.count };
};
