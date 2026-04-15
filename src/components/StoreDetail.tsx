import React, { useState, useCallback } from 'react';
import BottomSheet from './BottomSheet';
import { Store } from '../types/store';
import { getDistanceKm, formatDistance } from '../utils/geo';
import { getIndustryEmoji } from '../utils/industry';
import { useFavorites } from '../hooks/useFavorites';

interface StoreDetailProps {
  store: Store;
  userLocation: { lat: number; lng: number } | null;
  favorites: ReturnType<typeof useFavorites>;
  onClose: () => void;
}

const StoreDetail: React.FC<StoreDetailProps> = ({
  store,
  userLocation,
  favorites,
  onClose,
}) => {
  const [toastVisible, setToastVisible] = useState(false);

  const isFavorite = favorites.isItemFavorite(store.franchiseNo);

  const distance =
    userLocation && store.lat && store.lng
      ? getDistanceKm(userLocation.lat, userLocation.lng, store.lat, store.lng)
      : null;

  const handleToggleFavorite = useCallback(() => {
    if (isFavorite) {
      favorites.removeItem(store.franchiseNo);
    } else {
      favorites.addItem(store, ['all']);
    }
  }, [isFavorite, favorites, store]);

  const handleDirections = useCallback(() => {
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(store.storeName)},${store.lat},${store.lng}`;
    window.open(url, '_blank');
  }, [store]);

  const handleCopyAddress = useCallback(async () => {
    const address = store.roadAddress || store.lotAddress;
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = address;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 1500);
    }
  }, [store]);

  return (
    <BottomSheet isOpen={true} onClose={onClose} title={store.storeName}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Store header with emoji and favorite */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 32 }}>
              {getIndustryEmoji(store.industryName)}
            </span>
            <span
              style={{
                fontSize: 14,
                color: '#1a73e8',
                fontWeight: 500,
                backgroundColor: '#e8f0fe',
                padding: '4px 10px',
                borderRadius: 12,
              }}
            >
              {store.industryName}
            </span>
          </div>
          <button
            onClick={handleToggleFavorite}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 24,
              padding: 4,
              lineHeight: 1,
            }}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            {isFavorite ? '\u2B50' : '\u2606'}
          </button>
        </div>

        {/* Detail info rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {store.roadAddress && (
            <DetailRow label="도로명주소" value={store.roadAddress} />
          )}
          {store.lotAddress && (
            <DetailRow label="지번주소" value={store.lotAddress} />
          )}
          {store.zipCode && (
            <DetailRow label="우편번호" value={store.zipCode} />
          )}
          {distance !== null && (
            <DetailRow label="거리" value={formatDistance(distance)} />
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={handleDirections}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '12px 0',
              backgroundColor: '#1a73e8',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            <span role="img" aria-label="길찾기">&#x1F5FA;&#xFE0F;</span>
            길찾기
          </button>
          <button
            onClick={handleCopyAddress}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '12px 0',
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            <span role="img" aria-label="주소 복사">&#x1F4CB;</span>
            주소 복사
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toastVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: 20,
            fontSize: 13,
            zIndex: 4000,
            pointerEvents: 'none',
          }}
        >
          복사됨!
        </div>
      )}
    </BottomSheet>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
    <span
      style={{
        flexShrink: 0,
        width: 72,
        color: '#888',
        fontWeight: 500,
      }}
    >
      {label}
    </span>
    <span style={{ color: '#333', wordBreak: 'break-all' }}>{value}</span>
  </div>
);

export default StoreDetail;
