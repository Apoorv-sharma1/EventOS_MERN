import { Router } from 'express';
import {
  getIncidents, createIncident, getIncident, assignIncident, updateIncidentStatus
} from '../controllers/incident.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', protect, getIncidents);
router.post('/', protect, createIncident);
router.get('/:id', protect, getIncident);
router.patch('/:id/assign', protect, authorize('organizer', 'admin'), assignIncident);
router.patch('/:id/status', protect, updateIncidentStatus);
export default router;
