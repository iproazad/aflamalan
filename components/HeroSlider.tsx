
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Movie } from '../types';

interface HeroSliderProps {
  movies: Movie[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [movies.length]);

  if (movies.length === 0) {
    return (
      <div className="w-full h-[60vh] bg-gray-800 flex items-center justify-center rounded-lg mb-12">
        <p className="text-2xl">جاري تحميل الأفلام...</p>
      </div>
    );
  }

  const activeMovie = movies[currentIndex];

  return (
    <div className="relative w-full h-[60vh] rounded-lg overflow-hidden mb-12 shadow-2xl">
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center p-6 md:p-12 lg:p-16">
        <div className="w-full md:w-2/3 lg:w-1/2">
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-white leading-tight mb-4 animate-fade-in-down">{activeMovie.title}</h2>
          <p className="text-gray-200 text-sm sm:text-base md:text-lg mb-6 line-clamp-3 animate-fade-in-up">{activeMovie.description}</p>
          <Link
            to={`/movie/${activeMovie.id}`}
            className="inline-block bg-cyan-500 text-white font-bold text-base px-4 py-2 md:text-xl md:px-8 md:py-3 rounded-lg hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            شاهد الآن
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${currentIndex === index ? 'bg-cyan-400' : 'bg-gray-500'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
