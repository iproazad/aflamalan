
import React from 'react';

interface YearFilterProps {
  years: number[];
  selectedYear: string;
  onYearChange: (year: string) => void;
}

const YearFilter: React.FC<YearFilterProps> = ({ years, selectedYear, onYearChange }) => {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <label htmlFor="year-filter" className="font-bold text-sm md:text-md text-white flex-shrink-0">
        سنة الإنتاج:
      </label>
      <select
        id="year-filter"
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        className="bg-gray-700 text-white py-2 px-3 text-sm rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none cursor-pointer"
        aria-label="Filter movies by year"
      >
        <option value="all">كل السنوات</option>
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default YearFilter;
