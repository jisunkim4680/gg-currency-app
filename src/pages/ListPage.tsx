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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f5f6f8' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e5e5',
          backgroundColor: '#fff',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e1e1e' }}>
          {totalCount}건
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {userLocation && (
            <button
              onClick={() => setSortType('distance')}
              style={{
                fontSize: 13,
                padding: '4px 0',
                border: 'none',
                background: 'none',
                color: sortType === 'distance' ? '#03C75A' : '#808080',
                cursor: 'pointer',
                fontWeight: sortType === 'distance' ? 600 : 400,
              }}
            >
              거리순
            </button>
          )}
          {userLocation && <span style={{ color: '#e5e5e5', fontSize: 12 }}>|</span>}
          <button
            onClick={() => setSortType('name')}
            style={{
              fontSize: 13,
              padding: '4px 0',
              border: 'none',
              background: 'none',
              color: sortType === 'name' ? '#03C75A' : '#808080',
              cursor: 'pointer',
              fontWeight: sortType === 'name' ? 600 : 400,
            }}
          >
            이름순
          </button>
        </div>
      </div>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          backgroundColor: '#ffffff',
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
                border: '3px solid #e5e5e5',
                borderTop: '3px solid #03C75A',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          </div>
        ) : stores.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: '#808080',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b2b2b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1e1e1e', marginBottom: 4 }}>
              검색 결과가 없습니다
            </span>
            <span style={{ fontSize: 13, color: '#808080' }}>
              다른 검색어나 필터를 시도해보세요
            </span>
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
                  color: '#808080',
                  fontSize: 13,
                  fontWeight: 400,
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
