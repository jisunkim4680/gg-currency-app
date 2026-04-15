import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import StoreCard from '../components/StoreCard';
import { Store, SortType } from '../types/store';
import { getDistanceKm, formatDistance } from '../utils/geo';
import { useFavorites } from '../hooks/useFavorites';

interface ListPageProps {
  stores: Store[];
  userLocation: { lat: number; lng: number } | null;
  onStoreSelect: (store: Store) => void;
  favorites: ReturnType<typeof useFavorites>;
  loading: boolean;
}

const PAGE_SIZE = 50;

const ListPage: React.FC<ListPageProps> = ({
  stores,
  userLocation,
  onStoreSelect,
  favorites,
  loading,
}) => {
  const [sortType, setSortType] = useState<SortType>(
    userLocation ? 'distance' : 'name'
  );
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset display count when stores change
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [stores]);

  // Update sort type when userLocation becomes available
  useEffect(() => {
    if (userLocation) {
      setSortType('distance');
    }
  }, [userLocation]);

  // Calculate distances and sort
  const storesWithDistance = useMemo(() => {
    return stores.map((store) => {
      const distance =
        userLocation && store.lat && store.lng
          ? getDistanceKm(userLocation.lat, userLocation.lng, store.lat, store.lng)
          : null;
      return { store, distance };
    });
  }, [stores, userLocation]);

  const sortedStores = useMemo(() => {
    const list = [...storesWithDistance];
    if (sortType === 'distance') {
      list.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    } else {
      list.sort((a, b) => a.store.storeName.localeCompare(b.store.storeName, 'ko'));
    }
    return list;
  }, [storesWithDistance, sortType]);

  const displayedStores = useMemo(
    () => sortedStores.slice(0, displayCount),
    [sortedStores, displayCount]
  );

  const hasMore = displayCount < sortedStores.length;

  // Scroll handler for "load more"
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 200) {
      setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, sortedStores.length));
    }
  }, [hasMore, sortedStores.length]);

  const totalCount = stores.length.toLocaleString();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #eee',
          backgroundColor: '#fff',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
          총 {totalCount}건
        </span>
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value as SortType)}
          style={{
            fontSize: 13,
            padding: '4px 8px',
            border: '1px solid #ddd',
            borderRadius: 6,
            backgroundColor: '#fff',
            color: '#555',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {userLocation && <option value="distance">거리순</option>}
          <option value="name">이름순</option>
        </select>
      </div>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 40,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                border: '3px solid #e8e8e8',
                borderTop: '3px solid #1a73e8',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : stores.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: '#999',
            }}
          >
            <span style={{ fontSize: 40, marginBottom: 12 }}>&#128269;</span>
            <span style={{ fontSize: 14 }}>검색 결과가 없습니다</span>
          </div>
        ) : (
          <>
            {displayedStores.map(({ store, distance }) => (
              <StoreCard
                key={store.franchiseNo}
                store={store}
                distance={distance !== null ? formatDistance(distance) : null}
                isFavorite={favorites.isItemFavorite(store.franchiseNo)}
                onToggleFavorite={() => {
                  if (favorites.isItemFavorite(store.franchiseNo)) {
                    favorites.removeItem(store.franchiseNo);
                  } else {
                    favorites.addItem(store, ['all']);
                  }
                }}
                onClick={() => onStoreSelect(store)}
              />
            ))}
            {hasMore && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px 0',
                  color: '#999',
                  fontSize: 13,
                }}
              >
                스크롤하여 더 보기...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ListPage;
