import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { format } from 'date-fns';
import QRCode from 'qrcode';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const socket = useSocket();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [incidents, setIncidents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Quick Assignment Modal
  const [assigningIncident, setAssigningIncident] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Broadcast Update QR Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'announcement', // announcement, schedule_change, emergency
    targetZone: ''
  });
  const [generatedQR, setGeneratedQR] = useState(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  // Load events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.data.success && res.data.data.length > 0) {
        setEvents(res.data.data);
        setSelectedEventId(res.data.data[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load events');
    }
  };

  // Fetch incidents & volunteers when event changes
  useEffect(() => {
    if (!selectedEventId) return;
    fetchDashboardData(selectedEventId);
  }, [selectedEventId]);

  const fetchDashboardData = async (eventId) => {
    setLoading(true);
    try {
      const [incRes, volRes] = await Promise.all([
        api.get(`/incidents?eventId=${eventId}`),
        api.get(`/volunteers?eventId=${eventId}`)
      ]);
      if (incRes.data.success) setIncidents(incRes.data.data);
      if (volRes.data.success) setVolunteers(volRes.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Socket.IO Real-time listeners
  useEffect(() => {
    if (!socket || !selectedEventId) return;

    socket.emit('join:event', selectedEventId);

    const handleIncidentCreated = (newIncident) => {
      const incEventId = newIncident.event?._id || newIncident.event;
      if (incEventId === selectedEventId) {
        setIncidents(prev => [newIncident, ...prev.filter(i => i._id !== newIncident._id)]);
        toast.info(`New incident reported: ${newIncident.title}`);
      }
    };

    const handleIncidentUpdated = (updatedIncident) => {
      setIncidents(prev => prev.map(inc => (inc._id === updatedIncident._id ? updatedIncident : inc)));
    };

    socket.on('incident:new', handleIncidentCreated);
    socket.on('incident:created', handleIncidentCreated);
    socket.on('incident:updated', handleIncidentUpdated);

    return () => {
      socket.off('incident:new', handleIncidentCreated);
      socket.off('incident:created', handleIncidentCreated);
      socket.off('incident:updated', handleIncidentUpdated);
    };
  }, [socket, selectedEventId]);

  // Handle Quick Volunteer Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVolunteer || !assigningIncident) return;
    setAssignLoading(true);
    try {
      const res = await api.patch(`/incidents/${assigningIncident._id}/assign`, {
        volunteerId: selectedVolunteer
      });
      if (res.data.success) {
        toast.success('Volunteer assigned successfully');
        setIncidents(prev => prev.map(inc => inc._id === assigningIncident._id ? res.data.data : inc));
        setAssigningIncident(null);
        setSelectedVolunteer('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign volunteer');
    } finally {
      setAssignLoading(false);
    }
  };

  // Handle Broadcast QR Generation
  const handleGenerateBroadcastQR = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error('Please enter a title and message');
      return;
    }
    setGeneratingQR(true);
    try {
      const payload = {
        eventId: selectedEventId,
        type: broadcastForm.type,
        data: {
          title: broadcastForm.title,
          message: broadcastForm.message,
          targetZone: broadcastForm.targetZone || 'all',
          timestamp: new Date().toISOString()
        }
      };

      const res = await api.post('/qr/update', payload);
      if (res.data.success && res.data.data?.qrPayload) {
        const qrString = typeof res.data.data.qrPayload === 'string'
          ? res.data.data.qrPayload
          : JSON.stringify(res.data.data.qrPayload);
        const dataUrl = await QRCode.toDataURL(qrString, { width: 300, margin: 2 });
        setGeneratedQR(dataUrl);
        toast.success('Offline Broadcast QR generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate broadcast QR');
    } finally {
      setGeneratingQR(false);
    }
  };

  // Metrics computation
  const totalIncidents = incidents.length;
  const pendingIncidents = incidents.filter(i => i.status === 'reported').length;
  const inProgressIncidents = incidents.filter(i => i.status === 'in_progress' || i.status === 'assigned').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const activeVolunteersCount = volunteers.filter(v => v.availability === 'available').length;

  const filteredIncidents = incidents.filter(inc => {
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && inc.priority !== priorityFilter) return false;
    return true;
  });

  const selectedEvent = events.find(e => e._id === selectedEventId);

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Ops Command Center</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Live triage, volunteer dispatch & offline broadcast distribution
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setShowBroadcastModal(true); setGeneratedQR(null); }}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>📡</span> Broadcast Offline QR
          </button>
          <Link to="/events/create" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>➕</span> New Event
          </Link>
        </div>
      </div>

      {/* Event Selector & Quick Action Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 280px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              ACTIVE EVENT:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="form-control"
              style={{ fontWeight: 600, cursor: 'pointer' }}
            >
              {events.map(ev => (
                <option key={ev._id} value={ev._id}>{ev.title}</option>
              ))}
            </select>
          </div>

          {selectedEvent && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to={`/events/${selectedEventId}`} className="btn btn-sm btn-ghost">
                ℹ️ Event Details
              </Link>
              <Link to={`/events/${selectedEventId}/map`} className="btn btn-sm btn-ghost">
                🗺️ Zone Map
              </Link>
              <Link to={`/events/${selectedEventId}/schedule`} className="btn btn-sm btn-ghost">
                📅 Schedule
              </Link>
              <Link to={`/events/${selectedEventId}/pack`} className="btn btn-sm btn-ghost">
                📦 Offline Pack
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Total Reports</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{totalIncidents}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444' }}>Urgent / Pending</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#ef4444' }}>{pendingIncidents}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f59e0b' }}>In Progress</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#f59e0b' }}>{inProgressIncidents}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981' }}>Resolved</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#10b981' }}>{resolvedIncidents}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6366f1' }}>Ready Volunteers</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#6366f1' }}>{activeVolunteersCount}</div>
        </div>
      </div>

      {/* Main Content Layout: Incidents Triage & Volunteers Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Incident Triage Queue */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Incident Triage Stream</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              >
                <option value="all">Status: All</option>
                <option value="reported">Reported</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              >
                <option value="all">Priority: All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div className="spinner" />
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>All Clear!</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No incidents matching current criteria for this event.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredIncidents.map(inc => {
                const priorityColors = {
                  critical: '#ef4444',
                  high: '#f97316',
                  medium: '#f59e0b',
                  low: '#3b82f6'
                };
                const statusColors = {
                  reported: '#ef4444',
                  assigned: '#3b82f6',
                  in_progress: '#f59e0b',
                  resolved: '#10b981',
                  closed: '#6b7280'
                };

                return (
                  <div
                    key={inc._id}
                    className="card"
                    style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      borderLeft: `4px solid ${priorityColors[inc.priority] || 'var(--border)'}`,
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: `${priorityColors[inc.priority]}20`,
                              color: priorityColors[inc.priority]
                            }}
                          >
                            {inc.priority}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: `${statusColors[inc.status]}20`,
                              color: statusColors[inc.status]
                            }}
                          >
                            {inc.status.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {inc.type}
                          </span>
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                          <Link to={`/incidents/${inc._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {inc.title}
                          </Link>
                        </h3>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {format(new Date(inc.createdAt), 'hh:mm a')}
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {inc.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        📍 {inc.location?.description || 'General Area'}
                        {inc.assignedVolunteer ? (
                          <span style={{ marginLeft: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                            👤 Assigned to {inc.assignedVolunteer.user?.name || 'Volunteer'}
                          </span>
                        ) : (
                          <span style={{ marginLeft: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                            ⚠️ Unassigned
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => { setAssigningIncident(inc); setSelectedVolunteer(inc.assignedVolunteer?._id || ''); }}
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {inc.assignedVolunteer ? 'Reassign' : '⚡ Assign'}
                        </button>
                        <Link to={`/incidents/${inc._id}`} className="btn btn-sm btn-ghost" style={{ fontSize: '0.75rem' }}>
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Volunteer Duty Roster */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem' }}>Volunteers ({volunteers.length})</h2>
          <div className="card" style={{ padding: '1rem' }}>
            {volunteers.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
                No registered volunteers for this event yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {volunteers.map(vol => (
                  <div
                    key={vol._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid var(--border)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{vol.user?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {vol.user?.phone || vol.user?.email}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '12px',
                        backgroundColor: vol.availability === 'available' ? '#10b98120' : '#f59e0b20',
                        color: vol.availability === 'available' ? '#10b981' : '#f59e0b'
                      }}
                    >
                      {vol.availability}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {assigningIncident && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000
          }}
        >
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700 }}>Dispatch Volunteer</h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Assigning incident: <strong>{assigningIncident.title}</strong>
            </p>

            <form onSubmit={handleAssignSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Select Available Volunteer:
                </label>
                <select
                  value={selectedVolunteer}
                  onChange={e => setSelectedVolunteer(e.target.value)}
                  className="form-control"
                  required
                >
                  <option value="">-- Choose volunteer --</option>
                  {volunteers.map(vol => (
                    <option key={vol._id} value={vol.user?._id || vol.user}>
                      {vol.user?.name} ({vol.availability})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setAssigningIncident(null)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || !selectedVolunteer}
                  className="btn btn-primary"
                >
                  {assignLoading ? 'Assigning...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offline Broadcast QR Modal */}
      {showBroadcastModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000
          }}
        >
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Broadcast Offline QR Update</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Generate an encrypted/signed update QR code that attendees and volunteers can scan directly from their phone camera when internet access is completely offline.
            </p>

            {!generatedQR ? (
              <form onSubmit={handleGenerateBroadcastQR}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Broadcast Type
                  </label>
                  <select
                    value={broadcastForm.type}
                    onChange={e => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                    className="form-control"
                  >
                    <option value="announcement">General Announcement</option>
                    <option value="schedule_change">Schedule / Venue Shift</option>
                    <option value="emergency">Emergency / Alert</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Headline / Title
                  </label>
                  <input
                    type="text"
                    value={broadcastForm.title}
                    onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    placeholder="e.g. Keynote Moved to Auditorium B"
                    className="form-control"
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Detailed Message
                  </label>
                  <textarea
                    rows="3"
                    value={broadcastForm.message}
                    onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    placeholder="Provide full instructions for offline participants..."
                    className="form-control"
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowBroadcastModal(false)} className="btn btn-ghost">
                    Close
                  </button>
                  <button type="submit" disabled={generatingQR} className="btn btn-primary">
                    {generatingQR ? 'Generating QR...' : 'Create Update QR'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <img
                  src={generatedQR}
                  alt="Broadcast QR Code"
                  style={{
                    borderRadius: '8px',
                    border: '4px solid var(--border)',
                    maxWidth: '260px',
                    margin: '0 auto 1rem'
                  }}
                />
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{broadcastForm.title}</h4>
                <p style={{ margin: '0 0 1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Display this QR on venue screens or print it. Attendees scan with the EventOS app to sync offline!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  <a href={generatedQR} download={`broadcast-${Date.now()}.png`} className="btn btn-outline btn-sm">
                    💾 Save Image
                  </a>
                  <button onClick={() => setGeneratedQR(null)} className="btn btn-primary btn-sm">
                    Create Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
