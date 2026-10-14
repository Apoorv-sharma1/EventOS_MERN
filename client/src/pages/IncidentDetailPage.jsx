import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';

const STATUS_ICONS = {
  reported: '🔴', assigned: '🟠', accepted: '🟡',
  'on-the-way': '🔵', arrived: '🟢', resolved: '✅', cancelled: '❌',
};

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { user, isOrganizer } = useAuth();
  const toast = useToast();
  const [incident, setIncident] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedVol, setSelectedVol] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [incRes, volRes] = await Promise.all([
          api.get(`/incidents/${id}`),
          api.get(`/volunteers?availability=available`),
        ]);
        setIncident(incRes.data.data);
        setVolunteers(volRes.data.data);
      } catch {
        toast.error('Error', 'Could not load incident details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAssign = async () => {
    if (!selectedVol) { toast.warning('Select a volunteer', ''); return; }
    setAssigning(true);
    try {
      const res = await api.patch(`/incidents/${id}/assign`, { volunteerId: selectedVol });
      setIncident(res.data.data);
      toast.success('Volunteer Assigned!', 'Incident has been assigned.');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const PRIORITY_COLORS = { low: '#6b7280', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444' };

  if (loading) return <div className="empty-state"><div className="spinner spinner-lg" /></div>;
  if (!incident) return <div className="empty-state"><div className="empty-state-icon">🚨</div><div className="empty-state-title">Incident not found</div></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--sp-3)' }}>← Back</Link>
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <h1 className="page-title" style={{ margin: 0 }}>{incident.title}</h1>
          <span className="badge" style={{
            background: `${PRIORITY_COLORS[incident.priority] || '#6b7280'}18`,
            color: PRIORITY_COLORS[incident.priority] || '#6b7280',
            fontSize: '0.875rem',
            padding: 'var(--sp-2) var(--sp-3)',
          }}>
            {incident.priority?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 'var(--sp-8)' }}>
        <div className="incident-detail-grid">
          {/* Left */}
          <div>
            {/* Info Card */}
            <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
              <h2 className="section-card-title">Incident Info</h2>
              <div className="info-rows">
                <div className="info-row"><span>Type</span><span className="badge badge-primary">{incident.type}</span></div>
                <div className="info-row"><span>Status</span>
                  <span className="badge badge-info">{STATUS_ICONS[incident.status]} {incident.status}</span>
                </div>
                <div className="info-row"><span>Reported by</span><strong>{incident.reportedBy?.name}</strong></div>
                <div className="info-row"><span>Location</span><strong>{incident.location || 'N/A'}</strong></div>
                <div className="info-row"><span>Zone</span><strong>{incident.zoneName || 'N/A'}</strong></div>
                <div className="info-row"><span>Reported at</span><strong>{format(new Date(incident.createdAt), 'MMM dd, HH:mm')}</strong></div>
                {incident.resolvedAt && (
                  <div className="info-row"><span>Resolved at</span><strong>{format(new Date(incident.resolvedAt), 'MMM dd, HH:mm')}</strong></div>
                )}
              </div>
              {incident.description && (
                <p className="incident-desc">{incident.description}</p>
              )}
            </div>

            {/* Assigned Volunteer */}
            {incident.assignedTo && (
              <div className="card" style={{ marginBottom: 'var(--sp-4)' }}>
                <h2 className="section-card-title">Assigned Volunteer</h2>
                <div className="volunteer-info">
                  <div className="volunteer-avatar">
                    {incident.assignedTo.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{incident.assignedTo.name}</div>
                    {incident.assignedTo.phone && (
                      <a href={`tel:${incident.assignedTo.phone}`} className="text-primary text-sm">
                        📞 {incident.assignedTo.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assign Volunteer (organizer only) */}
            {isOrganizer && !['resolved', 'cancelled'].includes(incident.status) && (
              <div className="card">
                <h2 className="section-card-title">Assign Volunteer</h2>
                <div className="form-group">
                  <select id="assign-volunteer-select" className="form-control form-control-select"
                    value={selectedVol} onChange={e => setSelectedVol(e.target.value)}>
                    <option value="">-- Select available volunteer --</option>
                    {volunteers.map(v => (
                      <option key={v._id} value={v.user?._id}>
                        {v.user?.name} {v.zoneName ? `(${v.zoneName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <button id="assign-volunteer-btn" className="btn btn-primary btn-full" onClick={handleAssign} disabled={assigning}>
                  {assigning ? <><span className="spinner" /> Assigning...</> : 'Assign Volunteer'}
                </button>
              </div>
            )}
          </div>

          {/* Right: Timeline */}
          <div>
            <div className="card">
              <h2 className="section-card-title">Response Timeline</h2>
              <div className="timeline">
                {[...incident.timeline].reverse().map((entry, i) => (
                  <div key={i} className={`timeline-item ${entry.status}`}>
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <div className="timeline-text">
                        {STATUS_ICONS[entry.status]} {entry.status?.toUpperCase()}
                      </div>
                      {entry.note && <div className="text-sm text-muted">{entry.note}</div>}
                      <div className="timeline-label">
                        {format(new Date(entry.timestamp), 'MMM dd, HH:mm:ss')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .incident-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-5);
        }
        @media (max-width: 768px) { .incident-detail-grid { grid-template-columns: 1fr; } }
        .section-card-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: var(--sp-4); }
        .info-rows { display: flex; flex-direction: column; gap: var(--sp-3); margin-bottom: var(--sp-4); }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          padding: var(--sp-2) 0;
          border-bottom: 1px solid var(--color-border);
        }
        .info-row span:first-child { color: var(--color-text-muted); }
        .incident-desc {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          padding: var(--sp-3);
          background: var(--color-surface-2);
          border-radius: var(--radius-md);
          line-height: 1.6;
        }
        .volunteer-info { display: flex; align-items: center; gap: var(--sp-4); }
        .volunteer-avatar {
          width: 48px; height: 48px;
          background: var(--color-primary-glow);
          border: 2px solid var(--color-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-primary);
          flex-shrink: 0;
        }
        .timeline-content { flex: 1; }
      `}</style>
    </div>
  );
}
