
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    // This should ideally be handled by a protected route, but as a fallback:
    return <p>Please log in to view your profile.</p>;
  }

  const handlePasswordReset = async () => {
    if (!currentUser.email) {
      setError("No email address associated with this account.");
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await auth.sendPasswordResetEmail(currentUser.email);
      setMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك.');
    } catch (err: any) {
      setError('فشل في إرسال البريد الإلكتروني لإعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.');
      console.error("Password Reset Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-black text-white mb-8 border-r-4 border-cyan-400 pr-4">
        الملف الشخصي
      </h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-400">البريد الإلكتروني</h2>
          <p className="text-xl text-white">{currentUser.email}</p>
        </div>
        <div className="border-t border-gray-700 pt-6">
          <h2 className="text-lg font-bold text-gray-400 mb-2">تغيير كلمة المرور</h2>
          <p className="text-gray-300 mb-4">
            سنرسل لك بريدًا إلكترونيًا يحتوي على رابط لإعادة تعيين كلمة المرور الخاصة بك.
          </p>
          <button
            onClick={handlePasswordReset}
            disabled={loading}
            className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-cyan-800 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال بريد إلكتروني لإعادة التعيين'}
          </button>
          {message && <p className="mt-4 text-green-400">{message}</p>}
          {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
