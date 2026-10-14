import mongoose from 'mongoose';

const scheduleItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  speaker: String,
  zone: String,
  venue: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  type: { type: String, enum: ['session', 'workshop', 'break', 'ceremony', 'other'], default: 'session' },
  version: { type: Number, default: 1 },
}, { _id: true });

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: String,
  phone: String,
  email: String,
}, { _id: false });

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  tagline: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  venue: { type: String, required: true },
  bannerUrl: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['draft', 'published', 'live', 'completed', 'cancelled'],
    default: 'draft',
  },
  schedule: [scheduleItemSchema],
  contacts: [contactSchema],
  rules: [String],
  registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxAttendees: { type: Number, default: 1000 },
  packVersion: { type: Number, default: 1 },
  isPublic: { type: Boolean, default: true },
  tags: [String],
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);
export default Event;
