import { useState, useEffect, useCallback } from 'react';
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

    async function load() {
      setLoading(true);
      setStores([]);
      try {
        const result = await getStores(sigunName, (partialStores, done) => {
          if (!cancelled) {
            setStores(partialStores);
            if (done) setLoading(false);
          }
        });
        if (!cancelled) {
          setStores(result.stores);
          setDataSource(result.source);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch stores:', error);
        if (!cancelled) {
          setStores([]);
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [sigunName]);

  return { stores, dataSource, loading };
}
