import { Router } from 'express';
import { generateTicketQR, generateUpdateQR, validateQR } from '../controllers/qr.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/ticket', protect, generateTicketQR);
router.post('/update', protect, authorize('organizer', 'admin'), generateUpdateQR);
router.post('/validate', validateQR);
export default router;
