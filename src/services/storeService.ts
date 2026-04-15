import { Store, DataSource } from '../types/store';
import { fetchStores } from './api';
import { getCachedStores, setCachedStores, isCacheValid } from './cache';

interface StoreResult {
  stores: Store[];
  source: DataSource;
}

export async function getStores(
  sigunName: string,
  onProgress?: (stores: Store[], source: DataSource) => void
): Promise<StoreResult> {

  // 1. 캐시가 있으면 즉시 표시 (네트워크 대기 0초)
  try {
    const cached = await getCachedStores(sigunName);
    if (cached && cached.length > 0) {
      if (onProgress) onProgress(cached, 'cache');

      // 캐시가 유효하면 그대로 사용, API 갱신 안 함
      const valid = await isCacheValid(sigunName);
      if (valid) {
        return { stores: cached, source: 'cache' };
      }

      // 캐시가 만료됐으면 백그라운드에서 API 갱신
      refreshFromApi(sigunName, onProgress);
      return { stores: cached, source: 'cache' };
    }
  } catch {
    // 캐시 실패 → 다음 단계
  }

  // 2. 캐시 없으면 API에서 첫 100건만 빠르게 로드
  try {
    const first = await fetchStores(sigunName, 1, 100);
    if (onProgress) onProgress(first.stores, 'api');

    // 나머지는 백그라운드로
    refreshFromApi(sigunName, onProgress);
    return { stores: first.stores, source: 'api' };
  } catch {
    // API도 실패
  }

  // 3. 정적 JSON
  try {
    const response = await fetch(`/data/${sigunName}.json`);
    if (!response.ok) throw new Error('not found');
    const stores: Store[] = await response.json();
    return { stores, source: 'static' };
  } catch {
    return { stores: [], source: 'api' };
  }
}

// 백그라운드에서 전체 데이터 로드 + 캐시 갱신
async function refreshFromApi(
  sigunName: string,
  onProgress?: (stores: Store[], source: DataSource) => void
) {
  try {
    const pageSize = 1000;
    const first = await fetchStores(sigunName, 1, pageSize);
    const allStores = [...first.stores];
    const totalPages = Math.ceil(first.totalCount / pageSize);

    if (onProgress) onProgress(allStores, 'api');

    // 3페이지씩 병렬 로드
    for (let i = 2; i <= totalPages; i += 3) {
      const batch = [];
      for (let j = i; j < i + 3 && j <= totalPages; j++) {
        batch.push(fetchStores(sigunName, j, pageSize));
      }
      const results = await Promise.all(batch);
      for (const r of results) allStores.push(...r.stores);
      if (onProgress) onProgress([...allStores], 'api');
    }

    // 캐시 저장
    setCachedStores(sigunName, allStores).catch(() => {});
  } catch {
    // 백그라운드 갱신 실패는 무시
  }
}
