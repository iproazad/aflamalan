
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const getWatchLaterFromStorage = (userId: string): string[] => {
  try {
    const item = window.localStorage.getItem(`watchLater_${userId}`);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Error reading watch later from localStorage", error);
    return [];
  }
};

const setWatchLaterInStorage = (userId: string, watchLater: string[]) => {
  try {
    window.localStorage.setItem(`watchLater_${userId}`, JSON.stringify(watchLater));
  } catch (error) {
    console.error("Error writing watch later to localStorage", error);
  }
};

export const useWatchLater = () => {
  const { currentUser } = useAuth();
  const [watchLater, setWatchLater] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser) {
      setWatchLater(getWatchLaterFromStorage(currentUser.uid));
    } else {
      setWatchLater([]); // Clear watch later list if user logs out
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      setWatchLaterInStorage(currentUser.uid, watchLater);
    }
  }, [watchLater, currentUser]);

  const toggleWatchLater = useCallback((movieId: string) => {
    if (!currentUser) return;

    setWatchLater(prevWatchLater => {
      const isCurrentlyInList = prevWatchLater.includes(movieId);
      if (isCurrentlyInList) {
        return prevWatchLater.filter(id => id !== movieId);
      } else {
        return [...prevWatchLater, movieId];
      }
    });
  }, [currentUser]);

  const isWatchLater = useCallback((movieId: string) => {
    return watchLater.includes(movieId);
  }, [watchLater]);

  return { watchLater, toggleWatchLater, isWatchLater };
};