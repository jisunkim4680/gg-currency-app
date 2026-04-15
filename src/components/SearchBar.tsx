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

  const handleSearchClick = () => {
    if (value.trim()) {
      onSearch(value.trim());
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', padding: '8px 16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 8,
          border: isFocused ? '1px solid #03C75A' : '1px solid #e5e5e5',
          padding: '0 0 0 12px',
          gap: 0,
          transition: 'border-color 0.2s ease',
          overflow: 'hidden',
        }}
      >
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
            fontWeight: 400,
            color: '#1e1e1e',
            padding: '10px 0',
          }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{
              border: 'none',
              background: '#f5f6f8',
              cursor: 'pointer',
              width: 20,
              height: 20,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: '#808080',
              padding: 0,
              flexShrink: 0,
              marginRight: 8,
            }}
          >
            ✕
          </button>
        )}
        {/* Green search button on right */}
        <button
          onClick={handleSearchClick}
          style={{
            width: 40,
            height: 40,
            backgroundColor: '#03C75A',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 16,
            right: 16,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            border: '1px solid #e5e5e5',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            zIndex: 100,
            maxHeight: 300,
            overflowY: 'auto',
            marginTop: 4,
            padding: '4px 0',
          }}
        >
          {recentSearches.map((query) => (
            <div
              key={query}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                cursor: 'pointer',
              }}
              onClick={() => handleRecentClick(query)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ fontSize: 14, color: '#1e1e1e' }}>{query}</span>
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
                  color: '#b2b2b2',
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
              padding: '10px 16px',
              fontSize: 13,
              color: '#808080',
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
