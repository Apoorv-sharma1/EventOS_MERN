import QRCode from 'qrcode';
import Event from '../models/Event.model.js';

// POST /api/qr/ticket - generate QR ticket for attendee
export const generateTicketQR = async (req, res) => {
  try {
    const { eventId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const payload = JSON.stringify({
      type: 'ticket',
      userId: req.user._id,
      userName: req.user.name,
      eventId,
      eventName: event.name,
      issuedAt: new Date().toISOString(),
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });

    res.json({ success: true, data: { qr: qrDataUrl, payload } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/qr/update - generate QR for a schedule update (organizer only)
export const generateUpdateQR = async (req, res) => {
  try {
    const { eventId, scheduleItemId, changes, validFrom, description } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const payload = JSON.stringify({
      type: 'event-update',
      eventId,
      eventName: event.name,
      scheduleItemId,
      changes,
      validFrom,
      description,
      updateVersion: `v${event.packVersion}`,
      issuedBy: req.user.name,
      issuedAt: new Date().toISOString(),
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: { dark: '#0f3460', light: '#ffffff' },
    });

    res.json({ success: true, data: { qr: qrDataUrl, payload, updateVersion: `v${event.packVersion}` } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/qr/validate - validate a scanned QR payload
export const validateQR = async (req, res) => {
  try {
    const { payload } = req.body;
    const data = JSON.parse(payload);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid QR payload' });
  }
};
