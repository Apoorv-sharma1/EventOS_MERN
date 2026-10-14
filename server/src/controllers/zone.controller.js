import Zone from '../models/Zone.model.js';
import { io } from '../server.js';

export const getZones = async (req, res) => {
  try {
    const zones = await Zone.find({ event: req.query.eventId }).populate('assignedVolunteers', 'name');
    res.json({ success: true, data: zones });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createZone = async (req, res) => {
  try {
    const zone = await Zone.create(req.body);
    res.status(201).json({ success: true, data: zone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateZone = async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
    if (req.body.status && req.body.status !== zone.status) {
      zone.statusHistory.push({
        status: req.body.status,
        changedBy: req.user._id,
        reason: req.body.reason || '',
      });
    }
    Object.assign(zone, req.body);
    await zone.save();
    io.to(`event:${zone.event}`).emit('zone:updated', zone);
    res.json({ success: true, data: zone });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteZone = async (req, res) => {
  try {
    await Zone.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Zone deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
