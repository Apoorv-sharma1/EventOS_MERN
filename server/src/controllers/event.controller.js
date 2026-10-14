import Event from '../models/Event.model.js';
import Zone from '../models/Zone.model.js';

// GET /api/events - list public events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ isPublic: true })
      .populate('organizer', 'name email')
      .sort({ startDate: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/events - create event (organizer+)
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/:id - get single event
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/events/:id - update event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/events/:id/register - attendee self-registers
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.registrations.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }
    if (event.registrations.length >= event.maxAttendees) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
    event.registrations.push(req.user._id);
    await event.save();
    res.json({ success: true, message: 'Registered successfully', data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/:id/pack - full offline event pack snapshot
export const getEventPack = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email phone');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const zones = await Zone.find({ event: req.params.id });
    const pack = {
      packVersion: event.packVersion,
      downloadedAt: new Date().toISOString(),
      event: event.toJSON(),
      zones,
    };
    res.json({ success: true, data: pack });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/events/:id/schedule/:itemId - update a single schedule item
export const updateScheduleItem = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const item = event.schedule.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Schedule item not found' });
    Object.assign(item, req.body);
    item.version = (item.version || 1) + 1;
    event.packVersion += 1;
    await event.save();
    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
