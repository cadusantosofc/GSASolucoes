import { Router } from 'express';
import * as UserController from '../controllers/UserController';
import * as CompanyController from '../controllers/CompanyController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Rota para obter dados do usuário autenticado
router.get('/me', authenticate, UserController.getMe);
router.get('/list', authenticate, UserController.getSubordinates);
router.get('/companies', authenticate, CompanyController.listCompanies);

export default router;
