import React from 'react';
import { Store } from '../types/store';
import { getIndustryCategory } from '../utils/industry';
import IndustryIcon from './IndustryIcon';

interface StoreCardProps {
  store: Store;
  distance: string | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

const StoreCard: React.FC<StoreCardProps> = ({
  store,
  distance,
  isFavorite,
  onToggleFavorite,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Industry icon */}
      <IndustryIcon category={getIndustryCategory(store.industryName)} size={24} />

      {/* Store info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#222222',
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.2px',
          }}
        >
          {store.storeName}
        </div>
        <div style={{ fontSize: 14, color: '#6a6a6a', fontWeight: 400, marginBottom: 2 }}>
          {store.industryName}
        </div>
        <div
          style={{
            fontSize: 14,
            color: '#6a6a6a',
            fontWeight: 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {store.roadAddress || store.lotAddress}
        </div>
        {distance && (
          <div style={{ fontSize: 13, color: '#222222', fontWeight: 500, marginTop: 4 }}>
            {distance}
          </div>
        )}
      </div>

      {/* Favorite button - heart icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: 4,
          flexShrink: 0,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      >
        <svg
          width="22"
          height="22"
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
  );
};

export default StoreCard;
