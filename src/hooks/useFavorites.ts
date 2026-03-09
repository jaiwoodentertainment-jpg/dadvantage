import { useState, useEffect } from 'react';

export type Favorite = {
  id: string;
  type: 'quote' | 'tip' | 'idea';
  text: string;
  title?: string;
  category?: string;
  savedAt: string;
};

const STORAGE_KEY = 'dadvantage_favorites';

function load(): Favorite[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorited = (id: string) => favorites.some(f => f.id === id);

  const toggleFavorite = (item: Omit<Favorite, 'savedAt'>) => {
    setFavorites(prev =>
      prev.some(f => f.id === item.id)
        ? prev.filter(f => f.id !== item.id)
        : [{ ...item, savedAt: new Date().toISOString() }, ...prev]
    );
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  return { favorites, isFavorited, toggleFavorite, removeFavorite };
}
