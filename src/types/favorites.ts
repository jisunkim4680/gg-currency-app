export interface FavoriteFolder {
  id: string;
  name: string;
  emoji: string;
  isDefault: boolean;
  order: number;
}

export interface FavoriteItem {
  franchiseNo: string;
  storeName: string;
  industryName: string;
  roadAddress: string;
  lat: number;
  lng: number;
  sigunName: string;
  folderIds: string[];
  addedAt: number;
}

export interface FavoritesData {
  folders: FavoriteFolder[];
  items: FavoriteItem[];
}

export const DEFAULT_FOLDER: FavoriteFolder = {
  id: 'all',
  name: '전체',
  emoji: '📁',
  isDefault: true,
  order: 0,
};

export const EMOJI_OPTIONS = {
  음식: ['🍽️', '☕', '🍜', '🥘', '🍰', '🍺'],
  장소: ['🏠', '🏢', '🏫', '🏥', '🛒', '💈'],
  활동: ['💪', '📚', '🎮', '✂️', '🎵', '⭐'],
};
