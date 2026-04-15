import React, { useState } from 'react';
import { FavoriteFolder, FavoriteItem, EMOJI_OPTIONS } from '../types/favorites';
import { Store } from '../types/store';

interface FavoritesPageProps {
  favorites: {
    folders: FavoriteFolder[];
    items: FavoriteItem[];
    getItemsInFolder: (folderId: string) => FavoriteItem[];
    addFolder: (name: string, emoji: string) => void;
    updateFolder: (id: string, name: string, emoji: string) => void;
    deleteFolder: (id: string) => void;
    reorderFolders: (folderIds: string[]) => void;
    removeItem: (franchiseNo: string) => void;
  };
  onStoreSelect: (store: Store) => void;
  onViewOnMap: (stores: FavoriteItem[]) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favorites,
  onStoreSelect,
  onViewOnMap,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FavoriteFolder | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [openMenuItemId, setOpenMenuItemId] = useState<string | null>(null);

  // Folder modal state
  const [modalEmoji, setModalEmoji] = useState('🍽️');
  const [modalName, setModalName] = useState('');
  const [modalEmojiCategory, setModalEmojiCategory] = useState<keyof typeof EMOJI_OPTIONS>('음식');

  const sortedFolders = [...favorites.folders].sort((a, b) => a.order - b.order);
  const selectedFolder = selectedFolderId
    ? sortedFolders.find((f) => f.id === selectedFolderId)
    : null;
  const selectedFolderItems = selectedFolderId
    ? favorites.getItemsInFolder(selectedFolderId)
    : [];

  const openCreateModal = () => {
    setEditingFolder(null);
    setModalEmoji('🍽️');
    setModalName('');
    setModalEmojiCategory('음식');
    setShowFolderModal(true);
  };

  const openEditModal = (folder: FavoriteFolder) => {
    setEditingFolder(folder);
    setModalEmoji(folder.emoji);
    setModalName(folder.name);
    setModalEmojiCategory('음식');
    setShowFolderModal(true);
  };

  const handleSaveFolder = () => {
    if (!modalName.trim()) return;
    if (editingFolder) {
      favorites.updateFolder(editingFolder.id, modalName.trim(), modalEmoji);
    } else {
      favorites.addFolder(modalName.trim(), modalEmoji);
    }
    setShowFolderModal(false);
  };

  const handleDeleteFolder = (id: string) => {
    favorites.deleteFolder(id);
    setShowDeleteConfirm(null);
  };

  const moveFolderUp = (index: number) => {
    if (index <= 1) return; // index 0 is "전체", cannot move
    const ids = sortedFolders.map((f) => f.id);
    [ids[index], ids[index - 1]] = [ids[index - 1], ids[index]];
    favorites.reorderFolders(ids);
  };

