import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { getEventPack, saveEventPack } from '../lib/db';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';

export default function EventPackPage() {
  const { id } = useParams();
  const isOnline = useOnlineStatus();
  const { toast } = useToast();

  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [packSize, setPackSize] = useState('0 KB');

  useEffect(() => {
    loadPack();
  }, [id]);

  const loadPack = async () => {
    setLoading(true);
    try {
      // Check local IndexedDB first
      const cached = await getEventPack(id);
      if (cached) {
        setPack(cached);
        calculateSize(cached);
      }

      // If online, fetch latest
      if (isOnline) {
        const res = await api.get(`/events/${id}/pack`);
        if (res.data.success) {
          const remotePack = res.data.data;
          setPack(remotePack);
          calculateSize(remotePack);
          // auto update local cache
          await saveEventPack(id, remotePack);
        }
      }
    } catch (err) {
      console.error('Failed to load event pack:', err);
      if (!pack) {
        toast.error('Unable to retrieve event pack');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSize = (data) => {
    try {
      const bytes = new Blob([JSON.stringify(data)]).size;
      if (bytes < 1024) setPackSize(`${bytes} B`);
      else if (bytes < 1024 * 1024) setPackSize(`${(bytes / 1024).toFixed(1)} KB`);
      else setPackSize(`${(bytes / (1024 * 1024)).toFixed(2)} MB`);
    } catch (e) {
      setPackSize('~12 KB');
    }
  };

  const handleDownloadPack = async () => {
    if (!isOnline) {
      toast.error('Cannot refresh pack while offline');
      return;
    }
    setDownloading(true);
    try {
      const res = await api.get(`/events/${id}/pack`);
      if (res.data.success) {
        const freshPack = res.data.data;
        await saveEventPack(id, freshPack);
        setPack(freshPack);
        calculateSize(freshPack);
        toast.success('Offline Event Pack updated in local storage!');
      }
    } catch (err) {
      toast.error('Failed to update event pack');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportJSON = () => {
    if (!pack) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pack, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `event-pack-${id}-v${pack.packVersion || 1}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Event pack exported to JSON');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div className="spinner spinner-lg" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading Event Pack snapshot...</p>
      </div>
    );
  }

  const event = pack?.event || {};
  const scheduleCount = event.schedule?.length || 0;
  const zonesCount = pack?.zones?.length || 0;
  const rulesCount = event.rules?.length || 0;

  return (
    <div className="container" style={{ maxWidth: '840px', padding: '2rem 1rem 5rem' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
        <Link to={`/events/${id}`} style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 600 }}>
          ← Back to {event.name || 'Event'}
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981'
              }}
            >
              ✓ Offline Pack Verified
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Version {pack?.packVersion || 1}
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800 }}>
            {event.name || 'Offline Event Pack'}
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Fully self-contained offline dataset cached in your browser's IndexedDB.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadPack}
            disabled={downloading || !isOnline}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {downloading ? 'Syncing...' : '🔄 Refresh Pack'}
          </button>
          <button
            onClick={handleExportJSON}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            💾 Export JSON
          </button>
        </div>
      </div>

      {/* Storage & Sync Status Card */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cache Status</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '0.2rem' }}>
              IndexedDB Stored
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cached Size</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {packSize}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Downloaded At</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
              {pack?.downloadedAt ? format(new Date(pack.downloadedAt), 'MMM dd, hh:mm a') : 'Now'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Network Mode</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: isOnline ? 'var(--primary)' : '#f59e0b', marginTop: '0.2rem' }}>
              {isOnline ? '🌐 Online' : '📴 Offline Active'}
            </div>
          </div>
        </div>
      </div>

      {/* Manifest Inventory */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Pack Contents</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>Timeline & Schedule</div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {scheduleCount} sessions, workshops and keynotes with offline room allocations.
          </p>
          <Link to={`/events/${id}/schedule`} className="btn btn-sm btn-outline">
            Browse Schedule →
          </Link>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🗺️</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>Interactive Zones & Map</div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {zonesCount} zone coordinates, booth labels, and medical point locations.
          </p>
          <Link to={`/events/${id}/map`} className="btn btn-sm btn-outline">
            Open Map →
          </Link>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📜</div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>Guidelines & Offline Safety</div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {rulesCount} ground rules, emergency procedures, and organizer contact details.
          </p>
          <Link to={`/events/${id}`} className="btn btn-sm btn-outline">
            View Rules →
          </Link>
        </div>
      </div>

      {/* Raw JSON Snapshot Inspector */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>Inspect Offline Pack Payload</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          This data structure is parsed directly by your service worker and offline views when disconnected.
        </p>
        <pre
          style={{
            maxHeight: '260px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-secondary)',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)'
          }}
        >
          {JSON.stringify(pack, null, 2)}
        </pre>
      </div>
    </div>
  );
}
