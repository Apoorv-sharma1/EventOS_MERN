import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { saveLocalUpdate } from '../lib/db';
import { useToast } from '../context/ToastContext';

export default function QRScannerPage() {
  const toast = useToast();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerInstance.current) {
        scannerInstance.current.clear().catch(() => {});
      }
    };
  }, []);

  const startScanner = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      scannerInstance.current = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scannerInstance.current.render(
        async (decodedText) => {
          await handleScannedData(decodedText);
          stopScanner();
        },
        (err) => {}
      );
    }, 100);
  };

  const stopScanner = () => {
    if (scannerInstance.current) {
      scannerInstance.current.clear().catch(() => {});
      scannerInstance.current = null;
    }
    setScanning(false);
  };

  const handleScannedData = async (text) => {
    try {
      const data = JSON.parse(text);
      setResult(data);

      if (data.type === 'event-update') {
        await saveLocalUpdate({
          operationId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (`op-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`),
          eventId: data.eventId,
          scheduleItemId: data.scheduleItemId,
          changes: data.changes,
          description: data.description,
          validFrom: data.validFrom,
          scannedAt: new Date().toISOString(),
        });
        toast.success('Event Update Applied!', data.description || 'Schedule updated locally.');
      } else if (data.type === 'ticket') {
        toast.success('Ticket Scanned!', `Entry pass for ${data.userName}`);
      } else {
        toast.info('QR Scanned', 'Data received.');
      }
    } catch {
      toast.error('Invalid QR', 'Could not parse QR code data.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    await handleScannedData(manualInput.trim());
  };

  const QR_ICONS = { ticket: '🎟️', 'event-update': '📢', default: '🔍' };
  const QR_COLORS = { ticket: '#10b981', 'event-update': '#f59e0b', default: '#6366f1' };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">📷 QR Scanner</h1>
        <p className="page-subtitle">Scan QR tickets or event update codes</p>
      </div>

      <div className="container" style={{ paddingBottom: 'var(--sp-8)', maxWidth: 540 }}>
        {/* Camera Scanner */}
        <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
          <h2 className="section-card-title" style={{ marginBottom: 'var(--sp-4)' }}>📷 Camera Scan</h2>
          {!scanning ? (
            <button id="start-scanner-btn" className="btn btn-primary btn-full btn-lg" onClick={startScanner}>
              Start Camera Scanner
            </button>
          ) : (
            <>
              <div id="qr-reader" style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }} />
              <button className="btn btn-danger btn-full mt-4" onClick={stopScanner}>Stop Scanner</button>
            </>
          )}
        </div>

        {/* Manual Input */}
        <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
          <h2 className="section-card-title" style={{ marginBottom: 'var(--sp-4)' }}>⌨️ Manual Input</h2>
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <textarea id="manual-qr-input" className="form-control" rows={4}
                placeholder='Paste QR JSON payload here...'
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
              />
            </div>
            <button id="manual-qr-submit" type="submit" className="btn btn-secondary btn-full">
              Process QR Data
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className="qr-result animate-slide-up">
            <div className="qr-result-icon" style={{ color: QR_COLORS[result.type] || QR_COLORS.default }}>
              {QR_ICONS[result.type] || QR_ICONS.default}
            </div>
            <div className="qr-result-type">
              <span className="badge" style={{
                background: `${QR_COLORS[result.type] || QR_COLORS.default}18`,
                color: QR_COLORS[result.type] || QR_COLORS.default,
              }}>
                {result.type?.toUpperCase() || 'QR DATA'}
              </span>
            </div>

            {result.type === 'ticket' && (
              <div className="qr-result-data">
                <div className="qr-data-row"><span>Name</span><strong>{result.userName}</strong></div>
                <div className="qr-data-row"><span>Event</span><strong>{result.eventName}</strong></div>
                <div className="qr-data-row"><span>Issued</span><strong>{new Date(result.issuedAt).toLocaleString()}</strong></div>
              </div>
            )}
            {result.type === 'event-update' && (
              <div className="qr-result-data">
                <div className="qr-data-row"><span>Event</span><strong>{result.eventName}</strong></div>
                <div className="qr-data-row"><span>Description</span><strong>{result.description}</strong></div>
                {result.changes && Object.entries(result.changes).map(([k, v]) => (
                  <div key={k} className="qr-data-row"><span>{k}</span><strong>{String(v)}</strong></div>
                ))}
                <div className="qr-data-row"><span>Version</span><strong>{result.updateVersion}</strong></div>
                <div className="qr-update-notice">✅ Applied locally to your schedule</div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .qr-result {
          background: var(--color-surface);
          border: 1px solid var(--color-border-glow);
          border-radius: var(--radius-xl);
          padding: var(--sp-6);
          text-align: center;
        }
        .qr-result-icon { font-size: 3rem; margin-bottom: var(--sp-3); }
        .qr-result-type { margin-bottom: var(--sp-4); }
        .qr-result-data { text-align: left; }
        .qr-data-row {
          display: flex;
          justify-content: space-between;
          padding: var(--sp-2) 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 0.875rem;
        }
        .qr-data-row span { color: var(--color-text-muted); }
        .qr-data-row strong { color: var(--color-text-primary); }
        .qr-update-notice {
          margin-top: var(--sp-4);
          padding: var(--sp-3) var(--sp-4);
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: var(--radius-md);
          color: var(--color-success);
          font-size: 0.875rem;
          font-weight: 600;
        }
        .section-card-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; }
      `}</style>
    </div>
  );
}
