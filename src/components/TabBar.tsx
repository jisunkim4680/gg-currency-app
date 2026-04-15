import React from 'react';

type TabType = 'map' | 'list' | 'favorites';

interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { key: TabType; label: string; emoji: string }[] = [
  { key: 'map', label: '지도', emoji: '🗺️' },
  { key: 'list', label: '목록', emoji: '📋' },
  { key: 'favorites', label: '즐겨찾기', emoji: '⭐' },
];

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              height: '100%',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: isActive ? '#1a73e8' : '#999',
              fontWeight: isActive ? 'bold' : 'normal',
              fontSize: 10,
              padding: 0,
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default TabBar;