  const moveFolderDown = (index: number) => {
    if (index === 0 || index >= sortedFolders.length - 1) return;
    const ids = sortedFolders.map((f) => f.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    favorites.reorderFolders(ids);
  };

  // ── Folder Detail View ──
  if (selectedFolder) {
    const items = selectedFolderItems;
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f6f8' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e5e5e5',
            gap: 12,
          }}
        >
          <button
            onClick={() => setSelectedFolderId(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#1e1e1e',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ fontSize: 20 }}>{selectedFolder.emoji}</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#1e1e1e', letterSpacing: '-0.2px' }}>
            {selectedFolder.name}
          </span>
          <span style={{ fontSize: 13, color: '#808080', fontWeight: 400 }}>{items.length}개</span>
        </div>

        {/* Items list */}
        <div style={{ backgroundColor: '#ffffff' }}>
          {items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                color: '#808080',
                fontSize: 14,
              }}
            >
              이 폴더에 저장된 가맹점이 없습니다.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.franchiseNo}
                style={{
                  backgroundColor: '#fff',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() =>
                  onStoreSelect({
                    storeName: item.storeName,
                    industryName: item.industryName,
                    roadAddress: item.roadAddress,
                    lat: item.lat,
                    lng: item.lng,
                    sigunName: item.sigunName,
                    franchiseNo: item.franchiseNo,
                    industryCode: '',
                    lotAddress: '',
                    zipCode: '',
                    bizRegNo: '',
                    status: '',
                    statusCode: '',
                  })
                }
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#1e1e1e', letterSpacing: '-0.2px' }}>
                    {item.storeName}
                  </div>
                  <div style={{ fontSize: 13, color: '#808080', marginTop: 4, fontWeight: 400 }}>
                    {item.industryName}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#808080',
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: 400,
                    }}
                  >
                    {item.roadAddress}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuItemId(
                      openMenuItemId === item.franchiseNo ? null : item.franchiseNo
                    );
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    color: '#808080',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#808080">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                {openMenuItemId === item.franchiseNo && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 48,
                      backgroundColor: '#fff',
                      borderRadius: 8,
                      border: '1px solid #e5e5e5',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      zIndex: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        favorites.removeItem(item.franchiseNo);
                        setOpenMenuItemId(null);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '12px 24px',
                        border: 'none',
                        background: 'none',
                        fontSize: 14,
                        color: '#ff3b30',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 500,
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* View on map button */}
        {items.length > 0 && (
          <div style={{ padding: '16px 16px 24px 16px' }}>
            <button
              onClick={() => onViewOnMap(items)}
              style={{
                width: '100%',
                padding: '14px 0',
                backgroundColor: '#03C75A',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                letterSpacing: '-0.1px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              이 폴더 가맹점 지도에서 보기
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Main Folder List View ──
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f6f8' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: isEditMode ? '#fffbe6' : '#fff',
          borderBottom: '1px solid #e5e5e5',
          transition: 'background-color 0.2s ease',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e1e1e', letterSpacing: '-0.4px' }}>
          즐겨찾기
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isEditMode && (
            <button
              onClick={openCreateModal}
              style={{
                padding: '8px 16px',
                backgroundColor: '#03C75A',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + 폴더
            </button>
          )}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            style={{
              padding: '8px 16px',
              backgroundColor: isEditMode ? '#1e1e1e' : '#ffffff',
              color: isEditMode ? '#fff' : '#1e1e1e',
              border: isEditMode ? 'none' : '1px solid #e5e5e5',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isEditMode ? '완료' : '편집'}
          </button>
        </div>
      </div>

      {/* Folder list */}
      <div style={{ backgroundColor: '#ffffff' }}>
        {sortedFolders.map((folder, index) => {
          const itemCount = favorites.getItemsInFolder(folder.id).length;
          const isDefault = folder.isDefault;

          return (
            <div
              key={folder.id}
              style={{
                backgroundColor: '#fff',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f0f0f0',
                borderLeft: isDefault ? '3px solid #03C75A' : '3px solid transparent',
                cursor: isEditMode ? 'default' : 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onClick={() => {
                if (!isEditMode) setSelectedFolderId(folder.id);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <span style={{ fontSize: 24 }}>{folder.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#1e1e1e', letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {folder.name}
                    {isDefault && (
                      <span
                        style={{
                          fontSize: 11,
                          backgroundColor: '#e8f8ef',
                          color: '#03C75A',
                          padding: '2px 8px',
                          borderRadius: 20,
                          fontWeight: 500,
                        }}
                      >
                        기본
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#808080', marginTop: 4, fontWeight: 400 }}>
                    {itemCount}개
                  </div>
                </div>
              </div>

              {/* Edit mode controls */}
              {isEditMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isDefault ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b2b2b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveFolderUp(index);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        disabled={index <= 1}
                        title="위로 이동"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={index <= 1 ? '#e5e5e5' : '#1e1e1e'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveFolderDown(index);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        disabled={index >= sortedFolders.length - 1}
                        title="아래로 이동"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={index >= sortedFolders.length - 1 ? '#e5e5e5' : '#1e1e1e'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(folder);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="수정"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(folder.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title="삭제"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: '24px',
              width: '85%',
              maxWidth: 340,
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#1e1e1e', letterSpacing: '-0.2px' }}>
              폴더를 삭제할까요?
            </div>
            <div style={{ fontSize: 14, color: '#808080', marginBottom: 24, lineHeight: 1.6 }}>
              폴더만 삭제됩니다. 가맹점은 전체 폴더에 그대로 남아있어요.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  backgroundColor: '#ffffff',
                  color: '#1e1e1e',
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteFolder(showDeleteConfirm)}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  backgroundColor: '#ff3b30',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit folder modal */}
      {showFolderModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowFolderModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: '24px',
              width: '85%',
              maxWidth: 360,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1e1e1e', letterSpacing: '-0.2px' }}>
              {editingFolder ? '폴더 수정' : '새 폴더 만들기'}
            </div>

            {/* Selected emoji preview */}
            <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 16 }}>
              {modalEmoji}
            </div>

            {/* Emoji category tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(Object.keys(EMOJI_OPTIONS) as (keyof typeof EMOJI_OPTIONS)[]).map((category) => (
                <button
                  key={category}
                  onClick={() => setModalEmojiCategory(category)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    backgroundColor:
                      modalEmojiCategory === category ? '#03C75A' : '#f5f6f8',
                    color: modalEmojiCategory === category ? '#fff' : '#808080',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 6,
                marginBottom: 16,
              }}
            >
              {EMOJI_OPTIONS[modalEmojiCategory].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setModalEmoji(emoji)}
                  style={{
                    fontSize: 24,
                    padding: '8px 0',
                    border:
                      modalEmoji === emoji ? '2px solid #03C75A' : '2px solid transparent',
                    borderRadius: 8,
                    backgroundColor: modalEmoji === emoji ? '#e8f8ef' : '#f5f6f8',
                    cursor: 'pointer',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Folder name input */}
            <input
              type="text"
              value={modalName}
              onChange={(e) => setModalName(e.target.value)}
              placeholder="폴더 이름을 입력하세요"
              maxLength={20}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e5e5e5',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 20,
                color: '#1e1e1e',
              }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowFolderModal(false)}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  backgroundColor: '#ffffff',
                  color: '#1e1e1e',
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                onClick={handleSaveFolder}
                disabled={!modalName.trim()}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  backgroundColor: modalName.trim() ? '#03C75A' : 'rgba(0,0,0,0.24)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: modalName.trim() ? 'pointer' : 'default',
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
