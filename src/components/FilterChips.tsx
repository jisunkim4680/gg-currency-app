import React, { useState } from 'react';
import { SIGUN_LIST } from '../utils/constants';

const CATEGORIES: { label: string; icon: string }[] = [
  { label: '음식점', icon: '🍽' },
  { label: '카페', icon: '☕' },
  { label: '편의점', icon: '🏪' },
  { label: '약국', icon: '💊' },
  { label: '미용실', icon: '✂️' },
  { label: '병원', icon: '🏥' },
  { label: '마트', icon: '🛒' },
  { label: '학원', icon: '📚' },
];

interface FilterChipsProps {
  selectedSigun: string;
  onSigunChange: (sigun: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  // 구/동 필터
  guList: string[];
  dongList: string[];
  selectedGu: string | null;
  onGuChange: (gu: string | null) => void;
  selectedDong: string | null;
  onDongChange: (dong: string | null) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  selectedSigun,
  onSigunChange,
  selectedCategory,
  onCategoryChange,
  guList,
  dongList,
  selectedGu,
  onGuChange,
  selectedDong,
  onDongChange,
}) => {
  const [showSigunModal, setShowSigunModal] = useState(false);
  const [showGuModal, setShowGuModal] = useState(false);
  const [showDongModal, setShowDongModal] = useState(false);

  const locationChipStyle = (isSelected: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: 20,
    border: isSelected ? '1px solid #03C75A' : '1px solid #e5e5e5',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: isSelected ? 600 : 400,
    backgroundColor: isSelected ? '#03C75A' : '#ffffff',
    color: isSelected ? '#ffffff' : '#1e1e1e',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    gap: 4,
    transition: 'all 0.15s ease',
  });

  const subChipStyle = (isSelected: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: 20,
    border: isSelected ? '1px solid #03C75A' : '1px solid #e5e5e5',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: isSelected ? 600 : 400,
    backgroundColor: isSelected ? '#e8f8ef' : '#ffffff',
    color: isSelected ? '#03C75A' : '#808080',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    gap: 4,
    transition: 'all 0.15s ease',
  });

  return (
    <>
      {/* 1행: 시군 + 구 + 동 + 업종 (horizontal scroll, pill chips) */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 16px 4px',
        overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        <button style={locationChipStyle(true)} onClick={() => setShowSigunModal(true)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {selectedSigun}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {guList.length > 0 && (
          <button
            style={subChipStyle(!!selectedGu)}
            onClick={() => setShowGuModal(true)}
          >
            {selectedGu || '구/군 전체'}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}

        {selectedGu && dongList.length > 0 && (
          <button
            style={subChipStyle(!!selectedDong)}
            onClick={() => setShowDongModal(true)}
          >
            {selectedDong || '동/읍/면 전체'}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* 2행: 업종 필터 - horizontal pill chips (Naver style) */}
      <div style={{
        display: 'flex', gap: 8, padding: '8px 16px 12px',
        overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.label;
          return (
            <button
              key={category.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 14px',
                borderRadius: 20,
                border: isSelected ? '1px solid #03C75A' : '1px solid #e5e5e5',
                backgroundColor: isSelected ? '#03C75A' : '#ffffff',
                color: isSelected ? '#ffffff' : '#1e1e1e',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isSelected ? 600 : 400,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onClick={() => onCategoryChange(isSelected ? null : category.label)}
            >
              <span style={{ fontSize: 14 }}>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* 시군 선택 모달 */}
      {showSigunModal && (
        <SelectModal
          title="시/군 선택"
          items={SIGUN_LIST}
          selected={selectedSigun}
          onSelect={(v) => {
            onSigunChange(v);
            onGuChange(null);
            onDongChange(null);
            setShowSigunModal(false);
          }}
          onClose={() => setShowSigunModal(false)}
        />
      )}

      {/* 구 선택 모달 */}
      {showGuModal && (
        <SelectModal
          title="구/군 선택"
          items={['전체', ...guList]}
          selected={selectedGu || '전체'}
          onSelect={(v) => {
            onGuChange(v === '전체' ? null : v);
            onDongChange(null);
            setShowGuModal(false);
          }}
          onClose={() => setShowGuModal(false)}
        />
      )}

      {/* 동 선택 모달 */}
      {showDongModal && (
        <SelectModal
          title="동/읍/면 선택"
          items={['전체', ...dongList]}
          selected={selectedDong || '전체'}
          onSelect={(v) => {
            onDongChange(v === '전체' ? null : v);
            setShowDongModal(false);
          }}
          onClose={() => setShowDongModal(false)}
        />
      )}
    </>
  );
};

// 공통 선택 모달
function SelectModal({
  title, items, selected, onSelect, onClose,
}: {
  title: string;
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff', borderRadius: 16, padding: 24,
          width: '85%', maxWidth: 360, maxHeight: '70vh', overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#1e1e1e', letterSpacing: '-0.2px' }}>{title}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {items.map((item) => (
            <button
              key={item}
              onClick={() => onSelect(item)}
              style={{
                padding: '12px 4px', borderRadius: 8,
                border: selected === item ? '2px solid #03C75A' : '1px solid #e5e5e5',
                backgroundColor: selected === item ? '#e8f8ef' : '#fff',
                color: selected === item ? '#03C75A' : '#1e1e1e',
                fontWeight: selected === item ? 600 : 400,
                cursor: 'pointer', fontSize: 13,
                transition: 'all 0.15s ease',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterChips;
