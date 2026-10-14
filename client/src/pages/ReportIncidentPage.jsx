import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { addToSyncQueue } from '../lib/db';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const INCIDENT_TYPES = [
  { value: 'medical', label: '🏥 Medical', color: '#ef4444' },
  { value: 'crowd', label: '👥 Crowd', color: '#f59e0b' },
  { value: 'access', label: '🚪 Access', color: '#3b82f6' },
  { value: 'infrastructure', label: '🔧 Infrastructure', color: '#6b7280' },
  { value: 'lost-found', label: '🔍 Lost & Found', color: '#10b981' },
  { value: 'fire', label: '🔥 Fire', color: '#dc2626' },
  { value: 'security', label: '🛡️ Security', color: '#8b5cf6' },
  { value: 'other', label: '📌 Other', color: '#9d9ab4' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#6b7280' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'critical', label: '🚨 Critical', color: '#ef4444' },
];

export default function ReportIncidentPage() {
  const isOnline = useOnlineStatus();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    event: '', type: 'medical', priority: 'medium',
    title: '', description: '', location: '', zoneName: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/events').then(res => setEvents(res.data.data)).catch(() => {});
  }, []);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.event || !form.title.trim()) {
      toast.warning('Missing fields', 'Please fill in event and incident title.');
      return;
    }
    setLoading(true);
    try {
      if (isOnline) {
        await api.post('/incidents', { ...form, reportedBy: user._id });
        toast.success('Incident Reported!', 'Organizers have been notified.');
      } else {
        // Queue offline
        await addToSyncQueue({
          operationId: uuidv4(),
          entityType: 'incident',
          action: 'create',
          payload: { ...form },
          clientTimestamp: new Date().toISOString(),
        });
        toast.warning('Saved Offline', 'Incident will sync when you reconnect.');
      }
      setSubmitted(true);
    } catch (err) {
      toast.error('Report Failed', err.response?.data?.message || 'Try again later');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="empty-state animate-scale-in">
      <div className="empty-state-icon" style={{ fontSize: '4rem' }}>
        {form.priority === 'critical' ? '🚨' : '✅'}
      </div>
      <div className="empty-state-title" style={{ color: 'var(--color-text-primary)', fontSize: '1.5rem' }}>
        {isOnline ? 'Incident Reported!' : 'Saved for Sync'}
      </div>
      <div className="empty-state-desc">
        {isOnline
          ? 'The organizer team has been alerted. A volunteer will be dispatched shortly.'
          : 'Incident saved locally. It will be synced when you reconnect.'}
      </div>
      <div className="flex gap-3 mt-6">
        <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>Report Another</button>
        <button className="btn btn-primary" onClick={() => navigate('/events')}>Back to Events</button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🚨 Report Incident</h1>
        <p className="page-subtitle">
          {isOnline ? 'Alert organizers immediately' : '📴 Offline — will sync when reconnected'}
        </p>
      </div>

      <div className="container" style={{ paddingBottom: 'var(--sp-8)', maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
            <h2 className="section-card-title" style={{ marginBottom: 'var(--sp-4)' }}>Event & Location</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="incident-event">Event</label>
              <select id="incident-event" name="event" className="form-control form-control-select"
                value={form.event} onChange={handleChange} required>
                <option value="">-- Select Event --</option>
                {events.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="incident-location">Location / Gate</label>
                <input id="incident-location" name="location" className="form-control"
                  placeholder="e.g. Gate 2, Main Hall" value={form.location} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="incident-zone">Zone</label>
                <input id="incident-zone" name="zoneName" className="form-control"
                  placeholder="e.g. Zone A" value={form.zoneName} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
            <h2 className="section-card-title" style={{ marginBottom: 'var(--sp-4)' }}>Incident Type</h2>
            <div className="type-picker">
              {INCIDENT_TYPES.map(t => (
                <label key={t.value} className={`type-option ${form.type === t.value ? 'selected' : ''}`}
                  style={{ '--type-color': t.color }}>
                  <input type="radio" name="type" value={t.value} checked={form.type === t.value}
                    onChange={handleChange} hidden />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
            <h2 className="section-card-title" style={{ marginBottom: 'var(--sp-4)' }}>Priority</h2>
            <div className="priority-picker">
              {PRIORITIES.map(p => (
                <label key={p.value} className={`priority-option ${form.priority === p.value ? 'selected' : ''}`}
                  style={{ '--p-color': p.color }}>
                  <input type="radio" name="priority" value={p.value} checked={form.priority === p.value}
                    onChange={handleChange} hidden />
                  <div className="priority-dot" style={{ background: p.color }} />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
            <h2 className="section-card-title" style={{ marginBottom: 'var(--sp-4)' }}>Details</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="incident-title">Incident Title *</label>
              <input id="incident-title" name="title" className="form-control"
                placeholder="Brief description of the incident" value={form.title}
                onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="incident-desc">Additional Details</label>
              <textarea id="incident-desc" name="description" className="form-control" rows={4}
                placeholder="Describe the situation in detail..." value={form.description}
                onChange={handleChange} />
            </div>
          </div>

          <button id="submit-incident-btn" type="submit" className={`btn btn-full btn-lg ${form.priority === 'critical' ? 'btn-danger' : 'btn-primary'}`}
            disabled={loading}>
            {loading ? <><span className="spinner" /> Reporting...</> : `🚨 Report ${form.priority === 'critical' ? 'CRITICAL ' : ''}Incident`}
          </button>
        </form>
      </div>

      <style>{`
        .section-card-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; }
        .type-picker {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--sp-2);
        }
        @media (max-width: 500px) { .type-picker { grid-template-columns: repeat(2, 1fr); } }
        .type-option {
          background: var(--color-surface-2);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--sp-3);
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
          transition: all var(--transition-fast);
        }
        .type-option:hover { border-color: var(--type-color, var(--color-primary)); }
        .type-option.selected {
          border-color: var(--type-color, var(--color-primary));
          background: color-mix(in srgb, var(--type-color, var(--color-primary)) 12%, transparent);
          color: var(--type-color, var(--color-primary));
        }
        .priority-picker { display: flex; gap: var(--sp-3); }
        .priority-option {
          flex: 1;
          background: var(--color-surface-2);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--sp-3);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--sp-2);
          transition: all var(--transition-fast);
        }
        .priority-option:hover { border-color: var(--p-color); }
        .priority-option.selected {
          border-color: var(--p-color);
          background: color-mix(in srgb, var(--p-color) 12%, transparent);
          color: var(--p-color);
        }
        .priority-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        @media (max-width: 480px) { .priority-picker { flex-direction: column; } }
      `}</style>
    </div>
  );
}
