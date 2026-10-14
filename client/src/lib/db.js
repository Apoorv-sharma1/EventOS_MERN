import { openDB } from 'idb';

const DB_NAME = 'EventosDB';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Event packs
    if (!db.objectStoreNames.contains('eventPacks')) {
      db.createObjectStore('eventPacks', { keyPath: 'event._id' });
    }
    // Offline action queue
    if (!db.objectStoreNames.contains('syncQueue')) {
      const store = db.createObjectStore('syncQueue', { keyPath: 'operationId' });
      store.createIndex('status', 'status');
    }
    // Local event updates from QR
    if (!db.objectStoreNames.contains('localUpdates')) {
      const store = db.createObjectStore('localUpdates', { keyPath: 'operationId' });
      store.createIndex('eventId', 'eventId');
    }
  },
});

// Event Packs
export const saveEventPack = async (pack) => {
  const db = await dbPromise;
  await db.put('eventPacks', pack);
};

export const getEventPack = async (eventId) => {
  const db = await dbPromise;
  return db.get('eventPacks', eventId);
};

export const getAllEventPacks = async () => {
  const db = await dbPromise;
  return db.getAll('eventPacks');
};

// Sync Queue
export const addToSyncQueue = async (operation) => {
  const db = await dbPromise;
  await db.put('syncQueue', { ...operation, status: 'pending' });
};

export const getPendingSyncOps = async () => {
  const db = await dbPromise;
  const all = await db.getAll('syncQueue');
  return all.filter((op) => op.status === 'pending');
};

export const markSyncOpApplied = async (operationId) => {
  const db = await dbPromise;
  const op = await db.get('syncQueue', operationId);
  if (op) {
    op.status = 'applied';
    await db.put('syncQueue', op);
  }
};

export const clearAppliedSyncOps = async () => {
  const db = await dbPromise;
  const all = await db.getAll('syncQueue');
  const applied = all.filter((op) => op.status === 'applied');
  for (const op of applied) {
    await db.delete('syncQueue', op.operationId);
  }
};

// Local QR Updates
export const saveLocalUpdate = async (update) => {
  const db = await dbPromise;
  await db.put('localUpdates', update);
};

export const getLocalUpdates = async (eventId) => {
  const db = await dbPromise;
  const index = db.transaction('localUpdates').store.index('eventId');
  return index.getAll(eventId);
};
