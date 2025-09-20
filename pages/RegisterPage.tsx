import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/firebase';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    try {
      await auth.createUserWithEmailAndPassword(email, password);
      // After successful registration, Firebase automatically logs the user in.
      // The AuthContext will handle the new user state, so we can just redirect.
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل بالفعل.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.');
      } else {
        setError('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
        console.error("Registration Error:", err);
      }
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-white">
            إنشاء حساب جديد
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm rounded-t-md"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm rounded-b-md"
                placeholder="تأكيد كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800"
            >
              إنشاء حساب
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-400">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
                سجل الدخول
            </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
