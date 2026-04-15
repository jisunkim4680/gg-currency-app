import React, { useState } from 'react';
import { Store } from '../types/store';
import { FavoriteFolder, EMOJI_OPTIONS } from '../types/favorites';
import BottomSheet from '../components/BottomSheet';

interface AddFavoriteProps {
  store: Store;
  folders: FavoriteFolder[];
  onSave: (folderIds: string[]) => void;
  onClose: () => void;
  onCreateFolder: (name: string, emoji: string) => void;
}

const AddFavorite: React.FC<AddFavoriteProps> = ({
  store,
  folders,
  onSave,
  onClose,
  onCreateFolder,
}) => {
  const userFolders = folders.filter((f) => !f.isDefault);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  // Create folder modal state
  const [newFolderEmoji, setNewFolderEmoji] = useState('🍽️');
  const [newFolderName, setNewFolderName] = useState('');
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof EMOJI_OPTIONS>('음식');

  const toggleFolder = (folderId: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleSave = () => {
    onSave(selectedFolderIds);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim(), newFolderEmoji);
    setNewFolderName('');
    setNewFolderEmoji('🍽️');
    setShowCreateFolder(false);
  };

  // Build preview text
  const selectedNames = userFolders
    .filter((f) => selectedFolderIds.includes(f.id))
    .map((f) => f.name);
  const previewText =
    selectedNames.length > 0
      ? `전체 + ${selectedNames.join(', ')}`
      : '전체';

  return (
    <>
      <BottomSheet isOpen={true} onClose={onClose} title="즐겨찾기에 저장">
        {/* Store info */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 'bold', fontSize: 15, color: '#333' }}>
            {store.storeName}
          </div>
          <div style={{ fontSize: 13, color: '#1a73e8', marginTop: 2 }}>
            {store.industryName}
          </div>
        </div>

        {/* Auto-save banner */}
        <div
          style={{
            backgroundColor: '#e8f5e9',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: 13,
            color: '#2e7d32',
            fontWeight: 'bold',
          }}
        >
          ✅ 전체 폴더에 자동 저장
        </div>

        {/* Additional folder selection */}
        <div
          style={{
            fontSize: 13,
            color: '#666',
            fontWeight: 'bold',
            marginBottom: 10,
          }}
        >
          추가 폴더 선택 (선택사항)
        </div>

        <div style={{ marginBottom: 12 }}>
          {userFolders.map((folder) => (
            <label
              key={folder.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                backgroundColor: selectedFolderIds.includes(folder.id)
                  ? '#e3f2fd'
                  : '#fafafa',
                marginBottom: 6,
                cursor: 'pointer',
                border: selectedFolderIds.includes(folder.id)
                  ? '1px solid #1a73e8'
                  : '1px solid #eee',
              }}
            >
              <input
                type="checkbox"
                checked={selectedFolderIds.includes(folder.id)}
                onChange={() => toggleFolder(folder.id)}
                style={{
                  width: 18,
                  height: 18,
                  accentColor: '#1a73e8',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: 18 }}>{folder.emoji}</span>
              <span style={{ fontSize: 14, color: '#333' }}>{folder.name}</span>
            </label>
          ))}

          {/* Create new folder option */}
          <button
            onClick={() => setShowCreateFolder(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              backgroundColor: '#fafafa',
              border: '1px dashed #ccc',
              width: '100%',
              cursor: 'pointer',
              fontSize: 14,
              color: '#1a73e8',
              fontWeight: 'bold',
            }}
          >
            + 새 폴더 만들기...
          </button>
        </div>

        {/* Preview */}
        <div
          style={{
            backgroundColor: '#fff8e1',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 16,
            fontSize: 13,
            color: '#795548',
          }}
        >
          💡 저장 위치: {previewText}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
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
          저장하기
        </button>
      </BottomSheet>

      {/* Create folder modal */}
      {showCreateFolder && (
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
          onClick={() => setShowCreateFolder(false)}
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
              새 폴더 만들기
            </div>

            {/* Selected emoji preview */}
            <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 12 }}>
              {newFolderEmoji}
            </div>

            {/* Emoji category tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(Object.keys(EMOJI_OPTIONS) as (keyof typeof EMOJI_OPTIONS)[]).map((category) => (
                <button
                  key={category}
                  onClick={() => setEmojiCategory(category)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    backgroundColor: emojiCategory === category ? '#1a73e8' : '#f0f0f0',
                    color: emojiCategory === category ? '#fff' : '#666',
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
              {EMOJI_OPTIONS[emojiCategory].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewFolderEmoji(emoji)}
                  style={{
                    fontSize: 24,
                    padding: '8px 0',
                    border:
                      newFolderEmoji === emoji
                        ? '2px solid #1a73e8'
                        : '2px solid transparent',
                    borderRadius: 8,
                    backgroundColor: newFolderEmoji === emoji ? '#e3f2fd' : '#fafafa',
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
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
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
                onClick={() => setShowCreateFolder(false)}
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
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  backgroundColor: newFolderName.trim() ? '#1a73e8' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: newFolderName.trim() ? 'pointer' : 'default',
                }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddFavorite;
