
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db, Timestamp } from '../services/firebase'; // Import Firestore instance and Timestamp

// Type definitions
interface Ratings {
  [movieId: string]: {
    [userId: string]: number;
  };
}

interface RatingsContextType {
  addRating: (movieId: string, rating: number) => void;
  getAverageRating: (movieId: string) => { average: number; count: number };
  getUserRating: (movieId: string) => number;
}

// Context creation with default values
const RatingsContext = createContext<RatingsContextType>({
  addRating: () => {},
  getAverageRating: () => ({ average: 0, count: 0 }),
  getUserRating: () => 0,
});

// Custom hook for easy context consumption
export function useRatings() {
  return useContext(RatingsContext);
}

// Provider component
interface RatingsProviderProps {
  children: ReactNode;
}

export function RatingsProvider({ children }: RatingsProviderProps) {
  const { currentUser } = useAuth();
  const [ratings, setRatings] = useState<Ratings>({});

  // Use a real-time listener to keep ratings data in sync
  useEffect(() => {
    const unsubscribe = db.collection('ratings').onSnapshot(
      snapshot => {
        const allRatingsData = snapshot.docs.map(doc => doc.data());
        
        // Transform the flat array from Firestore into the nested structure the app uses
        const ratingsStructure = allRatingsData.reduce((acc, ratingDoc) => {
          const { movieId, userId, rating } = ratingDoc;
          if (movieId && userId && typeof rating === 'number') {
            if (!acc[movieId]) {
              acc[movieId] = {};
            }
            acc[movieId][userId] = rating;
          }
          return acc;
        }, {} as Ratings);

        setRatings(ratingsStructure);
      },
      error => {
        console.error("Failed to listen for ratings updates from Firestore", error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  const addRating = useCallback(async (movieId: string, rating: number) => {
    if (!currentUser) {
        console.warn("User must be logged in to rate a movie.");
        window.alert("يجب تسجيل الدخول أولاً لتقييم الفيلم.");
        return;
    }
    
    // Optimistically update the UI state for a responsive feel
    setRatings(prevRatings => {
      const movieRatings = prevRatings[movieId] || {};
      const updatedMovieRatings = { ...movieRatings, [currentUser.uid]: rating };
      return { ...prevRatings, [movieId]: updatedMovieRatings };
    });

    // Write the rating to Firestore
    try {
      // Use a composite key to ensure each user can only rate a movie once
      const ratingDocRef = db.collection('ratings').doc(`${movieId}_${currentUser.uid}`);
      await ratingDocRef.set({
        movieId,
        userId: currentUser.uid,
        rating,
        updatedAt: Timestamp.now(),
      }, { merge: true }); // Use merge to be safe, in case we add more fields later
    } catch (error) {
      console.error("Failed to save rating to Firestore", error);
      window.alert("حدث خطأ أثناء حفظ تقييمك. الرجاء المحاولة مرة أخرى.");
      // The real-time listener will eventually correct the state if the write fails,
      // but reverting optimistically is complex. For now, an alert is sufficient.
    }
  }, [currentUser]);

  const getAverageRating = useCallback((movieId: string) => {
    const movieRatings = ratings[movieId];
    if (!movieRatings) return { average: 0, count: 0 };

    const allRatings = Object.values(movieRatings);
    const count = allRatings.length;
    if (count === 0) return { average: 0, count: 0 };
    
    const sum = allRatings.reduce((acc, r) => acc + r, 0);
    const average = sum / count;
    return { average, count };
  }, [ratings]);

  const getUserRating = useCallback((movieId: string) => {
    if (!currentUser) return 0;

    const movieRatings = ratings[movieId];
    if (!movieRatings) return 0;
    
    return movieRatings[currentUser.uid] || 0;
  }, [currentUser, ratings]);
  
  const value = { addRating, getAverageRating, getUserRating };
  
  return (
    <RatingsContext.Provider value={value}>
      {children}
    </RatingsContext.Provider>
  );
}
