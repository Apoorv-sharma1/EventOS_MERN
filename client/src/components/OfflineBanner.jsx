import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useSyncQueue } from '../hooks/useSyncQueue';
import { useToast } from '../context/ToastContext';
import { useRef } from 'react';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const toast = useToast();
  const prevOnlineRef = useRef(isOnline);

  useSyncQueue((results) => {
    const applied = results.filter(r => r.status === 'applied').length;
    if (applied > 0) toast.success('Sync Complete', `${applied} offline action(s) synced.`);
  });

  if (!isOnline) {
    return (
      <div className="offline-banner">
        <span>📴</span>
        <span>Offline Mode — Viewing cached data. Actions will sync when reconnected.</span>
      </div>
    );
  }

  return null;
}
