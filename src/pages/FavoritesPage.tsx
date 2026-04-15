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
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e0e0e0',
            gap: 12,
          }}
        >
          <button
            onClick={() => setSelectedFolderId(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              padding: 0,
              color: '#333',
            }}
          >
            ←
          </button>
          <span style={{ fontSize: 20 }}>{selectedFolder.emoji}</span>
          <span style={{ fontWeight: 'bold', fontSize: 16, color: '#333' }}>
            {selectedFolder.name}
          </span>
          <span style={{ fontSize: 13, color: '#888' }}>{items.length}개</span>
        </div>

        {/* Items list */}
        <div style={{ padding: 16 }}>
          {items.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                color: '#999',
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
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
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
                  <div style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>
                    {item.storeName}
                  </div>
                  <div style={{ fontSize: 12, color: '#1a73e8', marginTop: 2 }}>
                    {item.industryName}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#888',
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
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
                    fontSize: 18,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    color: '#999',
                  }}
                >
                  ⋮
                </button>
                {openMenuItemId === item.franchiseNo && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 44,
                      backgroundColor: '#fff',
                      borderRadius: 8,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
                        padding: '10px 24px',
                        border: 'none',
                        background: 'none',
                        fontSize: 14,
                        color: '#e53935',
                        cursor: 'pointer',
                        textAlign: 'left',
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
          <div style={{ padding: '0 16px 24px 16px' }}>
            <button
              onClick={() => onViewOnMap(items)}
              style={{
                width: '100%',
                padding: '14px 0',
                backgroundColor: '#1a73e8',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🗺️ 이 폴더 가맹점 지도에서 보기
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Main Folder List View ──
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, color: '#333' }}>⭐ 즐겨찾기</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {!isEditMode && (
            <button
              onClick={openCreateModal}
              style={{
                padding: '6px 14px',
                backgroundColor: '#1a73e8',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              + 폴더
            </button>
          )}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            style={{
              padding: '6px 14px',
              backgroundColor: isEditMode ? '#333' : '#f0f0f0',
              color: isEditMode ? '#fff' : '#333',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {isEditMode ? '완료' : '✏️ 편집'}
          </button>
        </div>
      </div>

      {/* Folder list */}
      <div style={{ padding: 16 }}>
        {sortedFolders.map((folder, index) => {
          const itemCount = favorites.getItemsInFolder(folder.id).length;
          const isDefault = folder.isDefault;

          return (
            <div
              key={folder.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: isDefault ? '2px solid #1a73e8' : '1px solid #eee',
                cursor: isEditMode ? 'default' : 'pointer',
              }}
              onClick={() => {
                if (!isEditMode) setSelectedFolderId(folder.id);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <span style={{ fontSize: 22 }}>{folder.emoji}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>
                    {folder.name}
                    {isDefault && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          backgroundColor: '#e3f2fd',
                          color: '#1a73e8',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontWeight: 'normal',
                        }}
                      >
                        기본
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {itemCount}개
                  </div>
                </div>
              </div>

              {/* Edit mode controls */}
              {isEditMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {isDefault ? (
                    <span style={{ fontSize: 16, color: '#999' }}>🔒</span>
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
                          fontSize: 16,
                          cursor: 'pointer',
                          padding: '4px',
                          color: index <= 1 ? '#ccc' : '#666',
                        }}
                        disabled={index <= 1}
                        title="위로 이동"
                      >
                        ▲
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveFolderDown(index);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 16,
                          cursor: 'pointer',
                          padding: '4px',
                          color: index >= sortedFolders.length - 1 ? '#ccc' : '#666',
                        }}
                        disabled={index >= sortedFolders.length - 1}
                        title="아래로 이동"
                      >
                        ▼
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(folder);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 16,
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="수정"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(folder.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 16,
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                        title="삭제"
                      >
                        🗑️
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
            <div style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 12, color: '#333' }}>
              폴더를 삭제할까요?
            </div>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.5 }}>
              폴더만 삭제됩니다. 가맹점은 전체 폴더에 그대로 남아있어요.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteFolder(showDeleteConfirm)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  backgroundColor: '#e53935',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 'bold',
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
            <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
              {editingFolder ? '폴더 수정' : '새 폴더 만들기'}
            </div>

            {/* Selected emoji preview */}
            <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 12 }}>
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
                    padding: '6px 0',
                    backgroundColor:
                      modalEmojiCategory === category ? '#1a73e8' : '#f0f0f0',
                    color: modalEmojiCategory === category ? '#fff' : '#666',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 'bold',
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
                      modalEmoji === emoji ? '2px solid #1a73e8' : '2px solid transparent',
                    borderRadius: 8,
                    backgroundColor: modalEmoji === emoji ? '#e3f2fd' : '#fafafa',
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
                padding: '12px 14px',
                border: '1px solid #ddd',
                borderRadius: 10,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 16,
              }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowFolderModal(false)}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 'bold',
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
                  padding: '12px 0',
                  backgroundColor: modalName.trim() ? '#1a73e8' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 'bold',
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
