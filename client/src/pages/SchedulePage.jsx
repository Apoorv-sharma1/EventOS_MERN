import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { getEventPack, getLocalUpdates } from '../lib/db';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

const TYPE_ICONS = { session: '🎤', workshop: '🔧', break: '☕', ceremony: '🏆', other: '📌' };
const TYPE_COLORS = { session: '#6366f1', workshop: '#f59e0b', break: '#10b981', ceremony: '#ec4899', other: '#6b7280' };

export default function SchedulePage() {
  const { id } = useParams();
  const isOnline = useOnlineStatus();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [localUpdates, setLocalUpdates] = useState([]);

  useEffect(() => {
    const load = async () => {
      // Load local QR updates
      const updates = await getLocalUpdates(id);
      setLocalUpdates(updates);

      const cached = await getEventPack(id);
      let items = [];
      if (cached?.event?.schedule) {
        items = cached.event.schedule;
        // Apply local updates
        for (const upd of updates) {
          if (upd.scheduleItemId) {
            items = items.map(s =>
              s._id === upd.scheduleItemId ? { ...s, ...upd.changes } : s
            );
          }
        }
      }
      if (isOnline) {
        try {
          const res = await api.get(`/events/${id}`);
          items = res.data.data.schedule || [];
        } catch {}
      }
      setSchedule(items.sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
      setLoading(false);
    };
    load();
  }, [id, isOnline]);

  const types = ['all', ...new Set(schedule.map(s => s.type))];

  const filtered = filter === 'all' ? schedule : schedule.filter(s => s.type === filter);

  const grouped = filtered.reduce((acc, item) => {
    const date = format(new Date(item.startTime), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const getDateLabel = (dateStr) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return '📅 Today';
    if (isTomorrow(d)) return '📅 Tomorrow';
    return `📅 ${format(d, 'EEEE, MMM dd')}`;
  };

  if (loading) return <div className="empty-state"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📅 Schedule</h1>
        <p className="page-subtitle">
          {isOnline ? 'Live schedule' : 'Offline cached schedule'}
          {localUpdates.length > 0 && ` • ${localUpdates.length} local QR update(s) applied`}
        </p>
      </div>

      <div className="container" style={{ paddingBottom: 'var(--sp-8)' }}>
        {localUpdates.length > 0 && (
          <div className="update-notice">
            📷 {localUpdates.length} QR-based update(s) applied to this schedule locally.
          </div>
        )}

        <div className="tabs" style={{ marginBottom: 'var(--sp-6)' }}>
          {types.map(t => (
            <button key={t} className={`tab-btn ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}>
              {TYPE_ICONS[t] || '📌'} {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-title">No schedule items</div>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="schedule-day">
              <div className="schedule-day-header">{getDateLabel(date)}</div>
              <div className="schedule-items">
                {items.map(item => (
                  <div key={item._id} className="schedule-item">
                    <div className="schedule-time">
                      <div className="schedule-start">{format(new Date(item.startTime), 'HH:mm')}</div>
                      <div className="schedule-line" style={{ background: TYPE_COLORS[item.type] || '#6b7280' }} />
                      <div className="schedule-end">{format(new Date(item.endTime), 'HH:mm')}</div>
                    </div>
                    <div className="schedule-content card">
                      <div className="schedule-type-badge">
                        <span className="badge" style={{
                          background: `${TYPE_COLORS[item.type] || '#6b7280'}18`,
                          color: TYPE_COLORS[item.type] || '#6b7280',
                          border: `1px solid ${TYPE_COLORS[item.type] || '#6b7280'}40`
                        }}>
                          {TYPE_ICONS[item.type]} {item.type}
                        </span>
                        {item.version > 1 && <span className="badge badge-warning">Updated v{item.version}</span>}
                      </div>
                      <div className="schedule-title">{item.title}</div>
                      {item.speaker && <div className="schedule-speaker">🎙️ {item.speaker}</div>}
                      {item.venue && <div className="schedule-venue">📍 {item.venue}</div>}
                      {item.description && <p className="schedule-desc">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .update-notice {
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.3);
          border-radius: var(--radius-md);
          padding: var(--sp-3) var(--sp-4);
          font-size: 0.825rem;
          color: var(--color-warning);
          margin-bottom: var(--sp-5);
        }
        .schedule-day { margin-bottom: var(--sp-8); }
        .schedule-day-header {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin-bottom: var(--sp-4);
          padding-bottom: var(--sp-2);
          border-bottom: 1px solid var(--color-border);
        }
        .schedule-items { display: flex; flex-direction: column; gap: var(--sp-3); }
        .schedule-item { display: flex; gap: var(--sp-4); }
        .schedule-time {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 50px;
          padding-top: var(--sp-3);
        }
        .schedule-start, .schedule-end {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }
        .schedule-line {
          flex: 1;
          width: 2px;
          margin: 4px 0;
          min-height: 20px;
          border-radius: 1px;
        }
        .schedule-content { flex: 1; }
        .schedule-type-badge { display: flex; gap: var(--sp-2); margin-bottom: var(--sp-2); }
        .schedule-title { font-weight: 700; font-size: 0.95rem; margin-bottom: var(--sp-1); }
        .schedule-speaker, .schedule-venue {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          margin-bottom: 2px;
        }
        .schedule-desc { font-size: 0.8rem; color: var(--color-text-muted); margin-top: var(--sp-2); }
      `}</style>
    </div>
  );
}
