import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  description: String,
  color: { type: String, default: '#4CAF50' },
  status: {
    type: String,
    enum: ['normal', 'warning', 'critical'],
    default: 'normal',
  },
  capacity: { type: Number, default: 500 },
  currentOccupancy: { type: Number, default: 0 },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 100 },
    height: { type: Number, default: 100 },
  },
  assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

const Zone = mongoose.model('Zone', zoneSchema);
export default Zone;
