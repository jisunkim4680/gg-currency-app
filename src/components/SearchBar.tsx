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
          backgroundColor: '#f5f5f5',
          borderRadius: 20,
          padding: '8px 16px',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16, flexShrink: 0 }}>🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="가맹점 검색"
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            outline: 'none',
            fontSize: 14,
            color: '#333',
          }}
        />
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 100,
            maxHeight: 300,
            overflowY: 'auto',
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
                borderBottom: '1px solid #f0f0f0',
              }}
              onClick={() => handleRecentClick(query)}
            >
              <span style={{ fontSize: 14, color: '#333' }}>{query}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRecent(query);
                }}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#999',
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
              color: '#999',
              textAlign: 'center',
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
