import { useRef, useEffect, useState, useCallback } from 'react';
import { Store } from '../types/store';
import { getDistanceKm, formatDistance } from '../utils/geo';
import { getIndustryEmoji } from '../utils/industry';

interface MapPageProps {
  stores: Store[];
  userLocation: { lat: number; lng: number } | null;
  onStoreSelect: (store: Store) => void;
  loading: boolean;
}

const DEFAULT_CENTER = { lat: 37.4138, lng: 127.5183 };
const DEFAULT_LEVEL = 10;

export default function MapPage({ stores, userLocation, onStoreSelect, loading }: MapPageProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = () => {
      const center = new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      const map = new kakao.maps.Map(mapContainerRef.current!, {
        center,
        level: DEFAULT_LEVEL,
      });
      mapRef.current = map;

      clustererRef.current = new kakao.maps.MarkerClusterer({
        map,
        averageCenter: true,
        minLevel: 6,
      });
    };

    if (typeof kakao !== 'undefined' && kakao.maps) {
      kakao.maps.load(initMap);
    }
  }, []);

  // Update markers when stores change
  useEffect(() => {
    const map = mapRef.current;
    const clusterer = clustererRef.current;
    if (!map || !clusterer) return;

    // Clear old markers
    clusterer.clear();
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    setSelectedStore(null);

    // Create new markers
    const newMarkers = stores
      .filter((store) => store.lat && store.lng)
      .map((store) => {
        const position = new kakao.maps.LatLng(store.lat, store.lng);
        const marker = new kakao.maps.Marker({ position });

        kakao.maps.event.addListener(marker, 'click', () => {
          setSelectedStore(store);
        });

        return marker;
      });

    markersRef.current = newMarkers;
    clusterer.addMarkers(newMarkers);
  }, [stores]);

  // Center on user location
  const handleCenterOnUser = useCallback(() => {
    if (!mapRef.current || !userLocation) return;
    const center = new kakao.maps.LatLng(userLocation.lat, userLocation.lng);
    mapRef.current.setCenter(center);
    mapRef.current.setLevel(4);
  }, [userLocation]);

  // Calculate distance for the selected store
  const distanceText =
    selectedStore && userLocation
      ? formatDistance(
          getDistanceKm(userLocation.lat, userLocation.lng, selectedStore.lat, selectedStore.lng)
        )
      : null;

  return (
    <div style={styles.container}>
      {/* Map */}
      <div ref={mapContainerRef} style={styles.map} />

      {/* Loading spinner */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner} />
        </div>
      )}

      {/* My location button */}
      {userLocation && (
        <button
          style={styles.locationButton}
          onClick={handleCenterOnUser}
          aria-label="내 위치로 이동"
        >
          🎯
        </button>
      )}

      {/* Mini card */}
      {selectedStore && (
        <div
          style={styles.miniCard}
          onClick={() => onStoreSelect(selectedStore)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onStoreSelect(selectedStore);
          }}
        >
          <div style={styles.miniCardContent}>
            <span style={styles.emoji}>
              {getIndustryEmoji(selectedStore.industryName)}
            </span>
            <div style={styles.miniCardInfo}>
              <div style={styles.storeName}>{selectedStore.storeName}</div>
              <div style={styles.industryType}>{selectedStore.industryName}</div>
              <div style={styles.address}>
                {selectedStore.roadAddress || selectedStore.lotAddress}
              </div>
            </div>
            {distanceText && <div style={styles.distance}>{distanceText}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  map: {
    width: '100%',
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: 10,
    pointerEvents: 'none',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #e0e0e0',
    borderTopColor: '#4A90D9',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  locationButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: 'none',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    fontSize: 22,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  miniCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    padding: '16px',
    cursor: 'pointer',
    zIndex: 5,
  },
  miniCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 32,
    flexShrink: 0,
  },
  miniCardInfo: {
    flex: 1,
    minWidth: 0,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a1a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  industryType: {
    fontSize: 13,
    color: '#4A90D9',
    marginTop: 2,
  },
  address: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  distance: {
    fontSize: 14,
    fontWeight: 600,
    color: '#4A90D9',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
};
