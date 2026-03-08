import { Router } from 'express';
import * as HistoryController from '../controllers/HistoryController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Rotas protegidas (requerem autenticação)
router.post('/', authenticate, HistoryController.createHistory);
router.get('/my', authenticate, HistoryController.getMyHistory);
router.get('/company/:companyId', authenticate, HistoryController.getCompanyHistory);

// Compartilhamento
router.post('/share', authenticate, HistoryController.createShare);
router.delete('/share/:linkId', authenticate, HistoryController.revokeShare);

// Rota pública para acessar link compartilhado
router.get('/shared/:token', HistoryController.getShared);

export default router;
