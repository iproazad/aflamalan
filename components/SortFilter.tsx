
import React from 'react';

interface SortFilterProps {
  sortOrder: string;
  onSortChange: (order: string) => void;
}

const SortFilter: React.FC<SortFilterProps> = ({ sortOrder, onSortChange }) => {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <label htmlFor="sort-filter" className="font-bold text-sm md:text-md text-white flex-shrink-0">
        ترتيب حسب:
      </label>
      <select
        id="sort-filter"
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-gray-700 text-white py-2 px-3 text-sm rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none cursor-pointer"
        aria-label="Sort movies"
      >
        <option value="createdAt_desc">الأحدث</option>
        <option value="rating_desc">الأعلى تقييماً</option>
        <option value="rating_asc">الأقل تقييماً</option>
      </select>
    </div>
  );
};

export default SortFilter;
