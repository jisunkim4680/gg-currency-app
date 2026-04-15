import { useState, useEffect } from 'react';
import { Store, DataSource } from '../types/store';
import { getStores } from '../services/storeService';

interface UseStoresResult {
  stores: Store[];
  dataSource: DataSource;
  loading: boolean;
}

export function useStores(sigunName: string): UseStoresResult {
  const [stores, setStores] = useState<Store[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>('api');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setStores([]);

    getStores(sigunName, (partialStores, source) => {
      if (!cancelled) {
        setStores(partialStores);
        setDataSource(source);
        setLoading(false); // 첫 데이터 오면 바로 로딩 해제
      }
    }).then((result) => {
      if (!cancelled) {
        setStores(result.stores);
        setDataSource(result.source);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setStores([]);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [sigunName]);

  return { stores, dataSource, loading };
}
