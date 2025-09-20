
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RatingsProvider } from './contexts/RatingsContext';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import FavoritesPage from './pages/FavoritesPage';
import UserProtectedRoute from './components/UserProtectedRoute';
import ProfilePage from './pages/ProfilePage';
import KurdishPage from './pages/KurdishPage';
import WatchLaterPage from './pages/WatchLaterPage';
import ScrollToTopButton from './components/ScrollToTopButton';

function App() {
  return (
    <AuthProvider>
      <RatingsProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/kurdish" element={<KurdishPage />} />
                <Route path="/movie/:id" element={<MovieDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/favorites" 
                  element={
                    <UserProtectedRoute>
                      <FavoritesPage />
                    </UserProtectedRoute>
                  } 
                />
                <Route 
                  path="/watch-later" 
                  element={
                    <UserProtectedRoute>
                      <WatchLaterPage />
                    </UserProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <UserProtectedRoute>
                      <ProfilePage />
                    </UserProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
            <ScrollToTopButton />
          </div>
        </HashRouter>
      </RatingsProvider>
    </AuthProvider>
  );
}

export default App;
