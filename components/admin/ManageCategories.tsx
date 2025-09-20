
import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import type { Category } from '../../types';
import CategoryForm from './CategoryForm';
import Pagination from '../Pagination';
import ConfirmationModal from './ConfirmationModal';

const ITEMS_PER_PAGE = 10;

// NOTE: In a real-world application, these shared UI components would be in their own files.
// They are included here to satisfy the project's file structure constraints.

const Notification: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const successClasses = "bg-green-600 border-green-500";
  const errorClasses = "bg-red-600 border-red-500";
  
  return (
    <div 
        className={`fixed top-24 right-5 z-[100] p-4 rounded-lg shadow-lg text-white border-l-4 animate-fade-in-down ${type === 'success' ? successClasses : errorClasses}`}
        role="alert"
    >
      <div className="flex items-center">
        <p className="font-bold">{message}</p>
        <button onClick={onClose} className="absolute top-1 right-2 text-2xl font-bold leading-none">&times;</button>
      </div>
    </div>
  );
};

const FormModal: React.FC<{ children: React.ReactNode; onClose: () => void; title: string }> = ({ children, onClose, title }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl transition-colors">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const TableSkeleton: React.FC = () => (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-8 animate-pulse">
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-700">
                    <tr>
                        <th className="px-6 py-3"><div className="h-4 bg-gray-600 rounded w-1/3"></div></th>
                        <th className="px-6 py-3"><div className="h-4 bg-gray-600 rounded w-1/4"></div></th>
                    </tr>
                </thead>
                <tbody>
                    {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-700">
                            <td className="px-6 py-4"><div className="h-4 bg-gray-600 rounded"></div></td>
                            <td className="px-6 py-4"><div className="h-4 bg-gray-600 rounded w-1/2"></div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = db.collection('categories').orderBy('name').onSnapshot(snapshot => {
      const categoriesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(categoriesData);
      setLoading(false);
    }, error => {
        console.error("Error fetching categories: ", error);
        showNotification('فشل في تحميل الفئات.', 'error');
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleAddCategory = async (categoryData: Omit<Category, 'id'>) => {
    setActionLoading(true);
    try {
      await db.collection('categories').add(categoryData);
      showNotification('تمت إضافة الفئة بنجاح!', 'success');
      setIsFormOpen(false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error adding category: ", error);
      showNotification('حدث خطأ أثناء إضافة الفئة.', 'error');
    } finally {
        setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (id: string, categoryData: Omit<Category, 'id'>) => {
    setActionLoading(true);
    try {
      await db.collection('categories').doc(id).update(categoryData);
      showNotification('تم تحديث الفئة بنجاح!', 'success');
      setEditingCategory(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error updating category: ", error);
      showNotification('حدث خطأ أثناء تحديث الفئة.', 'error');
    } finally {
        setActionLoading(false);
    }
  };
  
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      setActionLoading(true);
      try {
        await db.collection('categories').doc(categoryToDelete.id).delete();
        showNotification('تم حذف الفئة بنجاح!', 'success');
      } catch (error) {
        console.error("Error deleting category: ", error);
        showNotification('حدث خطأ أثناء حذف الفئة.', 'error');
      } finally {
        setIsConfirmModalOpen(false);
        setCategoryToDelete(null);
        setActionLoading(false);
      }
    }
  };
  
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setEditingCategory(null);
    setIsFormOpen(false);
  }

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const paginatedCategories = categories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  if (loading) {
    return (
        <div>
            <div className="h-10 bg-gray-700 rounded w-48 mb-6 animate-pulse"></div>
            <TableSkeleton />
        </div>
    );
  }

  return (
    <div>
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteCategory}
        title="تأكيد الحذف"
        message={<>هل أنت متأكد أنك تريد حذف الفئة <strong className="text-white">"{categoryToDelete?.name}"</strong>؟<br /><span className="text-yellow-400">لا يمكن التراجع عن هذا الإجراء.</span></>}
        isLoading={actionLoading}
      />

      {isFormOpen && (
        <FormModal title={editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'} onClose={handleCancelForm}>
            <CategoryForm
              onSubmit={editingCategory ? (data) => handleUpdateCategory(editingCategory.id, data) : handleAddCategory}
              initialData={editingCategory}
              onCancel={handleCancelForm}
              isLoading={actionLoading}
            />
        </FormModal>
      )}

      <button onClick={handleAddNewClick} className="mb-6 bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors">
        إضافة فئة جديدة
      </button>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
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
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
