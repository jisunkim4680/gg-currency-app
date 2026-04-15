import { openDB, IDBPDatabase } from 'idb';
import { Store } from '../types/store';

const DB_NAME = 'gg-currency-stores';
const DB_VERSION = 1;
const STORE_NAME = 'stores';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheEntry {
  sigunName: string;
  stores: Store[];
  timestamp: number;
}

function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sigunName' });
      }
    },
  });
}

export async function getCachedStores(sigunName: string): Promise<Store[] | null> {
  const db = await getDB();
  const entry: CacheEntry | undefined = await db.get(STORE_NAME, sigunName);

  if (!entry) return null;

  return entry.stores;
}

export async function setCachedStores(sigunName: string, stores: Store[]): Promise<void> {
  const db = await getDB();
  const entry: CacheEntry = {
    sigunName,
    stores,
    timestamp: Date.now(),
  };
  await db.put(STORE_NAME, entry);
}

export async function isCacheValid(sigunName: string): Promise<boolean> {
  const db = await getDB();
  const entry: CacheEntry | undefined = await db.get(STORE_NAME, sigunName);

  if (!entry) return false;

  const age = Date.now() - entry.timestamp;
  return age < CACHE_TTL;
}
