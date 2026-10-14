import { Router } from 'express';
import {
  getEvents, createEvent, getEvent, updateEvent,
  registerForEvent, getEventPack, updateScheduleItem
} from '../controllers/event.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', getEvents);
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.get('/:id', getEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.post('/:id/register', protect, registerForEvent);
router.get('/:id/pack', protect, getEventPack);
router.patch('/:id/schedule/:itemId', protect, authorize('organizer', 'admin'), updateScheduleItem);
export default router;
