import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/api';
import QRCode from 'qrcode';

export default function MyTicketPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/events').then(res => setEvents(res.data.data)).catch(() => {});
  }, []);

  const generateTicket = async () => {
    if (!selectedEvent) { toast.warning('Select an event', 'Please select an event first.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/qr/ticket', { eventId: selectedEvent });
      setQrDataUrl(res.data.data.qr);
      toast.success('Ticket Generated!', 'Your QR ticket is ready.');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Failed to generate ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🎟️ My Ticket</h1>
        <p className="page-subtitle">Your QR entry ticket for registered events</p>
      </div>

      <div className="container" style={{ paddingBottom: 'var(--sp-8)', maxWidth: 500 }}>
        <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="ticket-event-select">Select Event</label>
            <select id="ticket-event-select" className="form-control form-control-select"
              value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
              <option value="">-- Choose Event --</option>
              {events.map(e => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>
          <button id="generate-ticket-btn" className="btn btn-primary btn-full" onClick={generateTicket} disabled={loading}>
            {loading ? <><span className="spinner" /> Generating...</> : '🎟️ Generate QR Ticket'}
          </button>
        </div>

        {qrDataUrl && (
          <div className="ticket-card animate-scale-in">
            <div className="ticket-header">
              <div className="ticket-logo">⚡ EventOS</div>
              <div className="ticket-badge">ENTRY PASS</div>
            </div>
            <div className="ticket-user">
              <div className="ticket-name">{user?.name}</div>
              <div className="ticket-role badge badge-primary">{user?.role?.toUpperCase()}</div>
            </div>
            <div className="ticket-qr-wrapper">
              <img src={qrDataUrl} alt="QR Ticket" className="ticket-qr" />
            </div>
            <div className="ticket-footer">
              <div className="ticket-footer-text">Scan at entry gate</div>
              <div className="ticket-footer-id">{user?._id?.slice(-8)?.toUpperCase()}</div>
            </div>
            <div className="ticket-perforations" />
          </div>
        )}
      </div>

      <style>{`
        .ticket-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border-glow);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-glow), var(--shadow-lg);
        }
        .ticket-header {
          background: linear-gradient(135deg, var(--color-primary-dark), #1a1078);
          padding: var(--sp-5) var(--sp-6);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ticket-logo { font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; }
        .ticket-badge {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: var(--radius-full);
          padding: 4px var(--sp-3);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        .ticket-user {
          padding: var(--sp-5) var(--sp-6) var(--sp-4);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ticket-name { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; }
        .ticket-qr-wrapper {
          display: flex;
          justify-content: center;
          padding: var(--sp-4);
          background: white;
          margin: 0 var(--sp-6);
          border-radius: var(--radius-lg);
        }
        .ticket-qr { width: 200px; height: 200px; }
        .ticket-perforations {
          height: 2px;
          background: repeating-linear-gradient(90deg, var(--color-border) 0, var(--color-border) 8px, transparent 8px, transparent 16px);
          margin: var(--sp-4) 0;
        }
        .ticket-footer {
          display: flex;
          justify-content: space-between;
          padding: var(--sp-3) var(--sp-6) var(--sp-6);
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
        .ticket-footer-id { font-family: monospace; letter-spacing: 0.08em; }
      `}</style>
    </div>
  );
}
