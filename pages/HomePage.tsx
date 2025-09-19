import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import type { Movie } from '../types';
import HeroSlider from '../components/HeroSlider';
import MoviesCarousel from '../components/MoviesCarousel';
import YearFilter from '../components/YearFilter';
import SearchBar from '../components/SearchBar';
import GenreFilter from '../components/GenreFilter';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import MovieGrid from '../components/MovieGrid';
import { useRatings } from '../contexts/RatingsContext';
import SortFilter from '../components/SortFilter';
import Pagination from '../components/Pagination';

const MOVIES_PER_PAGE = 18;

const TestAdminModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (uid: string, email: string) => void; }> = ({ isOpen, onClose, onSubmit }) => {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const uid = formData.get('uid') as string;
        const email = formData.get('email') as string;
        onSubmit(uid, email);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-6 text-white">إضافة مشرف تجريبي</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input
                            name="uid"
                            type="text"
                            required
                            placeholder="معرّف المستخدم (UID)"
                            className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"
                        />
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="البريد الإلكتروني"
                            className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"
                        />
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors">
                            إلغاء
                        </button>
                        <button type="submit" className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors">
                            إضافة
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('createdAt_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const { favorites } = useFavorites();
  const { getAverageRating } = useRatings();


  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // The initial sort order from Firebase is by creation date
        const moviesCollection = await db.collection('movies').orderBy('createdAt', 'desc').get();
        const moviesData = moviesCollection.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
        setMovies(moviesData);
      } catch (error) {
        console.error("Error fetching movies: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);
  
  // Reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedYear, selectedGenre, sortOrder]);


  const favoriteMovies = movies.filter(movie => favorites.includes(movie.id));
  const availableYears = [...new Set(movies.map(movie => movie.year))].sort((a, b) => b - a);
  const availableGenres = [...new Set(movies.flatMap(movie => movie.genres || []))].sort();

  const sortedAndFilteredMovies = movies
    .filter(movie => selectedYear === 'all' || movie.year.toString() === selectedYear)
    .filter(movie => selectedGenre === 'all' || (movie.genres && movie.genres.includes(selectedGenre)))
    .filter(movie => movie.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'rating_desc') {
        const ratingA = getAverageRating(a.id).average;
        const ratingB = getAverageRating(b.id).average;
        return ratingB - ratingA;
      }
      if (sortOrder === 'rating_asc') {
        const ratingA = getAverageRating(a.id).average;
        const ratingB = getAverageRating(b.id).average;
        return ratingA - ratingB;
      }
      // For 'createdAt_desc', we explicitly sort by timestamp
      if (sortOrder === 'createdAt_desc') {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      }
      return 0; // Should not be reached with current sort options
    });

  const isFiltering = searchQuery !== '' || selectedYear !== 'all' || selectedGenre !== 'all' || sortOrder !== 'createdAt_desc';
  
  // Pagination logic
  const totalPages = Math.ceil(sortedAndFilteredMovies.length / MOVIES_PER_PAGE);
  const paginatedMovies = sortedAndFilteredMovies.slice(
      (currentPage - 1) * MOVIES_PER_PAGE,
      currentPage * MOVIES_PER_PAGE
  );

  const handleAddTestAdmin = async (uid: string, email: string) => {
    if (uid.trim() === '' || email.trim() === '') {
        window.alert("UID والبريد الإلكتروني لا يمكن أن يكونا فارغين.");
        return;
    }
    try {
        await db.collection('admins').doc(uid).set({ uid, email });
        window.alert(`تمت إضافة المشرف ${email} بنجاح!`);
        setIsModalOpen(false);
    } catch (error) {
        console.error("Error adding test admin:", error);
        window.alert("فشل في إضافة المشرف. انظر إلى وحدة التحكم لمزيد من التفاصيل.");
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div>
      <HeroSlider movies={movies.slice(0, 5)} />
      
      <div className="my-8 flex flex-col md:flex-row justify-between items-center gap-4 p-4 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex flex-wrap justify-center items-center gap-4">
            <SortFilter
              sortOrder={sortOrder}
              onSortChange={setSortOrder}
            />
            <GenreFilter
                genres={availableGenres}
                selectedGenre={selectedGenre}
                onGenreChange={setSelectedGenre}
            />
            <YearFilter
              years={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
        </div>
      </div>

      {currentUser && favoriteMovies.length > 0 && (
        <MoviesCarousel title="المفضلة" movies={favoriteMovies} />
      )}

      <section className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6 border-r-4 border-cyan-400 pr-4">
          {isFiltering ? 'نتائج البحث' : 'جميع الأفلام'}
        </h2>
        {!loading && sortedAndFilteredMovies.length > 0 ? (
          <>
            <MovieGrid movies={paginatedMovies} />
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : !loading && (
          <div className="text-center p-8 bg-gray-800 rounded-lg mt-8">
            <p className="text-xl text-gray-400">لا توجد أفلام تطابق معايير البحث.</p>
          </div>
        )}
      </section>
      
      {/* Test Button */}
      <div className="text-center my-12 p-6 bg-gray-800 border border-gray-700 rounded-lg">
        <h3 className="text-xl font-bold mb-2">لأغراض الاختبار</h3>
        <p className="text-gray-400 mb-4">استخدم هذا الزر لإضافة مشرف جديد بسرعة إلى قاعدة البيانات لاختبار الصلاحيات.</p>
        <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
        >
            إضافة مشرف تجريبي
        </button>
      </div>

      <TestAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTestAdmin}
      />
    </div>
  );
};

export default HomePage;
