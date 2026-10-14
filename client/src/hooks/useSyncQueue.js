import { useEffect, useRef, useCallback } from 'react';
import { getPendingSyncOps, markSyncOpApplied, clearAppliedSyncOps } from '../lib/db';
import api from '../lib/api';
import { useOnlineStatus } from './useOnlineStatus';

export function useSyncQueue(onSynced) {
  const isOnline = useOnlineStatus();
  const syncingRef = useRef(false);

  const sync = useCallback(async () => {
    if (syncingRef.current) return;
    const pending = await getPendingSyncOps();
    if (!pending.length) return;
    syncingRef.current = true;
    try {
      const res = await api.post('/sync', { operations: pending });
      const results = res.data.results || [];
      for (const r of results) {
        if (r.status === 'applied') await markSyncOpApplied(r.operationId);
      }
      await clearAppliedSyncOps();
      onSynced?.(results);
    } catch (err) {
      console.warn('Sync failed:', err.message);
    } finally {
      syncingRef.current = false;
    }
  }, [onSynced]);

  useEffect(() => {
    if (isOnline) sync();
  }, [isOnline, sync]);

  return { sync };
}
