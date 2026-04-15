import React from 'react';
import { Store } from '../types/store';
import { getIndustryEmoji } from '../utils/industry';

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
        padding: 14,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        border: '1px solid #e8e8e8',
        cursor: 'pointer',
      }}
    >
      {/* Industry emoji */}
      <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>
        {getIndustryEmoji(store.industryName)}
      </span>

      {/* Store info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {store.storeName}
        </div>
        <div style={{ fontSize: 12, color: '#1a73e8', marginBottom: 2 }}>
          {store.industryName}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#888',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {store.roadAddress || store.lotAddress}
        </div>
        {distance && (
          <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
            {distance}
          </div>
        )}
      </div>

      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontSize: 20,
          padding: 4,
          flexShrink: 0,
          lineHeight: 1,
        }}
        aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      >
        {isFavorite ? '⭐' : '☆'}
      </button>
    </div>
  );
};

export default StoreCard;
