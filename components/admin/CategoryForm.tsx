
import React, { useState, useEffect } from 'react';
import type { Category } from '../../types';

interface CategoryFormProps {
  onSubmit: (data: Omit<Category, 'id'>) => void;
  initialData?: Category | null;
  onCancel: () => void;
  isLoading?: boolean;
}

const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, initialData, onCancel, isLoading = false }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="اسم الفئة"
        required
        className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"
      />
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
        <button type="button" onClick={onCancel} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>إلغاء</button>
        <button 
            type="submit"
            className="flex items-center justify-center bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-cyan-800 disabled:cursor-not-allowed"
            disabled={isLoading}
        >
            {isLoading && <SpinnerIcon />}
            {isLoading ? (initialData ? 'جاري التحديث...' : 'جاري الإضافة...') : (initialData ? 'تحديث' : 'إضافة')}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
