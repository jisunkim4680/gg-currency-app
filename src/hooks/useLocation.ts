import { useState, useEffect } from 'react';
import { getCurrentPosition } from '../utils/geo';

interface Location {
  lat: number;
  lng: number;
}

interface UseLocationResult {
  userLocation: Location | null;
  error: string | null;
}

export function useLocation(): UseLocationResult {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrentPosition()
      .then((position) => {
        if (!cancelled) {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || '위치 정보를 가져올 수 없습니다.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { userLocation, error };
}
