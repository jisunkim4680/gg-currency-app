import React, { useState } from 'react';
import { SIGUN_LIST } from '../utils/constants';

const CATEGORIES = ['음식점', '카페', '편의점', '약국', '미용실', '병원', '마트', '학원'];

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

  const subChipStyle = (isSelected: boolean): React.CSSProperties => ({
    ...chipStyle(isSelected),
    backgroundColor: isSelected ? '#0d5bbd' : '#e8ecf8',
    color: isSelected ? '#ffffff' : '#1a73e8',
  });

  return (
    <>
      {/* 1행: 시군 + 구 + 동 */}
      <div style={{
        display: 'flex', gap: 6, padding: '6px 16px 2px',
        overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        <button style={chipStyle(true)} onClick={() => setShowSigunModal(true)}>
          📍 {selectedSigun} ▾
        </button>

        {guList.length > 0 && (
          <button
            style={subChipStyle(!!selectedGu)}
            onClick={() => setShowGuModal(true)}
          >
            {selectedGu || '구/군 전체'} ▾
          </button>
        )}

        {selectedGu && dongList.length > 0 && (
          <button
            style={subChipStyle(!!selectedDong)}
            onClick={() => setShowDongModal(true)}
          >
            {selectedDong || '동/읍/면 전체'} ▾
          </button>
        )}
      </div>

      {/* 2행: 업종 필터 */}
      <div style={{
        display: 'flex', gap: 6, padding: '4px 16px 8px',
        overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
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
          backgroundColor: '#fff', borderRadius: 16, padding: 20,
          width: '85%', maxWidth: 360, maxHeight: '70vh', overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: '#333' }}>{title}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {items.map((item) => (
            <button
              key={item}
              onClick={() => onSelect(item)}
              style={{
                padding: '10px 4px', borderRadius: 8,
                border: selected === item ? '2px solid #1a73e8' : '1px solid #e0e0e0',
                backgroundColor: selected === item ? '#e8f0fe' : '#fff',
                color: selected === item ? '#1a73e8' : '#333',
                fontWeight: selected === item ? 'bold' : 'normal',
                cursor: 'pointer', fontSize: 13,
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
