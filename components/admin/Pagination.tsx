import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-600 text-white rounded-md disabled:bg-gray-700 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
      >
        السابق
      </button>
      <span className="text-gray-300">
        صفحة {currentPage} من {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-600 text-white rounded-md disabled:bg-gray-700 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
      >
        التالي
      </button>
    </div>
  );
};

export default Pagination;
