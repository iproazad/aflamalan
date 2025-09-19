import React from 'react';

interface GenreFilterProps {
  genres: string[];
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
}

const GenreFilter: React.FC<GenreFilterProps> = ({ genres, selectedGenre, onGenreChange }) => {
  return (
    <div className="flex items-center gap-3">
      <label htmlFor="genre-filter" className="font-bold text-md text-white flex-shrink-0">
        الفئة:
      </label>
      <select
        id="genre-filter"
        value={selectedGenre}
        onChange={(e) => onGenreChange(e.target.value)}
        className="bg-gray-700 text-white p-2 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none cursor-pointer"
        aria-label="Filter movies by genre"
      >
        <option value="all">كل الفئات</option>
        {genres.map(genre => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GenreFilter;
