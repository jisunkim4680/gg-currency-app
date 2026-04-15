import { useState, useCallback } from 'react';
import { Store } from '../types/store';
import {
  FavoriteFolder,
  FavoriteItem,
  FavoritesData,
  DEFAULT_FOLDER,
} from '../types/favorites';

const STORAGE_KEY = 'gg-currency-favorites';

function loadData(): FavoritesData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: FavoritesData = JSON.parse(raw);
      // Ensure default folder always exists
      if (!data.folders.some((f) => f.id === 'all')) {
        data.folders.unshift(DEFAULT_FOLDER);
      }
      return data;
    }
  } catch {
    // ignore parse errors
  }
  return { folders: [DEFAULT_FOLDER], items: [] };
}

function saveData(data: FavoritesData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useFavorites() {
  const [data, setData] = useState<FavoritesData>(loadData);

  const persist = useCallback((next: FavoritesData) => {
    setData(next);
    saveData(next);
  }, []);

  const addItem = useCallback(
    (store: Store, folderIds: string[]) => {
      setData((prev) => {
        // Skip if already exists
        if (prev.items.some((item) => item.franchiseNo === store.franchiseNo)) {
          return prev;
        }
        const allFolderIds = Array.from(new Set(['all', ...folderIds]));
        const newItem: FavoriteItem = {
          franchiseNo: store.franchiseNo,
          storeName: store.storeName,
          industryName: store.industryName,
          roadAddress: store.roadAddress,
          lat: store.lat,
          lng: store.lng,
          sigunName: store.sigunName,
          folderIds: allFolderIds,
          addedAt: Date.now(),
        };
        const next = { ...prev, items: [...prev.items, newItem] };
        saveData(next);
        return next;
      });
    },
    []
  );

  const removeItem = useCallback(
    (franchiseNo: string) => {
      setData((prev) => {
        const next = {
          ...prev,
          items: prev.items.filter((item) => item.franchiseNo !== franchiseNo),
        };
        saveData(next);
        return next;
      });
    },
    []
  );

  const isItemFavorite = useCallback(
    (franchiseNo: string): boolean => {
      return data.items.some((item) => item.franchiseNo === franchiseNo);
    },
    [data.items]
  );

  const getItemsInFolder = useCallback(
    (folderId: string): FavoriteItem[] => {
      return data.items.filter((item) => item.folderIds.includes(folderId));
    },
    [data.items]
  );

  const addFolder = useCallback(
    (name: string, emoji: string) => {
      setData((prev) => {
        const maxOrder = Math.max(...prev.folders.map((f) => f.order), 0);
        const newFolder: FavoriteFolder = {
          id: `folder_${Date.now()}`,
          name,
          emoji,
          isDefault: false,
          order: maxOrder + 1,
        };
        const next = { ...prev, folders: [...prev.folders, newFolder] };
        saveData(next);
        return next;
      });
    },
    []
  );

  const updateFolder = useCallback(
    (id: string, name: string, emoji: string) => {
      setData((prev) => {
        const next = {
          ...prev,
          folders: prev.folders.map((f) =>
            f.id === id ? { ...f, name, emoji } : f
          ),
        };
        saveData(next);
        return next;
      });
    },
    []
  );

  const deleteFolder = useCallback(
    (id: string) => {
      setData((prev) => {
        const folder = prev.folders.find((f) => f.id === id);
        if (!folder || folder.isDefault) return prev;

        const next = {
          folders: prev.folders.filter((f) => f.id !== id),
          items: prev.items.map((item) => ({
            ...item,
            folderIds: item.folderIds.filter((fid) => fid !== id),
          })),
        };
        saveData(next);
        return next;
      });
    },
    []
  );

  const reorderFolders = useCallback(
    (folderIds: string[]) => {
      setData((prev) => {
        const next = {
          ...prev,
          folders: folderIds
            .map((id, index) => {
              const folder = prev.folders.find((f) => f.id === id);
              return folder ? { ...folder, order: index } : null;
            })
            .filter((f): f is FavoriteFolder => f !== null),
        };
        saveData(next);
        return next;
      });
    },
    []
  );

  return {
    folders: data.folders,
    items: data.items,
    addItem,
    removeItem,
    isItemFavorite,
    getItemsInFolder,
    addFolder,
    updateFolder,
    deleteFolder,
    reorderFolders,
  };
}
