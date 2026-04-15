import React, { useState } from 'react';
import { SIGUN_LIST } from '../utils/constants';

const CATEGORIES = ['음식점', '카페', '편의점', '약국', '미용실', '병원', '마트', '학원'];

interface FilterChipsProps {
  selectedSigun: string;
  onSigunChange: (sigun: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  selectedSigun,
  onSigunChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const [showSigunModal, setShowSigunModal] = useState(false);

  const chipStyle = (isSelected: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: 16,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: isSelected ? 'bold' : 'normal',
    backgroundColor: isSelected ? '#1a73e8' : '#f5f5f5',
    color: isSelected ? '#ffffff' : '#666',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  });

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '8px 16px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {/* Sigun chip */}
        <button
          style={chipStyle(true)}
          onClick={() => setShowSigunModal(true)}
        >
          {selectedSigun} ▾
        </button>

        {/* Category chips */}
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              style={chipStyle(isSelected)}
              onClick={() => onCategoryChange(isSelected ? null : category)}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Sigun selector modal */}
      {showSigunModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowSigunModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 20,
              width: '85%',
              maxWidth: 360,
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: '#333' }}>
              시/군 선택
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
              }}
            >
              {SIGUN_LIST.map((sigun) => (
                <button
                  key={sigun}
                  onClick={() => {
                    onSigunChange(sigun);
                    setShowSigunModal(false);
                  }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: 8,
                    border: selectedSigun === sigun ? '2px solid #1a73e8' : '1px solid #e0e0e0',
                    backgroundColor: selectedSigun === sigun ? '#e8f0fe' : '#ffffff',
                    color: selectedSigun === sigun ? '#1a73e8' : '#333',
                    fontWeight: selectedSigun === sigun ? 'bold' : 'normal',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {sigun}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterChips;
