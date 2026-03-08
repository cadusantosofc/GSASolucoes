
import { Router } from 'express';
import { ProcessController } from '../controllers/ProcessController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate as any);

router.get('/list', ProcessController.list as any);
router.post('/create', ProcessController.create as any);
router.patch('/:id/status', ProcessController.updateStatus as any);

export default router;
