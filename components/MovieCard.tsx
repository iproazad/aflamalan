import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useWatchLater } from '../hooks/useWatchLater';
import { useRatings } from '../contexts/RatingsContext';

const HeartIcon: React.FC<{ isFavorite: boolean }> = ({ isFavorite }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${isFavorite ? 'text-red-500' : 'text-white'}`}
    fill={isFavorite ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
    />
  </svg>
);

const BookmarkIcon: React.FC<{ isWatchLater: boolean }> = ({ isWatchLater }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300 ${isWatchLater ? 'text-cyan-400' : 'text-white'}`}
    fill={isWatchLater ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const StarIcon: React.FC = () => (
  <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const SpinnerIcon: React.FC = () => (
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
);


interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isWatchLater, toggleWatchLater } = useWatchLater();
  const { getAverageRating } = useRatings();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const { average, count } = getAverageRating(movie.id);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(movie.id);
  };
  
  const handleWatchLaterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchLater(movie.id);
  };

  return (
    <Link to={`/movie/${movie.id}`} className="block group relative rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-400/50">
      {currentUser && (
        <div className="absolute top-1.5 right-1.5 z-20 flex flex-col gap-1.5">
            <button
              onClick={handleFavoriteClick}
              className="p-1.5 bg-black/50 rounded-full hover:bg-black/75 transition-all duration-200 hover:scale-110"
              aria-label={isFavorite(movie.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <HeartIcon isFavorite={isFavorite(movie.id)} />
            </button>
            <button
              onClick={handleWatchLaterClick}
              className="p-1.5 bg-black/50 rounded-full hover:bg-black/75 transition-all duration-200 hover:scale-110"
              aria-label={isWatchLater(movie.id) ? 'إزالة من قائمة المشاهدة لاحقاً' : 'إضافة إلى قائمة المشاهدة لاحقاً'}
            >
              <BookmarkIcon isWatchLater={isWatchLater(movie.id)} />
            </button>
        </div>
      )}
      <div className="relative w-full aspect-[2/3] bg-gray-800">
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800" aria-label="Loading image...">
            <SpinnerIcon />
          </div>
        )}
        <img
          src={movie.posterUrl}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          alt={movie.title}
          className={`w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-75 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4">
        <h3 className="text-white text-sm sm:text-base font-bold truncate">{movie.title}</h3>
        <div className="flex justify-between items-center mt-1">
          <p className="text-gray-300 text-xs sm:text-sm">{movie.year}</p>
          {count > 0 && (
            <div className="flex items-center gap-1 text-xs sm:text-sm text-yellow-400 font-bold" title={`Average rating from ${count} user${count > 1 ? 's' : ''}`}>
              <StarIcon />
              <span>{average.toFixed(1)}</span>
              <span className="text-gray-400 text-xs ml-1 font-normal">({count})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
