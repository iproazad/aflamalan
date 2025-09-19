
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const getFavoritesFromStorage = (userId: string): string[] => {
  try {
    const item = window.localStorage.getItem(`favorites_${userId}`);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Error reading favorites from localStorage", error);
    return [];
  }
};

const setFavoritesInStorage = (userId: string, favorites: string[]) => {
  try {
    window.localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
  } catch (error) {
    console.error("Error writing favorites to localStorage", error);
  }
};

export const useFavorites = () => {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser) {
      setFavorites(getFavoritesFromStorage(currentUser.uid));
    } else {
      setFavorites([]); // Clear favorites if user logs out
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setFavoritesInStorage(currentUser.uid, favorites);
    }
  }, [favorites, currentUser]);

  const toggleFavorite = useCallback((movieId: string) => {
    if (!currentUser) return;

    setFavorites(prevFavorites => {
      const isCurrentlyFavorite = prevFavorites.includes(movieId);
      if (isCurrentlyFavorite) {
        return prevFavorites.filter(id => id !== movieId);
      } else {
        return [...prevFavorites, movieId];
      }
    });
  }, [currentUser]);

  const isFavorite = useCallback((movieId: string) => {
    return favorites.includes(movieId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
};
