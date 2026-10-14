import { Router } from 'express';
import { getZones, createZone, updateZone, deleteZone } from '../controllers/zone.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', protect, getZones);
router.post('/', protect, authorize('organizer', 'admin'), createZone);
router.patch('/:id', protect, authorize('organizer', 'admin'), updateZone);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteZone);
export default router;
