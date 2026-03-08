import { Router } from 'express';
import * as ModuleController from '../controllers/ModuleController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas públicas (qualquer usuário autenticado)
router.get('/', ModuleController.getAll);
router.get('/:id', ModuleController.getById);

// Rotas administrativas (apenas ADMIN e SUPER)
router.post('/', authorize(['ADMIN', 'SUPER']), ModuleController.create);
router.put('/:id', authorize(['ADMIN', 'SUPER']), ModuleController.update);
router.delete('/:id', authorize(['ADMIN', 'SUPER']), ModuleController.remove);

// Executar busca (proxy)
router.post('/search', ModuleController.search);

export default router;
