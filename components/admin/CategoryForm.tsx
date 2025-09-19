
import React, { useState, useEffect } from 'react';
import type { Category } from '../../types';

interface CategoryFormProps {
  onSubmit: (data: Omit<Category, 'id'>) => void;
  initialData?: Category | null;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, initialData, onCancel }) => {
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
    <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg space-y-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{initialData ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</h2>
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="اسم الفئة"
        required
        className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"
      />
      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors">إلغاء</button>
        <button type="submit" className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors">{initialData ? 'تحديث' : 'إضافة'}</button>
      </div>
    </form>
  );
};

export default CategoryForm;
