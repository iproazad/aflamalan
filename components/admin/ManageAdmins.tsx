import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import type { Admin } from '../../types';
import Pagination from '../Pagination';
import ConfirmationModal from './ConfirmationModal';

const SUPER_ADMIN_UID = "yO8pzykKincc5zgbdJGdN6xISr03";
const ITEMS_PER_PAGE = 10;

const ManageAdmins: React.FC = () => {
  const { currentUser } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'confirm' | 'final'>('confirm');

  // Delete Confirmation Modal State
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);

  const isSuperAdmin = currentUser?.uid === SUPER_ADMIN_UID;

  useEffect(() => {
    // Only fetch admins if the user is a super admin
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    const unsubscribe = db.collection('admins').onSnapshot(snapshot => {
      const adminsData = snapshot.docs.map(doc => ({ id: doc.id, uid: doc.data().uid, email: doc.data().email } as Admin));
      setAdmins(adminsData);
      setLoading(false);
    }, err => {
      console.error(err);
      setError('فشل في تحميل قائمة المشرفين.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isSuperAdmin]);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newAdminUid.trim() || !newAdminEmail.trim()) {
      setError('الرجاء إدخال UID وبريد إلكتروني صالحين.');
      return;
    }
    setModalStep('confirm');
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteConfirmModalOpen(true);
  };

  const confirmDeleteAdmin = async () => {
    if (adminToDelete) {
        try {
            await db.collection('admins').doc(adminToDelete.id).delete();
            window.alert(`تم حذف المشرف ${adminToDelete.email} بنجاح.`);
        } catch (err) {
            console.error(err);
            window.alert('حدث خطأ أثناء حذف المشرف.');
        } finally {
            setIsDeleteConfirmModalOpen(false);
            setAdminToDelete(null);
        }
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewAdminUid('');
    setNewAdminEmail('');
    setError('');
  };
  
  if (!isSuperAdmin) {
    return (
        <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">إدارة المشرفين</h2>
            <p className="text-yellow-300">هذه الصفحة متاحة فقط للمشرف الأساسي.</p>
        </div>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(admins.length / ITEMS_PER_PAGE);
  const paginatedAdmins = admins.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
      if (page > 0 && page <= totalPages) {
          setCurrentPage(page);
      }
  };

  const AddAdminModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg text-center border border-gray-700">
            {modalStep === 'confirm' ? (
                <>
                    <h3 className="text-2xl font-bold mb-4 text-white">تأكيد الإضافة</h3>
                    <p className="text-gray-300 mb-6">
                        إضافة مشرف جديد يتطلب تكوينًا من جانب الخادم (مثل Firebase Cloud Functions) لتعيين الأدوار والصلاحيات بشكل آمن. هذا الإجراء في لوحة التحكم هو لأغراض العرض التوضيحي حاليًا.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={handleCloseAddModal} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors">
                            إلغاء
                        </button>
                        <button onClick={() => setModalStep('final')} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors">
                            متابعة
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <h3 className="text-2xl font-bold mb-4 text-white">إشعار</h3>
                    <p className="text-gray-300 mb-6">
                        دور المشرف لم يتم تنفيذه بعد من جانب الخادم. يرجى الاتصال بالدعم الفني لتفعيل الصلاحيات.
                    </p>
                    <button onClick={handleCloseAddModal} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors">
                        إغلاق
                    </button>
                </>
            )}
        </div>
    </div>
  );

  return (
    <>
      {isAddModalOpen && <AddAdminModal />}
      <ConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => {
          setIsDeleteConfirmModalOpen(false);
          setAdminToDelete(null);
        }}
        onConfirm={confirmDeleteAdmin}
        title="تأكيد حذف المشرف"
        message={
            <>
                هل أنت متأكد أنك تريد حذف المشرف
                <strong className="text-white"> "{adminToDelete?.email}"</strong>؟
                <br />
                <span className="text-yellow-400">سيؤدي هذا إلى إزالة صلاحيات المشرف الخاصة به.</span>
            </>
        }
      />
      <div className="space-y-8">
        <div className="bg-gray-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">إضافة مشرف جديد</h2>
            <form onSubmit={handleAddAdmin} className="flex flex-col gap-4">
                <p className="text-sm text-gray-400">
                لإضافة مشرف جديد، يجب عليك الحصول على **معرّف المستخدم (UID)** الخاص به من لوحة تحكم Firebase Authentication.
                </p>
                <input
                type="text"
                value={newAdminUid}
                onChange={(e) => setNewAdminUid(e.target.value)}
                placeholder="معرّف المستخدم (UID)"
                required
                className="flex-grow bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"
                />
                <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="البريد الإلكتروني للمشرف"
                required
                className="flex-grow bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"
                />
                <button
                type="submit"
                className="bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-600 transition-colors"
                >
                إضافة مشرف
                </button>
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </form>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">المشرفون الحاليون</h2>
           <div className="flex items-center justify-between bg-gray-900 p-3 rounded-md mb-4">
                <span className="text-white font-bold">{currentUser.email} (المشرف الأساسي)</span>
                <button
                    disabled
                    className="bg-gray-600 text-white px-3 py-1 rounded-md cursor-not-allowed"
                >
                    لا يمكن حذفه
                </button>
            </div>
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
             <div className="divide-y divide-gray-700">
                {loading ? <div className="p-4 text-center text-gray-400">جاري تحميل المشرفين...</div> : paginatedAdmins.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-4 hover:bg-gray-700/50">
                    <span className="text-white">{admin.email}</span>
                    <button
                    onClick={() => handleDeleteClick(admin)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
                    >
                    حذف
                    </button>
                </div>
                ))}
             </div>
              {admins.length > ITEMS_PER_PAGE && (
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
      </div>
    </>
  );
};

export default ManageAdmins;
