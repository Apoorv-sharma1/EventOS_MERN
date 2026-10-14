import Incident from '../models/Incident.model.js';
import Volunteer from '../models/Volunteer.model.js';
import { io } from '../server.js';

// Valid state transitions
const TRANSITIONS = {
  reported: ['assigned', 'cancelled'],
  assigned: ['accepted', 'cancelled'],
  accepted: ['on-the-way', 'cancelled'],
  'on-the-way': ['arrived'],
  arrived: ['resolved'],
  resolved: [],
  cancelled: [],
};

// GET /api/incidents?eventId=
export const getIncidents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.event = req.query.eventId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    const incidents = await Incident.find(filter)
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role')
      .populate('zone', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/incidents
export const createIncident = async (req, res) => {
  try {
    const incident = await Incident.create({ ...req.body, reportedBy: req.user._id });
    await incident.populate('reportedBy', 'name role');
    // Broadcast to organizers
    io.to(`event:${incident.event}`).emit('incident:new', incident);
    res.status(201).json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/incidents/:id
export const getIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role phone')
      .populate('zone', 'name status');
    if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });
    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/incidents/:id/assign
export const assignIncident = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Not found' });
    incident.assignedTo = volunteerId;
    incident.status = 'assigned';
    incident.timeline.push({
      status: 'assigned',
      note: `Assigned to volunteer`,
      updatedBy: req.user._id,
    });
    await incident.save();
    // Update volunteer availability
    await Volunteer.findOneAndUpdate(
      { user: volunteerId, event: incident.event },
      { availability: 'busy', currentIncident: incident._id }
    );
    await incident.populate('assignedTo', 'name role');
    io.to(`event:${incident.event}`).emit('incident:updated', incident);
    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/incidents/:id/status
export const updateIncidentStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ success: false, message: 'Not found' });
    const allowed = TRANSITIONS[incident.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from '${incident.status}' to '${status}'`,
      });
    }
    incident.status = status;
    incident.timeline.push({ status, note: note || '', updatedBy: req.user._id });
    if (status === 'resolved') {
      incident.resolvedAt = new Date();
      incident.resolutionNote = note;
      // Free up volunteer
      if (incident.assignedTo) {
        await Volunteer.findOneAndUpdate(
          { user: incident.assignedTo, event: incident.event },
          { availability: 'available', currentIncident: null }
        );
      }
    }
    await incident.save();
    await incident.populate('reportedBy', 'name role');
    await incident.populate('assignedTo', 'name role');
    io.to(`event:${incident.event}`).emit('incident:updated', incident);
    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
