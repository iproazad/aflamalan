
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';

const FilmReelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <FilmReelIcon />
          <h1 className="text-3xl font-bold text-white tracking-wider">افلام</h1>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6 text-lg">
            <Link to="/" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">الرئيسية</Link>
            {currentUser && (
              <Link to="/favorites" className="text-gray-300 hover:text-cyan-400 transition-colors duration-300">المفضلة</Link>
            )}
          </nav>
          <div className="w-px h-6 bg-gray-600"></div>
          {currentUser ? (
            <div className="flex items-center gap-4">
              {currentUser.isAdmin && (
                <Link to="/admin" className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-colors duration-300">
                  لوحة التحكم
                </Link>
              )}
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300">
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
                <Link to="/register" className="text-white px-4 py-2 rounded-md hover:bg-white/10 transition-colors duration-300">
                    إنشاء حساب
                </Link>
                <Link to="/login" className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-colors duration-300">
                    تسجيل الدخول
                </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;