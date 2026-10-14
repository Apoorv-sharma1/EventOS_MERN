import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { getEventPack, saveEventPack } from '../lib/db';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';

export default function EventDetailPage() {
  const { id } = useParams();
  const isOnline = useOnlineStatus();
  const { user } = useAuth();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasPack, setHasPack] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Check cached pack
      const cached = await getEventPack(id);
      if (cached) {
        setEvent(cached.event);
        setHasPack(true);
      }
      if (isOnline) {
        try {
          const res = await api.get(`/events/${id}`);
          setEvent(res.data.data);
          if (user) {
            setIsRegistered(res.data.data.registrations?.includes(user._id));
          }
        } catch {}
      }
      setLoading(false);
    };
    load();
  }, [id, isOnline, user]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.post(`/events/${id}/register`);
      setIsRegistered(true);
      toast.success('Registered!', 'You are now registered for this event.');
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleDownloadPack = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/events/${id}/pack`);
      await saveEventPack(res.data.data);
      setHasPack(true);
      toast.success('Event Pack Downloaded!', 'Available offline now.');
    } catch (err) {
      toast.error('Download Failed', err.response?.data?.message || 'Try again later');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="empty-state"><div className="spinner spinner-lg" /></div>
  );

  if (!event) return (
    <div className="empty-state">
      <div className="empty-state-icon">🎪</div>
      <div className="empty-state-title">Event not found</div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="event-detail-hero">
        <div className="event-detail-hero-bg" />
        <div className="container">
          <div className="event-detail-hero-content">
            <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{event.status?.toUpperCase()}</span>
              {event.tags?.map(t => <span key={t} className="badge badge-muted">{t}</span>)}
            </div>
            <h1 className="event-detail-title">{event.name}</h1>
            {event.tagline && <p className="event-detail-tagline">{event.tagline}</p>}
            <div className="event-detail-meta">
              <span>📍 {event.venue}</span>
              <span>📅 {event.startDate ? format(new Date(event.startDate), 'MMM dd, yyyy') : 'TBD'} – {event.endDate ? format(new Date(event.endDate), 'MMM dd, yyyy') : 'TBD'}</span>
              <span>👥 {event.registrations?.length || 0} / {event.maxAttendees} registered</span>
            </div>
            <div className="event-detail-actions">
              {isOnline && user && !isRegistered && (
                <button className="btn btn-primary" onClick={handleRegister} disabled={registering} id="register-event-btn">
                  {registering ? <><span className="spinner" /> Registering...</> : '🎟️ Register'}
                </button>
              )}
              {isRegistered && <span className="badge badge-success" style={{ padding: 'var(--sp-3) var(--sp-5)', fontSize: '0.875rem' }}>✅ Registered</span>}
              {isOnline && user && (
                <button className="btn btn-secondary" onClick={handleDownloadPack} disabled={downloading} id="download-pack-btn">
                  {downloading ? <><span className="spinner" /> Downloading...</> : hasPack ? '🔄 Update Pack' : '📦 Download Event Pack'}
                </button>
              )}
              {hasPack && <span className="badge badge-success">📶 Available Offline</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="container" style={{ marginTop: 'var(--sp-6)' }}>
        <div className="quick-links">
          <Link to={`/events/${id}/schedule`} className="quick-link-card">
            <span className="quick-link-icon">📅</span>
            <span className="quick-link-label">Schedule</span>
          </Link>
          <Link to={`/events/${id}/map`} className="quick-link-card">
            <span className="quick-link-icon">🗺️</span>
            <span className="quick-link-label">Venue Map</span>
          </Link>
          <Link to="/my-ticket" className="quick-link-card">
            <span className="quick-link-icon">🎟️</span>
            <span className="quick-link-label">My Ticket</span>
          </Link>
          <Link to="/scan" className="quick-link-card">
            <span className="quick-link-icon">📷</span>
            <span className="quick-link-label">Scan QR</span>
          </Link>
          <Link to="/report-incident" className="quick-link-card">
            <span className="quick-link-icon">🚨</span>
            <span className="quick-link-label">Report Issue</span>
          </Link>
        </div>

        <div className="event-detail-grid">
          {/* About */}
          <div className="card">
            <h2 className="section-card-title">About</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
              {event.description || 'No description provided.'}
            </p>
          </div>

          {/* Rules */}
          {event.rules?.length > 0 && (
            <div className="card">
              <h2 className="section-card-title">📋 Rules & Guidelines</h2>
              <ul className="rules-list">
                {event.rules.map((rule, i) => (
                  <li key={i}><span className="rule-num">{i + 1}</span>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contacts */}
          {event.contacts?.length > 0 && (
            <div className="card">
              <h2 className="section-card-title">📞 Emergency Contacts</h2>
              <div className="contacts-grid">
                {event.contacts.map((c, i) => (
                  <div key={i} className="contact-card">
                    <div className="contact-name">{c.name}</div>
                    <div className="contact-role">{c.role}</div>
                    {c.phone && <a href={`tel:${c.phone}`} className="contact-phone">{c.phone}</a>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .event-detail-hero {
          position: relative;
          padding: var(--sp-12) var(--sp-4) var(--sp-10);
          overflow: hidden;
          min-height: 360px;
          display: flex;
          align-items: flex-end;
        }
        .event-detail-hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #1a1436 0%, #0f0e17 60%);
        }
        .event-detail-hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.2) 0%, transparent 60%);
        }
        .event-detail-hero-content { position: relative; z-index: 1; max-width: 720px; }
        .event-detail-title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: var(--sp-3);
        }
        .event-detail-tagline { color: var(--color-secondary); font-size: 1.1rem; margin-bottom: var(--sp-4); }
        .event-detail-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--sp-4);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin-bottom: var(--sp-6);
        }
        .event-detail-actions { display: flex; gap: var(--sp-3); flex-wrap: wrap; align-items: center; }
        .quick-links {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--sp-3);
          margin-bottom: var(--sp-6);
        }
        @media (max-width: 640px) {
          .quick-links { grid-template-columns: repeat(3, 1fr); }
        }
        .quick-link-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--sp-4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--sp-2);
          transition: all var(--transition-fast);
        }
        .quick-link-card:hover {
          border-color: var(--color-border-glow);
          transform: translateY(-2px);
          background: var(--color-surface-2);
        }
        .quick-link-icon { font-size: 1.5rem; }
        .quick-link-label { font-size: 0.7rem; font-weight: 600; color: var(--color-text-secondary); text-align: center; }
        .event-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-5);
          padding-bottom: var(--sp-8);
        }
        @media (max-width: 768px) { .event-detail-grid { grid-template-columns: 1fr; } }
        .section-card-title {
          font-family: var(--font-display);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--sp-4);
          display: flex;
          align-items: center;
          gap: var(--sp-2);
        }
        .rules-list { list-style: none; display: flex; flex-direction: column; gap: var(--sp-3); }
        .rules-list li { display: flex; gap: var(--sp-3); align-items: flex-start; font-size: 0.875rem; color: var(--color-text-secondary); }
        .rule-num {
          min-width: 22px; height: 22px;
          background: var(--color-primary-glow);
          color: var(--color-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .contacts-grid { display: flex; flex-direction: column; gap: var(--sp-3); }
        .contact-card {
          background: var(--color-surface-2);
          border-radius: var(--radius-md);
          padding: var(--sp-3) var(--sp-4);
        }
        .contact-name { font-weight: 600; font-size: 0.9rem; }
        .contact-role { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }
        .contact-phone { font-size: 0.85rem; color: var(--color-primary); display: inline-block; margin-top: 4px; }
      `}</style>
    </div>
  );
}
