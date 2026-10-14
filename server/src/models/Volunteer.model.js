import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null },
  zoneName: String,
  availability: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available',
  },
  currentIncident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', default: null },
  skills: [String],
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure unique volunteer per event
volunteerSchema.index({ user: 1, event: 1 }, { unique: true });

const Volunteer = mongoose.model('Volunteer', volunteerSchema);
export default Volunteer;
