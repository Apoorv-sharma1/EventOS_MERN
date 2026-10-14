import { Router } from 'express';
import { getVolunteers, joinAsVolunteer, updateAvailability } from '../controllers/volunteer.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', protect, getVolunteers);
router.post('/', protect, joinAsVolunteer);
router.patch('/:id/availability', protect, updateAvailability);
export default router;
