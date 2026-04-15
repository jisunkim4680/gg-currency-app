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

const DEFAULT_CENTER = { lat: 37.2636, lng: 127.0286 }; // 수원시 중심
const DEFAULT_LEVEL = 5;
const MAX_MARKERS = 200;

export default function MapPage({ stores, userLocation, onStoreSelect, loading }: MapPageProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const storesRef = useRef<Store[]>(stores);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  storesRef.current = stores;

  // 지도 영역 내 마커만 표시
  const updateVisibleMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = map.getBounds();
    if (!bounds) return;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const swLat = sw.getLat();
    const swLng = sw.getLng();
    const neLat = ne.getLat();
    const neLng = ne.getLng();

    // 현재 보이는 영역의 가맹점 필터
    const visible = storesRef.current.filter(
      (s) => s.lat >= swLat && s.lat <= neLat && s.lng >= swLng && s.lng <= neLng
    );

    // 최대 200개만 마커 생성
    const toShow = visible.slice(0, MAX_MARKERS);
    setVisibleCount(visible.length);

    const newMarkers = toShow.map((store) => {
      const position = new kakao.maps.LatLng(store.lat, store.lng);
      const marker = new kakao.maps.Marker({ position, map });
      kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedStore(store);
      });
      return marker;
    });

    markersRef.current = newMarkers;
  }, []);

  // 지도 이동/줌 시 디바운스로 마커 업데이트
  const scheduleUpdate = useCallback(() => {
    if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    updateTimerRef.current = setTimeout(updateVisibleMarkers, 300);
  }, [updateVisibleMarkers]);

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = () => {
      const center = userLocation
        ? new kakao.maps.LatLng(userLocation.lat, userLocation.lng)
        : new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);

      const map = new kakao.maps.Map(mapContainerRef.current!, {
        center,
        level: DEFAULT_LEVEL,
      });
      mapRef.current = map;

      // 지도 이동/줌 이벤트
      kakao.maps.event.addListener(map, 'idle', scheduleUpdate);

      // 초기 마커 표시
      setTimeout(updateVisibleMarkers, 500);
    };

    if (typeof kakao !== 'undefined' && kakao.maps) {
      kakao.maps.load(initMap);
    }
  }, []);

  // stores 변경 시 마커 갱신
  useEffect(() => {
    updateVisibleMarkers();
  }, [stores, updateVisibleMarkers]);

  const handleCenterOnUser = useCallback(() => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.setCenter(new kakao.maps.LatLng(userLocation.lat, userLocation.lng));
    mapRef.current.setLevel(3);
  }, [userLocation]);

  const distanceText =
    selectedStore && userLocation
      ? formatDistance(getDistanceKm(userLocation.lat, userLocation.lng, selectedStore.lat, selectedStore.lng))
      : null;

  return (
    <div style={styles.container}>
      <div ref={mapContainerRef} style={styles.map} />

      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner} />
        </div>
      )}

      {/* 표시 정보 */}
      <div style={styles.infoBar}>
        {stores.length > 0 && (
          <span>
            📍 {visibleCount > MAX_MARKERS ? `${MAX_MARKERS}/${visibleCount.toLocaleString()}개 표시` : `${visibleCount.toLocaleString()}개`}
            {stores.length > visibleCount && ` (전체 ${stores.length.toLocaleString()}개)`}
          </span>
        )}
        {loading && <span> · 로딩 중...</span>}
      </div>

      {userLocation && (
        <button style={styles.locationButton} onClick={handleCenterOnUser} aria-label="내 위치로 이동">
          🎯
        </button>
      )}

      {selectedStore && (
        <div
          style={styles.miniCard}
          onClick={() => onStoreSelect(selectedStore)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') onStoreSelect(selectedStore); }}
        >
          <div style={styles.miniCardContent}>
            <span style={styles.emoji}>{getIndustryEmoji(selectedStore.industryName)}</span>
            <div style={styles.miniCardInfo}>
              <div style={styles.storeName}>{selectedStore.storeName}</div>
              <div style={styles.industryType}>{selectedStore.industryName.split('/')[0]}</div>
              <div style={styles.address}>{selectedStore.roadAddress || selectedStore.lotAddress}</div>
            </div>
            {distanceText && <div style={styles.distance}>{distanceText}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { position: 'relative', width: '100%', height: '100%', flex: 1, display: 'flex', flexDirection: 'column' },
  map: { width: '100%', flex: 1 },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)', zIndex: 10, pointerEvents: 'none',
  },
  spinner: { width: 40, height: 40, border: '4px solid #e0e0e0', borderTopColor: '#1a73e8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  infoBar: {
    position: 'absolute', top: 8, left: 8, right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8,
    padding: '6px 12px', fontSize: 12, color: '#666',
    zIndex: 5, boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  locationButton: {
    position: 'absolute', bottom: 100, right: 16, width: 48, height: 48,
    borderRadius: '50%', backgroundColor: '#fff', border: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)', fontSize: 22, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
  },
  miniCard: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    backgroundColor: '#fff', borderRadius: 16,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: 16, cursor: 'pointer', zIndex: 5,
  },
  miniCardContent: { display: 'flex', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 32, flexShrink: 0 },
  miniCardInfo: { flex: 1, minWidth: 0 },
  storeName: { fontSize: 16, fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  industryType: { fontSize: 13, color: '#1a73e8', marginTop: 2 },
  address: { fontSize: 13, color: '#888', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  distance: { fontSize: 14, fontWeight: 600, color: '#1a73e8', flexShrink: 0, whiteSpace: 'nowrap' },
};
