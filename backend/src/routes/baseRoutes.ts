import { Router } from 'express';
import * as BaseController from '../controllers/BaseController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Rotas públicas (qualquer usuário autenticado)
router.get('/', BaseController.getAll);
router.get('/:id', BaseController.getById);
router.get('/module/:moduleId', BaseController.getByModule);

// Rotas administrativas (apenas ADMIN e SUPER)
router.post('/', authorize(['ADMIN', 'SUPER']), BaseController.create);
router.put('/:id', authorize(['ADMIN', 'SUPER']), BaseController.update);
router.delete('/:id', authorize(['ADMIN', 'SUPER']), BaseController.remove);

export default router;
