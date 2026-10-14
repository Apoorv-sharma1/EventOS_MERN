import mongoose from 'mongoose';

const timelineEntrySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const incidentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  zone: { type: mongoose.Schema.Types.ObjectId, ref: 'Zone', default: null },
  zoneName: String,
  type: {
    type: String,
    enum: ['medical', 'crowd', 'access', 'infrastructure', 'lost-found', 'fire', 'security', 'other'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['reported', 'assigned', 'accepted', 'on-the-way', 'arrived', 'resolved', 'cancelled'],
    default: 'reported',
  },
  title: { type: String, required: true },
  description: String,
  location: String,
  timeline: [timelineEntrySchema],
  resolvedAt: Date,
  resolutionNote: String,
}, { timestamps: true });

// Auto push initial timeline entry
incidentSchema.pre('save', function (next) {
  if (this.isNew) {
    this.timeline.push({ status: 'reported', note: 'Incident reported' });
  }
  next();
});

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
