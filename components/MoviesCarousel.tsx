import React, { useState, useEffect, useRef } from 'react';
import type { Movie } from '../types';
import MovieCard from './MovieCard';

interface MoviesCarouselProps {
  title: string;
  movies: Movie[];
}

const MoviesCarousel: React.FC<MoviesCarouselProps> = ({ title, movies }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const currentRef = sectionRef.current;
    
    // Fallback for older browsers that don't support IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        setIsVisible(true);
        return;
    }

    if (currentRef) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(currentRef); // Stop observing after it becomes visible
          }
        },
        {
          rootMargin: '0px 0px -50px 0px', // Start animation a bit before it's fully on screen
          threshold: 0.1, // Trigger when at least 10% of the element is visible
        }
      );

      observer.observe(currentRef);
      
      return () => {
        if (currentRef) {
            observer.unobserve(currentRef);
        }
      };
    }
  }, []);

  if (movies.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`mb-12 transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <h2 className="text-3xl font-bold text-white mb-6 border-r-4 border-cyan-400 pr-4">{title}</h2>
      <div className="relative">
        <div className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {movies.map(movie => (
            <div key={movie.id} className="flex-shrink-0 w-48 md:w-56 lg:w-64">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoviesCarousel;
