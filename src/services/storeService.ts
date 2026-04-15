import { Store, DataSource } from '../types/store';
import { fetchStores } from './api';
import { getCachedStores, setCachedStores } from './cache';

interface StoreResult {
  stores: Store[];
  source: DataSource;
}

export async function getStores(
  sigunName: string,
  onProgress?: (stores: Store[], done: boolean) => void
): Promise<StoreResult> {
  // 1. Try API first (점진적 로딩)
  try {
    const pageSize = 1000;
    const firstPage = await fetchStores(sigunName, 1, pageSize);
    const allStores: Store[] = [...firstPage.stores];

    // 첫 페이지를 즉시 표시
    if (onProgress) onProgress(allStores, false);

    const totalPages = Math.ceil(firstPage.totalCount / pageSize);

    // 나머지 페이지를 3개씩 병렬로 로드
    for (let i = 2; i <= totalPages; i += 3) {
      const batch = [];
      for (let j = i; j < i + 3 && j <= totalPages; j++) {
        batch.push(fetchStores(sigunName, j, pageSize));
      }
      const results = await Promise.all(batch);
      for (const result of results) {
        allStores.push(...result.stores);
      }
      if (onProgress) onProgress([...allStores], i + 3 > totalPages);
    }

    // 캐시 저장 (백그라운드)
    setCachedStores(sigunName, allStores).catch(() => {});
    return { stores: allStores, source: 'api' };
  } catch (apiError) {
    console.warn('API fetch failed, trying cache:', apiError);
  }

  // 2. IndexedDB 캐시
  try {
    const stores = await getCachedStores(sigunName);
    if (stores && stores.length > 0) {
      return { stores, source: 'cache' };
    }
  } catch (cacheError) {
    console.warn('Cache read failed, trying static data:', cacheError);
  }

  // 3. 정적 JSON
  try {
    const response = await fetch(`/data/${sigunName}.json`);
    if (!response.ok) throw new Error(`Static file not found: ${response.status}`);
    const stores: Store[] = await response.json();
    return { stores, source: 'static' };
  } catch (staticError) {
    console.error('All data sources failed:', staticError);
    throw new Error(`Failed to load store data for "${sigunName}"`);
  }
}
