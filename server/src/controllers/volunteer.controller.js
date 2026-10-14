import Volunteer from '../models/Volunteer.model.js';

// GET /api/volunteers?eventId=
export const getVolunteers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.event = req.query.eventId;
    if (req.query.availability) filter.availability = req.query.availability;
    const volunteers = await Volunteer.find(filter)
      .populate('user', 'name email phone')
      .populate('zone', 'name')
      .populate('currentIncident', 'title status type priority');
    res.json({ success: true, data: volunteers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/volunteers - join event as volunteer
export const joinAsVolunteer = async (req, res) => {
  try {
    const existing = await Volunteer.findOne({ user: req.user._id, event: req.body.event });
    if (existing) return res.status(400).json({ success: false, message: 'Already a volunteer for this event' });
    const volunteer = await Volunteer.create({ user: req.user._id, ...req.body });
    await volunteer.populate('user', 'name email');
    res.status(201).json({ success: true, data: volunteer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/volunteers/:id/availability
export const updateAvailability = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { availability: req.body.availability },
      { new: true }
    ).populate('user', 'name email');
    res.json({ success: true, data: volunteer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
