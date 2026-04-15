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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Store header with emoji and favorite */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32 }}>
              {getIndustryEmoji(store.industryName)}
            </span>
            <span
              style={{
                fontSize: 14,
                color: '#222222',
                fontWeight: 500,
                backgroundColor: '#f2f2f2',
                padding: '6px 12px',
                borderRadius: 14,
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
              padding: 4,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill={isFavorite ? '#ff385c' : 'none'}
              stroke={isFavorite ? '#ff385c' : '#222222'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Detail info rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {store.roadAddress && (
            <DetailRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a6a6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              }
              label="도로명주소"
              value={store.roadAddress}
            />
          )}
          {store.lotAddress && (
            <DetailRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a6a6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              }
              label="지번주소"
              value={store.lotAddress}
            />
          )}
          {store.zipCode && (
            <DetailRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a6a6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                </svg>
              }
              label="우편번호"
              value={store.zipCode}
            />
          )}
          {distance !== null && (
            <DetailRow
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a6a6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              }
              label="거리"
              value={formatDistance(distance)}
            />
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
              gap: 8,
              padding: '14px 0',
              backgroundColor: '#222222',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '-0.1px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            길찾기
          </button>
          <button
            onClick={handleCopyAddress}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 0',
              backgroundColor: '#f2f2f2',
              color: '#222222',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '-0.1px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
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
            backgroundColor: '#222222',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: 32,
            fontSize: 14,
            fontWeight: 500,
            zIndex: 4000,
            pointerEvents: 'none',
          }}
        >
          주소가 복사되었습니다
        </div>
      )}
    </BottomSheet>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div style={{ display: 'flex', gap: 10, fontSize: 14, alignItems: 'flex-start' }}>
    <div style={{ flexShrink: 0, marginTop: 2 }}>{icon}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ color: '#6a6a6a', fontSize: 12, fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ color: '#222222', wordBreak: 'break-all', fontWeight: 400 }}>{value}</span>
    </div>
  </div>
);

export default StoreDetail;
