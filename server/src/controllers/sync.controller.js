import SyncOperation from '../models/SyncOperation.model.js';
import Incident from '../models/Incident.model.js';

// POST /api/sync - receive batch of offline operations
export const syncOperations = async (req, res) => {
  try {
    const { operations } = req.body;
    if (!Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({ success: false, message: 'No operations provided' });
    }
    const results = [];
    for (const op of operations) {
      // Check duplicate
      const existing = await SyncOperation.findOne({ operationId: op.operationId });
      if (existing) {
        results.push({ operationId: op.operationId, status: 'applied', note: 'Already processed' });
        continue;
      }
      try {
        // Save to log first
        const syncOp = await SyncOperation.create({
          ...op,
          user: req.user._id,
          status: 'pending',
          clientTimestamp: new Date(op.clientTimestamp),
        });
        // Apply operation
        if (op.entityType === 'incident' && op.action === 'create') {
          await Incident.create({ ...op.payload, reportedBy: req.user._id });
        }
        syncOp.status = 'applied';
        await syncOp.save();
        results.push({ operationId: op.operationId, status: 'applied' });
      } catch (opErr) {
        results.push({ operationId: op.operationId, status: 'rejected', error: opErr.message });
      }
    }
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/sync/status
export const getSyncStatus = async (req, res) => {
  try {
    const pending = await SyncOperation.countDocuments({ user: req.user._id, status: 'pending' });
    const applied = await SyncOperation.countDocuments({ user: req.user._id, status: 'applied' });
    res.json({ success: true, data: { pending, applied } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
