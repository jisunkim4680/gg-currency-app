import { useState, useCallback } from 'react';

const STORAGE_KEY = 'gg-currency-recent-searches';
const MAX_ITEMS = 10;

function loadSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function saveSearches(items: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useRecentSearches() {
  const [items, setItems] = useState<string[]>(loadSearches);

  const add = useCallback((query: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item !== query);
      const next = [query, ...filtered].slice(0, MAX_ITEMS);
      saveSearches(next);
      return next;
    });
  }, []);

  const remove = useCallback((query: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item !== query);
      saveSearches(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    saveSearches([]);
  }, []);

  return { items, add, remove, clear };
}
