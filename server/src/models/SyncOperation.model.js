import mongoose from 'mongoose';

const syncOperationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  operationId: { type: String, required: true, unique: true },
  entityType: {
    type: String,
    enum: ['incident', 'schedule', 'zone', 'profile'],
    required: true,
  },
  entityId: String,
  action: { type: String, enum: ['create', 'update', 'delete'], required: true },
  payload: { type: mongoose.Schema.Types.Mixed },
  status: {
    type: String,
    enum: ['pending', 'applied', 'rejected', 'conflict'],
    default: 'pending',
  },
  clientTimestamp: { type: Date, required: true },
  serverTimestamp: { type: Date, default: Date.now },
  error: String,
}, { timestamps: true });

const SyncOperation = mongoose.model('SyncOperation', syncOperationSchema);
export default SyncOperation;
