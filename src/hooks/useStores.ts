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

    async function fetchStores() {
      setLoading(true);
      try {
        const result = await getStores(sigunName);
        if (!cancelled) {
          setStores(result.stores);
          setDataSource(result.source);
        }
      } catch (error) {
        console.error('Failed to fetch stores:', error);
        if (!cancelled) {
          setStores([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStores();

    return () => {
      cancelled = true;
    };
  }, [sigunName]);

  return { stores, dataSource, loading };
}
