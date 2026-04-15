import React, { useState, useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  recentSearches: string[];
  onRemoveRecent: (query: string) => void;
  onClearRecent: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  recentSearches,
  onRemoveRecent,
  onClearRecent,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showDropdown = isFocused && recentSearches.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSearch(value.trim());
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleRecentClick = (query: string) => {
    onChange(query);
    onSearch(query);
    setIsFocused(false);
  };

  const handleBlur = () => {
    // Delay to allow click events on dropdown items
    setTimeout(() => setIsFocused(false), 200);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', padding: '8px 16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 32,
          padding: '12px 20px',
          gap: 10,
          boxShadow: isFocused
            ? 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px, 0 0 0 2px rgba(255,56,92,0.2)'
            : 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="가맹점명, 주소, 업종으로 검색"
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            outline: 'none',
            fontSize: 14,
            fontWeight: 500,
            color: '#222222',
          }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{
              border: 'none',
              background: '#f2f2f2',
              cursor: 'pointer',
              width: 20,
              height: 20,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: '#6a6a6a',
              padding: 0,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 16,
            right: 16,
            backgroundColor: '#ffffff',
            borderRadius: 20,
            boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px',
            zIndex: 100,
            maxHeight: 300,
            overflowY: 'auto',
            marginTop: 4,
            padding: '8px 0',
          }}
        >
          {recentSearches.map((query) => (
            <div
              key={query}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 20px',
                cursor: 'pointer',
              }}
              onClick={() => handleRecentClick(query)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6a6a6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ fontSize: 14, color: '#222222' }}>{query}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRecent(query);
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: '#b0b0b0',
                  padding: '0 4px',
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              onClearRecent();
              setIsFocused(false);
            }}
            style={{
              width: '100%',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '10px 20px',
              fontSize: 13,
              color: '#6a6a6a',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            전체 삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
