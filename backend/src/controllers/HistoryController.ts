import { Request, Response } from 'express';
import * as HistoryService from '../services/HistoryService';

export const createHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { query, moduleSlug, moduleName, baseName, cost, result, companyId, companyName } = req.body;

    if (!query || !moduleSlug || !moduleName || !baseName || cost === undefined || !result) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    const history = await HistoryService.createSearchHistory({
      query,
      moduleSlug,
      moduleName,
      baseName,
      cost,
      result,
      userId: user.userId,
      companyId,
      companyName
    });

    return res.status(201).json(history);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getMyHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const history = await HistoryService.getUserHistory(user.userId, limit);
    return res.json(history);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};

export const getCompanyHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { companyId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    // Verificar se o usuário pertence à empresa
    const userData = await (req as any).prisma.user.findUnique({
      where: { id: user.userId }
    });

    if (userData.companyId !== companyId && user.role !== 'SUPER') {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const history = await HistoryService.getCompanyHistory(companyId, limit);
    return res.json(history);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao buscar histórico da empresa' });
  }
};

export const createShare = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { historyId } = req.body;

    if (!historyId) {
      return res.status(400).json({ error: 'ID do histórico é obrigatório' });
    }

    const sharedLink = await HistoryService.createSharedLink(historyId, user.userId);

    return res.status(201).json({
      ...sharedLink,
      url: `${req.protocol}://${req.get('host')}/share/${sharedLink.token}`
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getShared = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const history = await HistoryService.getSharedLink(token);
    return res.json(history);
  } catch (error: any) {
    if (error.message === 'Link expirado') {
      return res.status(410).json({ error: 'Este link expirou' });
    }
    return res.status(404).json({ error: error.message });
  }
};

export const revokeShare = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { linkId } = req.params;

    const result = await HistoryService.revokeSharedLink(linkId, user.userId);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
