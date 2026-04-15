import { Store, DataSource } from '../types/store';
import { fetchAllStores } from './api';
import { getCachedStores, setCachedStores, isCacheValid } from './cache';

interface StoreResult {
  stores: Store[];
  source: DataSource;
}

export async function getStores(sigunName: string): Promise<StoreResult> {
  // 1. Try API first
  try {
    const stores = await fetchAllStores(sigunName);
    // Cache the fresh data for future use
    await setCachedStores(sigunName, stores).catch(() => {
      // Silently ignore cache write failures
    });
    return { stores, source: 'api' };
  } catch (apiError) {
    console.warn('API fetch failed, trying cache:', apiError);
  }

  // 2. If API fails, try IndexedDB cache
  try {
    const valid = await isCacheValid(sigunName);
    if (valid) {
      const stores = await getCachedStores(sigunName);
      if (stores && stores.length > 0) {
        return { stores, source: 'cache' };
      }
    }
    // Even if cache is expired, use it as fallback before static
    const stores = await getCachedStores(sigunName);
    if (stores && stores.length > 0) {
      return { stores, source: 'cache' };
    }
  } catch (cacheError) {
    console.warn('Cache read failed, trying static data:', cacheError);
  }

  // 3. If cache fails, fetch static JSON
  try {
    const response = await fetch(`/data/${sigunName}.json`);
    if (!response.ok) {
      throw new Error(`Static file not found: ${response.status}`);
    }
    const stores: Store[] = await response.json();
    return { stores, source: 'static' };
  } catch (staticError) {
    console.error('All data sources failed:', staticError);
    throw new Error(
      `Failed to load store data for "${sigunName}" from all sources (API, cache, static).`
    );
  }
}
