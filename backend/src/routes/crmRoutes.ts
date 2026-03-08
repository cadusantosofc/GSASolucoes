
import { Router } from 'express';
import { CRMController } from '../controllers/CRMController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate as any);

router.get('/list', CRMController.list as any);
router.post('/create', CRMController.create as any);
router.patch('/:id', CRMController.update as any);

export default router;
