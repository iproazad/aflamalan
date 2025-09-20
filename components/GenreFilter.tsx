
import React, { useState, useRef, useEffect } from 'react';

interface GenreFilterProps {
  genres: string[];
  selectedGenres: string[];
  onToggleGenre: (genre: string) => void;
  onClearGenres: () => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ genres, selectedGenres, onToggleGenre, onClearGenres }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const buttonText = selectedGenres.length > 0 ? `الفئات (${selectedGenres.length})` : 'كل الفئات';

  const handleClear = () => {
    onClearGenres();
    // Keep dropdown open for new selections
    // setIsOpen(false); 
  };
  
  return (
    <div className="flex items-center gap-2 md:gap-3">
        <label className="font-bold text-sm md:text-md text-white flex-shrink-0">
            الفئة:
        </label>
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-700 text-white py-2 px-3 text-sm rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none cursor-pointer min-w-32 text-right flex justify-between items-center"
                aria-haspopup="true"
                aria-expanded={isOpen}
                type="button"
            >
                <span>{buttonText}</span>
                <svg className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 animate-fade-in-up-fast">
                    <div className="p-2 border-b border-gray-700">
                        <button 
                            onClick={handleClear} 
                            disabled={selectedGenres.length === 0}
                            className="w-full text-center text-sm text-white bg-red-600/80 hover:bg-red-600/100 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md px-3 py-1.5 transition-colors"
                        >
                            مسح الكل
                        </button>
                    </div>
                    <ul className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        {genres.map(genre => (
                            <li key={genre}>
                                <label className="flex items-center gap-3 p-2 rounded-md hover:bg-cyan-500/10 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedGenres.includes(genre)}
                                        onChange={() => onToggleGenre(genre)}
                                        className="h-4 w-4 text-cyan-500 bg-gray-900 border-gray-600 rounded focus:ring-cyan-600 focus:ring-offset-gray-800 cursor-pointer"
                                    />
                                    <span className="text-white select-none">{genre}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
  );
};

export default GenreFilter;
