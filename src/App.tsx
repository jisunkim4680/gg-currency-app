import { useState, useMemo } from 'react';
import './index.css';
import MapPage from './pages/MapPage';
import ListPage from './pages/ListPage';
import FavoritesPage from './pages/FavoritesPage';
import TabBar from './components/TabBar';
import SearchBar from './components/SearchBar';
import FilterChips from './components/FilterChips';
import StoreDetail from './components/StoreDetail';
import { useStores } from './hooks/useStores';
import { useLocation } from './hooks/useLocation';
import { useFavorites } from './hooks/useFavorites';
import { useRecentSearches } from './hooks/useRecentSearches';
import { getGuList, getDongList, filterByAddress } from './utils/address';
import type { Store } from './types/store';

export type TabType = 'map' | 'list' | 'favorites';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('map');
  const [selectedSigun, setSelectedSigun] = useState<string>('수원시');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGu, setSelectedGu] = useState<string | null>(null);
  const [selectedDong, setSelectedDong] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const { userLocation } = useLocation();
  const { stores, dataSource, loading } = useStores(selectedSigun);
  const favorites = useFavorites();
  const recentSearches = useRecentSearches();

  // 구/동 목록 추출
  const guList = useMemo(() => getGuList(stores), [stores]);
  const dongList = useMemo(() => getDongList(stores, selectedGu), [stores, selectedGu]);

  const filteredStores = useMemo(() => {
    // 1. 구/동 필터
    let result = filterByAddress(stores, selectedGu, selectedDong);

    // 2. 업종 필터
    if (selectedCategory) {
      result = result.filter((store) => {
        const mainType = store.industryName.split('/')[0];
        return mainType.includes(selectedCategory);
      });
    }

    // 3. 검색어 필터
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((store) =>
        store.storeName.toLowerCase().includes(q) ||
        store.industryName.toLowerCase().includes(q) ||
        store.roadAddress.toLowerCase().includes(q)
      );
    }

    return result;
  }, [stores, selectedGu, selectedDong, selectedCategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      recentSearches.add(query.trim());
    }
  };

  const handleSigunChange = (sigun: string) => {
    setSelectedSigun(sigun);
    setSelectedGu(null);
    setSelectedDong(null);
  };

  return (
    <div className="app">
      {activeTab !== 'favorites' && (
        <>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            recentSearches={recentSearches.items}
            onRemoveRecent={recentSearches.remove}
            onClearRecent={recentSearches.clear}
          />
          <FilterChips
            selectedSigun={selectedSigun}
            onSigunChange={handleSigunChange}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            guList={guList}
            dongList={dongList}
            selectedGu={selectedGu}
            onGuChange={setSelectedGu}
            selectedDong={selectedDong}
            onDongChange={setSelectedDong}
          />
        </>
      )}

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {activeTab === 'map' && (
          <MapPage
            stores={filteredStores}
            userLocation={userLocation}
            onStoreSelect={setSelectedStore}
            loading={loading}
          />
        )}
        {activeTab === 'list' && (
          <ListPage
            stores={filteredStores}
            userLocation={userLocation}
            onStoreSelect={setSelectedStore}
            favorites={favorites}
            loading={loading}
          />
        )}
        {activeTab === 'favorites' && (
          <FavoritesPage
            favorites={favorites}
            onStoreSelect={setSelectedStore}
            onViewOnMap={() => {
              setActiveTab('map');
            }}
          />
        )}
      </div>

      {dataSource !== 'api' && dataSource && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          background: dataSource === 'cache' ? '#fff3e0' : '#ffebee',
          color: dataSource === 'cache' ? '#e65100' : '#c62828',
          fontSize: 11, textAlign: 'center', padding: '4px 8px', zIndex: 1000,
        }}>
          {dataSource === 'cache' ? '📦 캐시 데이터입니다' : '📂 정적 데이터입니다'}
        </div>
      )}

      {selectedStore && (
        <StoreDetail
          store={selectedStore}
          userLocation={userLocation}
          favorites={favorites}
          onClose={() => setSelectedStore(null)}
        />
      )}

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
