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

const DEFAULT_CENTER = { lat: 37.4138, lng: 127.0286 };
const DEFAULT_LEVEL = 7;
const MAX_MARKERS = 200;

export default function MapPage({ stores, userLocation, onStoreSelect, loading }: MapPageProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const storesRef = useRef<Store[]>(stores);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStoresLenRef = useRef(0);

  // 경기도 대략적 범위
  const GG_BOUNDS = { minLat: 36.9, maxLat: 38.3, minLng: 126.3, maxLng: 127.9 };

  storesRef.current = stores;

  // 지도 영역 내 마커만 표시
  const updateVisibleMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = map.getBounds();
    if (!bounds) return;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const visible = storesRef.current.filter(
      (s) => s.lat >= sw.getLat() && s.lat <= ne.getLat() && s.lng >= sw.getLng() && s.lng <= ne.getLng()
    );

    const toShow = visible.slice(0, MAX_MARKERS);
    setVisibleCount(visible.length);

    // 경기도 밖인지 확인
    const center = map.getCenter();
    const centerLat = center.getLat();
    const centerLng = center.getLng();
    const outOfGG = centerLat < GG_BOUNDS.minLat || centerLat > GG_BOUNDS.maxLat ||
                    centerLng < GG_BOUNDS.minLng || centerLng > GG_BOUNDS.maxLng;
    setIsOutOfBounds(outOfGG);

    const newMarkers = toShow.map((store) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(store.lat, store.lng),
        map,
      });
      kakao.maps.event.addListener(marker, 'click', () => setSelectedStore(store));
      return marker;
    });

    markersRef.current = newMarkers;
  }, []);

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

      const map = new kakao.maps.Map(mapContainerRef.current!, { center, level: DEFAULT_LEVEL });
      mapRef.current = map;

      kakao.maps.event.addListener(map, 'idle', scheduleUpdate);
      setTimeout(updateVisibleMarkers, 500);
    };

    if (typeof kakao !== 'undefined' && kakao.maps) {
      kakao.maps.load(initMap);
    }
  }, []);

  // stores 변경 시 → 해당 지역으로 지도 이동 + 마커 갱신
  useEffect(() => {
    const map = mapRef.current;
    if (!map || stores.length === 0) {
      updateVisibleMarkers();
      return;
    }

    // 필터된 가맹점들의 중심 좌표 계산
    const validStores = stores.filter((s) => s.lat && s.lng);
    if (validStores.length === 0) return;

    // 가맹점 영역으로 지도 이동
    if (validStores.length <= 500) {
      // 소규모: bounds로 딱 맞게
      const bounds = new kakao.maps.LatLngBounds();
      validStores.forEach((s) => bounds.extend(new kakao.maps.LatLng(s.lat, s.lng)));
      map.setBounds(bounds);
    } else {
      // 대규모: 중심점 + 적절한 줌
      let sumLat = 0, sumLng = 0;
      for (const s of validStores) {
        sumLat += s.lat;
        sumLng += s.lng;
      }
      const centerLat = sumLat / validStores.length;
      const centerLng = sumLng / validStores.length;
      map.setCenter(new kakao.maps.LatLng(centerLat, centerLng));
      map.setLevel(validStores.length > 5000 ? 7 : 5);
    }

    setTimeout(updateVisibleMarkers, 400);
    prevStoresLenRef.current = stores.length;
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

      <div style={styles.infoBar}>
        {stores.length > 0 && visibleCount > 0 && (
          <span>
            📍 {visibleCount > MAX_MARKERS
              ? `${MAX_MARKERS}/${visibleCount.toLocaleString()}개 표시`
              : `${visibleCount.toLocaleString()}개`}
            {stores.length > visibleCount && ` (전체 ${stores.length.toLocaleString()}개)`}
          </span>
        )}
        {isOutOfBounds && !loading && (
          <span>📍 경기도 밖입니다 · 지역 필터를 선택해주세요</span>
        )}
        {!isOutOfBounds && stores.length > 0 && visibleCount === 0 && !loading && (
          <span>📍 조건에 맞는 가맹점이 없습니다 · 지도를 이동하거나 필터를 변경해보세요</span>
        )}
        {stores.length === 0 && !loading && (
          <span>🔍 조건에 맞는 가맹점이 없습니다</span>
        )}
        {loading && <span>⏳ 로딩 중...</span>}
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
    position: 'absolute', bottom: 150, right: 16, width: 48, height: 48,
    borderRadius: '50%', backgroundColor: '#fff', border: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)', fontSize: 22, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
  },
  miniCard: {
    position: 'absolute', bottom: 70, left: 16, right: 16,
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
