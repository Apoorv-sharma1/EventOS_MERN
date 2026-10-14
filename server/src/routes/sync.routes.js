import { Router } from 'express';
import { syncOperations, getSyncStatus } from '../controllers/sync.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/', protect, syncOperations);
router.get('/status', protect, getSyncStatus);
export default router;
