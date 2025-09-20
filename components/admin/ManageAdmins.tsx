
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import type { Admin } from '../../types';
import Pagination from '../Pagination';
import ConfirmationModal from './ConfirmationModal';

const SUPER_ADMIN_UID = "yO8pzykKincc5zgbdJGdN6xISr03";
const ITEMS_PER_PAGE = 10;

// NOTE: In a real-world application, these shared UI components would be in their own files.
// They are included here to satisfy the project's file structure constraints.

const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

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
        <div className="p-4 bg-gray-700"><div className="h-6 bg-gray-600 rounded w-1/3"></div></div>
        <div className="divide-y divide-gray-700">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                    <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-600 rounded w-20"></div>
                </div>
            ))}
        </div>
    </div>
);

const ManageAdmins: React.FC = () => {
  const { currentUser } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isSuperAdmin = currentUser?.uid === SUPER_ADMIN_UID;

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = db.collection('admins').onSnapshot(snapshot => {
      const adminsData = snapshot.docs.map(doc => ({ id: doc.id, uid: doc.data().uid, email: doc.data().email } as Admin));
      setAdmins(adminsData);
      setLoading(false);
    }, err => {
      console.error(err);
      showNotification('فشل في تحميل قائمة المشرفين.', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isSuperAdmin]);
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newAdminUid.trim() || !newAdminEmail.trim()) {
      setFormError('الرجاء إدخال UID وبريد إلكتروني صالحين.');
      return;
    }
    
    setActionLoading(true);
    try {
        await db.collection('admins').doc(newAdminUid).set({ uid: newAdminUid, email: newAdminEmail });
        showNotification(`تمت إضافة المشرف ${newAdminEmail} بنجاح.`, 'success');
        setIsAddModalOpen(false);
        setNewAdminUid('');
        setNewAdminEmail('');
    } catch (err) {
        console.error("Error adding admin:", err);
        showNotification('فشل في إضافة المشرف.', 'error');
    } finally {
        setActionLoading(false);
    }
  };

  const handleDeleteClick = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeleteAdmin = async () => {
    if (adminToDelete) {
        setActionLoading(true);
        try {
            await db.collection('admins').doc(adminToDelete.id).delete();
            showNotification(`تم حذف المشرف ${adminToDelete.email} بنجاح.`, 'success');
        } catch (err) {
            console.error(err);
            showNotification('حدث خطأ أثناء حذف المشرف.', 'error');
        } finally {
            setIsDeleteConfirmModalOpen(false);
            setAdminToDelete(null);
            setActionLoading(false);
        }
    }
  };

  if (!isSuperAdmin) {
    return (
        <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">إدارة المشرفين</h2>
            <p className="text-yellow-300">هذه الصفحة متاحة فقط للمشرف الأساسي.</p>
        </div>
    );
  }

  const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);
  const paginatedAdmins = admins.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      <ConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={confirmDeleteAdmin}
        title="تأكيد حذف المشرف"
        message={<>هل أنت متأكد أنك تريد حذف المشرف <strong className="text-white">"{adminToDelete?.email}"</strong>؟<br /><span className="text-yellow-400">سيؤدي هذا إلى إزالة صلاحيات المشرف الخاصة به.</span></>}
        isLoading={actionLoading}
      />
      
      {isAddModalOpen && (
        <FormModal title="إضافة مشرف جديد" onClose={() => setIsAddModalOpen(false)}>
            <form onSubmit={handleAddAdmin} className="flex flex-col gap-4">
                <p className="text-sm text-gray-400">
                لإضافة مشرف جديد، يجب عليك الحصول على **معرّف المستخدم (UID)** الخاص به من لوحة تحكم Firebase Authentication.
                </p>
                <input type="text" value={newAdminUid} onChange={(e) => setNewAdminUid(e.target.value)} placeholder="معرّف المستخدم (UID)" required className="flex-grow bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none" />
                <input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="البريد الإلكتروني للمشرف" required className="flex-grow bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none" />
                {formError && <p className="text-red-500 text-center text-sm">{formError}</p>}
                 <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={actionLoading}>إلغاء</button>
                    <button type="submit" className="flex items-center justify-center bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-cyan-800 disabled:cursor-not-allowed" disabled={actionLoading}>
                        {actionLoading && <SpinnerIcon />}
                        {actionLoading ? 'جاري الإضافة...' : 'إضافة مشرف'}
                    </button>
                </div>
            </form>
        </FormModal>
      )}

      <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">المشرفون الحاليون</h2>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors">
              إضافة مشرف جديد
            </button>
        </div>

        {loading ? <TableSkeleton /> : (
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gray-900 flex items-center justify-between">
                    <span className="text-white font-bold">{currentUser.email} (المشرف الأساسي)</span>
                    <span className="text-sm text-gray-500">لا يمكن حذفه</span>
                </div>
                <div className="divide-y divide-gray-700">
                    {paginatedAdmins.map(admin => (
                    <div key={admin.id} className="flex items-center justify-between p-4 hover:bg-gray-700/50">
                        <span className="text-white">{admin.email}</span>
                        <button onClick={() => handleDeleteClick(admin)} className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors">حذف</button>
                    </div>
                    ))}
                </div>
                {admins.length > ITEMS_PER_PAGE && (
                    <div className="p-4 border-t border-gray-700">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                )}
            </div>
        )}
      </div>
    </>
  );
};

export default ManageAdmins;
