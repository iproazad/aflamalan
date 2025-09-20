

import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import type { Movie } from '../types';
import HeroSlider from '../components/HeroSlider';
import YearFilter from '../components/YearFilter';
import SearchBar from '../components/SearchBar';
import GenreFilter from '../components/GenreFilter';
import MovieGrid from '../components/MovieGrid';
import { useRatings } from '../contexts/RatingsContext';
import SortFilter from '../components/SortFilter';
import LoadingSpinner from '../components/LoadingSpinner';

const MOVIES_PER_PAGE = 18;

const KurdishPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>('createdAt_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(MOVIES_PER_PAGE);
  const { getAverageRating } = useRatings();
  const loadMoreRef = useRef(null);


  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch only Kurdish movies directly from Firestore, then sort client-side to avoid index error.
        const moviesCollection = await db.collection('movies')
            .where('isKurdish', '==', true)
            .get();
        let moviesData = moviesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));

        // Sort movies by creation date to show the newest ones first
        moviesData.sort((a, b) => {
            const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return dateB - dateA;
        });

        setMovies(moviesData);
      } catch (error) {
        console.error("Error fetching movies: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);
  
  // Reset visible movies when filters change
  useEffect(() => {
    setVisibleCount(MOVIES_PER_PAGE);
  }, [searchQuery, selectedYear, selectedGenres, sortOrder]);


  const handleToggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
        prev.includes(genre) 
            ? prev.filter(g => g !== genre)
            : [...prev, genre]
    );
  };
  
  const handleClearGenres = () => {
    setSelectedGenres([]);
  };

  const availableYears = [...new Set(movies.map(movie => movie.year))].sort((a, b) => b - a);
  const availableGenres = [...new Set(movies.flatMap(movie => movie.genres || []))].sort();

  const sortedAndFilteredMovies = movies
    .filter(movie => selectedYear === 'all' || movie.year.toString() === selectedYear)
    .filter(movie => {
        if (selectedGenres.length === 0) {
            return true; // No genre filter applied
        }
        // Check if movie's genres include ALL selected genres
        return selectedGenres.every(genre => movie.genres?.includes(genre));
    })
    .filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'rating_desc') {
        const ratingA = getAverageRating(a.id).average;
        const ratingB = getAverageRating(b.id).average;
        return ratingB - ratingA;
      }
      if (sortOrder === 'rating_asc') {
        const ratingA = getAverageRating(a.id).average;
        const ratingB = getAverageRating(b.id).average;
        return ratingA - ratingB;
      }
      // For 'createdAt_desc', we explicitly sort by timestamp
      if (sortOrder === 'createdAt_desc') {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      }
      return 0; // Should not be reached with current sort options
    });

  const isFiltering = searchQuery !== '' || selectedYear !== 'all' || selectedGenres.length > 0 || sortOrder !== 'createdAt_desc';
  
  // Infinite scroll logic
  const visibleMovies = sortedAndFilteredMovies.slice(0, visibleCount);
  const hasMoreMovies = visibleCount < sortedAndFilteredMovies.length;
  
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
        entries => {
            if (entries[0].isIntersecting && hasMoreMovies) {
                 // A small delay can make the UX feel smoother
                setTimeout(() => {
                    setVisibleCount(prev => prev + MOVIES_PER_PAGE);
                }, 300);
            }
        },
        { rootMargin: "400px" } // trigger when 400px away from viewport
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
        observer.observe(currentRef);
    }

    return () => {
        if (currentRef) {
            observer.unobserve(currentRef);
        }
    };
  }, [loading, hasMoreMovies]);


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <HeroSlider movies={movies.slice(0, 5)} />
      
      <div className="my-8 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex flex-wrap justify-center items-center gap-4">
            <SortFilter
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />
            <GenreFilter
                genres={availableGenres}
                selectedGenres={selectedGenres}
                onToggleGenre={handleToggleGenre}
                onClearGenres={handleClearGenres}
            />
            <YearFilter
              years={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-r-4 border-cyan-400 pr-4">
          {isFiltering ? 'نتائج البحث' : 'الأفلام المدبلجة للكردية'}
        </h2>
        {!loading && sortedAndFilteredMovies.length > 0 ? (
          <>
            <MovieGrid movies={visibleMovies} />
            <div ref={loadMoreRef} className="h-16 flex justify-center items-center">
                {hasMoreMovies && (
                     <svg
                        className="animate-spin h-8 w-8 text-cyan-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                )}
            </div>
          </>
        ) : !loading && (
          <div className="text-center p-8 bg-gray-800 rounded-lg mt-8">
            <p className="text-xl text-gray-400">لا توجد أفلام مدبلجة للكردية تطابق معايير البحث.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default KurdishPage;
