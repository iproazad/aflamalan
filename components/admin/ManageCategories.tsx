import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import type { Category } from '../../types';
import CategoryForm from './CategoryForm';
import Pagination from '../Pagination';
import ConfirmationModal from './ConfirmationModal';

const ITEMS_PER_PAGE = 10;

const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    const unsubscribe = db.collection('categories').orderBy('name').onSnapshot(snapshot => {
      const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(categoriesData);
    });
    return () => unsubscribe();
  }, []);

  const handleAddCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      await db.collection('categories').add(categoryData);
      window.alert('تمت إضافة الفئة بنجاح!');
      setIsFormVisible(false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error adding category: ", error);
      window.alert('حدث خطأ أثناء إضافة الفئة.');
    }
  };

  const handleUpdateCategory = async (id: string, categoryData: Omit<Category, 'id'>) => {
    try {
      await db.collection('categories').doc(id).update(categoryData);
      window.alert('تم تحديث الفئة بنجاح!');
      setEditingCategory(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error updating category: ", error);
      window.alert('حدث خطأ أثناء تحديث الفئة.');
    }
  };
  
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await db.collection('categories').doc(categoryToDelete.id).delete();
        window.alert('تم حذف الفئة بنجاح!');
      } catch (error) {
        console.error("Error deleting category: ", error);
        window.alert('حدث خطأ أثناء حذف الفئة.');
      } finally {
        setIsConfirmModalOpen(false);
        setCategoryToDelete(null);
      }
    }
  };
  
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsFormVisible(true);
  };

  const handleAddNewClick = () => {
    setEditingCategory(null);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setIsFormVisible(false);
  }

  // Pagination Logic
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={confirmDeleteCategory}
        title="تأكيد الحذف"
        message={
            <>
                هل أنت متأكد أنك تريد حذف الفئة
                <strong className="text-white"> "{categoryToDelete?.name}"</strong>؟
                <br />
                <span className="text-yellow-400">لا يمكن التراجع عن هذا الإجراء.</span>
            </>
        }
      />

      {!isFormVisible && (
        <button onClick={handleAddNewClick} className="mb-6 bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors">
          إضافة فئة جديدة
        </button>
      )}

      {isFormVisible && (
        <CategoryForm
          onSubmit={editingCategory ? (data) => handleUpdateCategory(editingCategory.id, data) : handleAddCategory}
          initialData={editingCategory}
          onCancel={handleCancel}
        />
      )}

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">اسم الفئة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {categories.length > 0 ? (
                paginatedCategories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleEditClick(category)} className="text-cyan-400 hover:text-cyan-300 ml-4">تعديل</button>
                      <button onClick={() => handleDeleteClick(category)} className="text-red-500 hover:text-red-400">حذف</button>
                    </td>
                  </tr>
                ))
              ) : (
                  <tr>
                      <td colSpan={2} className="text-center py-8 text-gray-400">
                          لا توجد فئات حالياً.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
         {categories.length > ITEMS_PER_PAGE && (
          <div className="p-4 border-t border-gray-700">
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
