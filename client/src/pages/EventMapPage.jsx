import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { getEventPack } from '../lib/db';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STATUS_CONFIG = {
  normal:   { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Normal' },
  warning:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Warning' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Critical' },
};

export default function EventMapPage() {
  const { id } = useParams();
  const isOnline = useOnlineStatus();
  const { user, isOrganizer } = useAuth();
  const toast = useToast();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updatingZone, setUpdatingZone] = useState(null);

  useEffect(() => {
    const load = async () => {
      const cached = await getEventPack(id);
      if (cached?.zones) setZones(cached.zones);
      if (isOnline) {
        try {
          const res = await api.get(`/zones?eventId=${id}`);
          setZones(res.data.data);
        } catch {}
      }
      setLoading(false);
    };
    load();
  }, [id, isOnline]);

  const handleStatusChange = async (zoneId, newStatus) => {
    setUpdatingZone(zoneId);
    try {
      const res = await api.patch(`/zones/${zoneId}`, { status: newStatus, reason: 'Manual update' });
      setZones(prev => prev.map(z => z._id === zoneId ? res.data.data : z));
      toast.success('Zone Updated', `Status changed to ${newStatus}`);
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingZone(null);
    }
  };

  if (loading) return <div className="empty-state"><div className="spinner spinner-lg" /></div>;

  // Default positions if not set
  const defaultPositions = [
    { x: 5, y: 5, width: 35, height: 40 },
    { x: 45, y: 5, width: 50, height: 40 },
    { x: 5, y: 50, width: 40, height: 45 },
    { x: 50, y: 50, width: 45, height: 45 },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🗺️ Venue Map</h1>
        <p className="page-subtitle">{isOnline ? 'Live zone status' : 'Offline — last cached status'}</p>
      </div>

      <div className="container" style={{ paddingBottom: 'var(--sp-8)' }}>
        {/* Legend */}
        <div className="map-legend">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="legend-item">
              <div className="legend-dot" style={{ background: cfg.color }} />
              <span>{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Zone Map */}
        {zones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗺️</div>
            <div className="empty-state-title">No zones configured</div>
          </div>
        ) : (
          <>
            <div className="zone-map" style={{ height: 500 }}>
              <div className="map-grid-bg" />
              {zones.map((zone, i) => {
                const pos = zone.position?.x !== undefined ? zone.position : defaultPositions[i % 4];
                const cfg = STATUS_CONFIG[zone.status] || STATUS_CONFIG.normal;
                return (
                  <div
                    key={zone._id}
                    className={`zone-block ${zone.status}`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      width: `${pos.width}%`,
                      height: `${pos.height}%`,
                      background: cfg.bg,
                      borderColor: cfg.color,
                      color: cfg.color,
                    }}
                    onClick={() => setSelected(zone)}
                  >
                    <div className="zone-block-icon">
                      {zone.status === 'critical' ? '🚨' : zone.status === 'warning' ? '⚠️' : '✅'}
                    </div>
                    <div className="zone-block-name">{zone.name}</div>
                    <div className="zone-block-status">{cfg.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Zone List */}
            <div className="zones-list">
              {zones.map(zone => (
                <div key={zone._id} className={`zone-list-item ${zone.status}`}>
                  <div className="zone-list-dot" style={{ background: STATUS_CONFIG[zone.status]?.color }} />
                  <div className="zone-list-info">
                    <div className="zone-list-name">{zone.name}</div>
                    <div className="zone-list-desc">{zone.description}</div>
                  </div>
                  <div className="zone-list-right">
                    <span className="badge" style={{
                      background: STATUS_CONFIG[zone.status]?.bg,
                      color: STATUS_CONFIG[zone.status]?.color,
                    }}>
                      {STATUS_CONFIG[zone.status]?.label}
                    </span>
                    {isOrganizer && isOnline && (
                      <div className="zone-status-buttons">
                        {['normal', 'warning', 'critical'].map(s => (
                          <button
                            key={s}
                            className={`btn btn-sm ${zone.status === s ? 'btn-secondary' : 'btn-ghost'}`}
                            onClick={() => handleStatusChange(zone._id, s)}
                            disabled={updatingZone === zone._id}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Zone Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="modal-title" style={{ margin: 0 }}>
                {selected.name}
                <span className="badge" style={{
                  marginLeft: 'var(--sp-3)',
                  background: STATUS_CONFIG[selected.status]?.bg,
                  color: STATUS_CONFIG[selected.status]?.color,
                }}>
                  {STATUS_CONFIG[selected.status]?.label}
                </span>
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-4)' }}>{selected.description}</p>
            <div className="zone-detail-stats">
              <div className="zone-stat"><span>Capacity</span><strong>{selected.capacity}</strong></div>
              <div className="zone-stat"><span>Volunteers</span><strong>{selected.assignedVolunteers?.length || 0}</strong></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .map-legend {
          display: flex;
          gap: var(--sp-5);
          margin-bottom: var(--sp-4);
        }
        .legend-item { display: flex; align-items: center; gap: var(--sp-2); font-size: 0.8rem; font-weight: 600; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .map-grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .zone-block-icon { font-size: 1.5rem; }
        .zone-block-name { font-weight: 700; font-size: 0.85rem; }
        .zone-block-status { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .zones-list { display: flex; flex-direction: column; gap: var(--sp-3); margin-top: var(--sp-5); }
        .zone-list-item {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--sp-4) var(--sp-5);
          display: flex;
          align-items: center;
          gap: var(--sp-4);
          transition: all var(--transition-fast);
        }
        .zone-list-item.critical { border-color: rgba(239,68,68,0.3); }
        .zone-list-item.warning  { border-color: rgba(245,158,11,0.3); }
        .zone-list-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
        .zone-list-info { flex: 1; }
        .zone-list-name { font-weight: 600; font-size: 0.95rem; }
        .zone-list-desc { font-size: 0.8rem; color: var(--color-text-muted); }
        .zone-list-right { display: flex; align-items: center; gap: var(--sp-3); flex-wrap: wrap; }
        .zone-status-buttons { display: flex; gap: var(--sp-1); }
        .zone-detail-stats { display: flex; gap: var(--sp-6); }
        .zone-stat { display: flex; flex-direction: column; gap: 2px; }
        .zone-stat span { font-size: 0.75rem; color: var(--color-text-muted); }
        .zone-stat strong { font-size: 1.25rem; font-weight: 700; }
      `}</style>
    </div>
  );
}
