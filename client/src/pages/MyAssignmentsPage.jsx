import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { format } from 'date-fns';

const STATUS_FLOW = ['reported', 'assigned', 'accepted', 'on-the-way', 'arrived', 'resolved'];
const NEXT_ACTION = {
  assigned: { label: '✅ Accept', next: 'accepted' },
  accepted: { label: '🚗 On the Way', next: 'on-the-way' },
  'on-the-way': { label: '📍 Arrived', next: 'arrived' },
  arrived: { label: '✅ Mark Resolved', next: 'resolved' },
};

const PRIORITY_CONFIG = {
  low: { color: '#6b7280', label: 'Low' },
  medium: { color: '#3b82f6', label: 'Medium' },
  high: { color: '#f59e0b', label: 'High' },
  critical: { color: '#ef4444', label: '🚨 Critical' },
};

export default function MyAssignmentsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { socket } = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    try {
      const res = await api.get(`/incidents?assignedTo=${user._id}`);
      setIncidents(res.data.data);
    } catch {
      toast.error('Error', 'Could not load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    const handler = (incident) => {
      setIncidents(prev =>
        prev.some(i => i._id === incident._id)
          ? prev.map(i => i._id === incident._id ? incident : i)
          : [incident, ...prev]
      );
    };
    socket.on('incident:updated', handler);
    return () => socket.off('incident:updated', handler);
  }, [socket]);

  const handleStatusUpdate = async (incident) => {
    const action = NEXT_ACTION[incident.status];
    if (!action) return;
    try {
      const res = await api.patch(`/incidents/${incident._id}/status`, { status: action.next });
      setIncidents(prev => prev.map(i => i._id === incident._id ? res.data.data : i));
      toast.success('Status Updated', `Incident is now: ${action.next.toUpperCase()}`);
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Update failed');
    }
  };

  const StatusProgress = ({ status }) => {
    const currentIdx = STATUS_FLOW.indexOf(status);
    return (
      <div className="status-progress">
        {STATUS_FLOW.map((s, i) => (
          <div key={s} className={`status-step ${i <= currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}`}>
            <div className="status-step-dot" />
            {i < STATUS_FLOW.length - 1 && <div className="status-step-line" />}
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className="empty-state"><div className="spinner spinner-lg" /></div>;

  const activeIncidents  = incidents.filter(i => !['resolved', 'cancelled'].includes(i.status));
  const resolvedIncidents = incidents.filter(i => ['resolved', 'cancelled'].includes(i.status));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📋 My Assignments</h1>
        <p className="page-subtitle">{activeIncidents.length} active • {resolvedIncidents.length} completed</p>
      </div>

      <div className="container" style={{ paddingBottom: 'var(--sp-8)' }}>
        {incidents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No assignments yet</div>
            <div className="empty-state-desc">Organizers will assign incidents to you. Stay available.</div>
          </div>
        ) : (
          <>
            {activeIncidents.length > 0 && (
              <>
                <h2 className="section-header">Active Assignments</h2>
                <div className="assignments-list">
                  {activeIncidents.map(incident => (
                    <div key={incident._id} className={`assignment-card ${incident.priority}`}>
                      <div className="assignment-header">
                        <div>
                          <div className="assignment-title">{incident.title}</div>
                          <div className="assignment-meta">
                            {incident.location && <span>📍 {incident.location}</span>}
                            {incident.zoneName && <span>🗺️ {incident.zoneName}</span>}
                            <span>⏰ {format(new Date(incident.createdAt), 'HH:mm')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="badge" style={{
                            background: `${PRIORITY_CONFIG[incident.priority]?.color || '#6b7280'}18`,
                            color: PRIORITY_CONFIG[incident.priority]?.color || '#6b7280',
                          }}>
                            {PRIORITY_CONFIG[incident.priority]?.label}
                          </span>
                          <span className="badge badge-primary">{incident.type}</span>
                        </div>
                      </div>

                      <div className="assignment-status-label">
                        Status: <strong style={{ color: 'var(--color-primary)' }}>{incident.status.toUpperCase()}</strong>
                      </div>

                      <StatusProgress status={incident.status} />

                      <div className="assignment-actions">
                        {NEXT_ACTION[incident.status] && (
                          <button
                            id={`update-status-${incident._id}`}
                            className="btn btn-primary"
                            onClick={() => handleStatusUpdate(incident)}
                          >
                            {NEXT_ACTION[incident.status].label}
                          </button>
                        )}
                        <Link to={`/incidents/${incident._id}`} className="btn btn-ghost btn-sm">
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {resolvedIncidents.length > 0 && (
              <>
                <h2 className="section-header mt-8">Completed</h2>
                <div className="assignments-list">
                  {resolvedIncidents.map(incident => (
                    <div key={incident._id} className="assignment-card resolved">
                      <div className="assignment-header">
                        <div>
                          <div className="assignment-title">{incident.title}</div>
                          <div className="assignment-meta">
                            <span>✅ {incident.status.toUpperCase()}</span>
                            {incident.resolvedAt && <span>at {format(new Date(incident.resolvedAt), 'HH:mm')}</span>}
                          </div>
                        </div>
                        <span className="badge badge-success">Done</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        .section-header {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-secondary);
          margin-bottom: var(--sp-4);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .assignments-list { display: flex; flex-direction: column; gap: var(--sp-4); }
        .assignment-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--sp-5) var(--sp-6);
          transition: all var(--transition-fast);
        }
        .assignment-card.critical { border-left: 3px solid #ef4444; }
        .assignment-card.high     { border-left: 3px solid #f59e0b; }
        .assignment-card.resolved { opacity: 0.6; }
        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--sp-4);
          margin-bottom: var(--sp-4);
        }
        .assignment-title { font-weight: 700; font-size: 1rem; margin-bottom: var(--sp-2); }
        .assignment-meta { display: flex; gap: var(--sp-3); font-size: 0.8rem; color: var(--color-text-muted); flex-wrap: wrap; }
        .assignment-status-label { font-size: 0.825rem; color: var(--color-text-secondary); margin-bottom: var(--sp-3); }
        .status-progress {
          display: flex;
          align-items: center;
          margin-bottom: var(--sp-4);
          gap: 0;
        }
        .status-step {
          display: flex;
          align-items: center;
          flex: 1;
        }
        .status-step:last-child { flex: none; }
        .status-step-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          background: var(--color-surface-3);
          border: 2px solid var(--color-border);
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }
        .status-step.done .status-step-dot,
        .status-step.current .status-step-dot {
          background: var(--color-primary);
          border-color: var(--color-primary);
          box-shadow: 0 0 8px var(--color-primary-glow);
        }
        .status-step-line {
          flex: 1;
          height: 2px;
          background: var(--color-border);
          transition: background var(--transition-fast);
        }
        .status-step.done .status-step-line { background: var(--color-primary); }
        .assignment-actions { display: flex; gap: var(--sp-3); align-items: center; margin-top: var(--sp-2); }
      `}</style>
    </div>
  );
}
