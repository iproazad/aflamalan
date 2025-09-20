
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';

const FilmReelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const Header = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const NavLinks: React.FC<{isMobile?: boolean}> = ({ isMobile = false }) => {
    const commonClasses = "text-gray-300 hover:text-cyan-400 transition-colors duration-300";
    const mobileClasses = "block py-2 text-center text-lg";
    
    return (
        <nav className={isMobile ? "flex flex-col items-center gap-4" : "flex items-center gap-6 text-lg"}>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className={`${commonClasses} ${isMobile ? mobileClasses : ''}`}>الرئيسية</Link>
            <Link to="/kurdish" onClick={() => setIsMenuOpen(false)} className={`${commonClasses} ${isMobile ? mobileClasses : ''}`}>كردي</Link>
            {currentUser && (
              <>
                <Link to="/favorites" onClick={() => setIsMenuOpen(false)} className={`${commonClasses} ${isMobile ? mobileClasses : ''}`}>المفضلة</Link>
                <Link to="/watch-later" onClick={() => setIsMenuOpen(false)} className={`${commonClasses} ${isMobile ? mobileClasses : ''}`}>المشاهدة لاحقاً</Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className={`${commonClasses} ${isMobile ? mobileClasses : ''}`}>الملف الشخصي</Link>
              </>
            )}
        </nav>
    );
  };
  
  const AuthButtons: React.FC<{isMobile?: boolean}> = ({ isMobile = false }) => {
    return (
        <>
            {currentUser ? (
                <div className={`flex items-center gap-4 ${isMobile ? 'flex-col w-full' : ''}`}>
                  {currentUser.isAdmin && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={`bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-colors duration-300 ${isMobile ? 'w-full text-center' : ''}`}>
                      لوحة التحكم
                    </Link>
                  )}
                  <button onClick={handleLogout} className={`bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300 ${isMobile ? 'w-full text-center' : ''}`}>
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className={`flex items-center gap-4 ${isMobile ? 'flex-col w-full' : ''}`}>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className={`text-white px-4 py-2 rounded-md hover:bg-white/10 transition-colors duration-300 ${isMobile ? 'w-full text-center bg-gray-700' : ''}`}>
                        إنشاء حساب
                    </Link>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className={`bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-colors duration-300 ${isMobile ? 'w-full text-center' : ''}`}>
                        تسجيل الدخول
                    </Link>
                </div>
              )}
        </>
    );
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
          <FilmReelIcon />
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">افلام</h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
          <div className="w-px h-6 bg-gray-600"></div>
          <AuthButtons />
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-white p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500" 
              aria-label="Open main menu"
              aria-expanded={isMenuOpen}
            >
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
        </div>
      </div>
      
      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800/80 backdrop-blur-md absolute w-full left-0 animate-fade-in-down">
            <div className="px-4 pt-2 pb-4 space-y-4">
                <NavLinks isMobile={true} />
                <div className="border-t border-gray-700 my-4"></div>
                <AuthButtons isMobile={true} />
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;