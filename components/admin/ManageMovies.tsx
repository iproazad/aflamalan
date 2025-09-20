
import React, { useState, useEffect } from 'react';
import { db, Timestamp } from '../../services/firebase';
import type { Movie } from '../../types';
import MovieForm from './MovieForm';
import Pagination from '../Pagination';
import ConfirmationModal from './ConfirmationModal';

const ITEMS_PER_PAGE = 10;
type MovieFilter = 'all' | 'kurdish' | 'non-kurdish';

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
      <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800" onClick={e => e.stopPropagation()}>
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
        <div className="p-4 flex justify-between items-center">
            <div className="h-10 bg-gray-700 rounded w-40"></div>
            <div className="h-8 bg-gray-700 rounded w-64"></div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-700">
                    <tr>
                        {[...Array(7)].map((_, i) => (
                            <th key={i} className="px-4 py-3"><div className="h-4 bg-gray-600 rounded"></div></th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-700">
                             <td className="px-4 py-2"><div className="h-20 w-14 bg-gray-600 rounded"></div></td>
                            {[...Array(6)].map((_, j) => (
                                <td key={j} className="px-4 py-2"><div className="h-4 bg-gray-600 rounded"></div></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const ManageMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<MovieFilter>('all');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = db.collection('movies').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
      const moviesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
      setMovies(moviesData);
      setLoading(false);
    }, error => {
        console.error("Error fetching movies: ", error);
        setNotification({ message: 'فشل في تحميل الأفلام.', type: 'error' });
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleAddMovie = async (movieData: Omit<Movie, 'id' | 'createdAt'>) => {
    setActionLoading(true);
    try {
      await db.collection('movies').add({
        ...movieData,
        createdAt: Timestamp.now(),
      });
      setIsFormOpen(false);
      setCurrentPage(1);
      showNotification('تمت إضافة الفيلم بنجاح.', 'success');
    } catch (error) {
      console.error("Error adding movie: ", error);
      showNotification('حدث خطأ أثناء إضافة الفيلم.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMovie = async (id: string, movieData: Omit<Movie, 'id' | 'createdAt'>) => {
    setActionLoading(true);
    try {
      await db.collection('movies').doc(id).update(movieData);
      setEditingMovie(null);
      setIsFormOpen(false);
      showNotification('تم تحديث الفيلم بنجاح.', 'success');
    } catch (error) {
      console.error("Error updating movie: ", error);
      showNotification('حدث خطأ أثناء تحديث الفيلم.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (movie: Movie) => {
    setMovieToDelete(movie);
    setIsConfirmModalOpen(true);
  };
  
  const confirmDeleteMovie = async () => {
    if (movieToDelete) {
      setActionLoading(true);
      try {
        await db.collection('movies').doc(movieToDelete.id).delete();
        showNotification('تم حذف الفيلم بنجاح.', 'success');
      } catch (error) {
        console.error("Error deleting movie: ", error);
        showNotification('حدث خطأ أثناء حذف الفيلم.', 'error');
      } finally {
        setIsConfirmModalOpen(false);
        setMovieToDelete(null);
        setActionLoading(false);
      }
    }
  };
  
  const handleEditClick = (movie: Movie) => {
    setEditingMovie(movie);
    setIsFormOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingMovie(null);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setEditingMovie(null);
    setIsFormOpen(false);
  }

  const filteredMovies = movies.filter(movie => {
    if (filter === 'kurdish') return movie.isKurdish === true;
    if (filter === 'non-kurdish') return !movie.isKurdish;
    return true;
  });

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const getFilterButtonClass = (buttonFilter: MovieFilter) => {
    return `px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-200 ${
      filter === buttonFilter ? 'bg-cyan-500 text-white' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
    }`;
  }

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div>
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteMovie}
        title="تأكيد الحذف"
        message={<>هل أنت متأكد أنك تريد حذف الفيلم <strong className="text-white">"{movieToDelete?.title}"</strong>؟ <br /> <span className="text-yellow-400">لا يمكن التراجع عن هذا الإجراء.</span></>}
        isLoading={actionLoading}
      />

      {isFormOpen && (
        <FormModal title={editingMovie ? 'تعديل الفيلم' : 'إضافة فيلم جديد'} onClose={handleCancelForm}>
            <MovieForm
              onSubmit={editingMovie ? (data) => handleUpdateMovie(editingMovie.id, data) : handleAddMovie}
              initialData={editingMovie}
              onCancel={handleCancelForm}
              isKurdishByDefault={filter === 'kurdish' && !editingMovie}
              isLoading={actionLoading}
            />
        </FormModal>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <button onClick={handleAddNewClick} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors w-full sm:w-auto">
            إضافة فيلم جديد
          </button>
          
          <div className="flex items-center gap-2 p-1 bg-gray-900/50 rounded-lg">
              <button onClick={() => setFilter('all')} className={getFilterButtonClass('all')}>الكل</button>
              <button onClick={() => setFilter('kurdish')} className={getFilterButtonClass('kurdish')}>كردي فقط</button>
              <button onClick={() => setFilter('non-kurdish')} className={getFilterButtonClass('non-kurdish')}>غير كردي</button>
          </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الصورة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">العنوان</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">السنة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الفئات</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">مدبلج كردي</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">تاريخ الإضافة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedMovies.map(movie => (
                <tr key={movie.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-2 whitespace-nowrap"><img src={movie.posterUrl} alt={movie.title} className="h-20 w-auto rounded object-cover" loading="lazy" /></td>
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-white align-middle">{movie.title}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-300 align-middle">{movie.year}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-300 align-middle">
                     <div className="flex flex-wrap gap-1 max-w-xs">
                        {movie.genres?.slice(0, 3).map(genre => <span key={genre} className="bg-gray-600 text-gray-200 px-2 py-1 text-xs rounded-full">{genre}</span>)}
                        {movie.genres?.length > 3 && <span className="bg-gray-600 text-gray-200 px-2 py-1 text-xs rounded-full">...</span>}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-300 align-middle">{movie.isKurdish ? 'نعم' : 'لا'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-300 align-middle">{movie.createdAt?.toDate ? movie.createdAt.toDate().toLocaleDateString('ar-EG') : 'غير متاح'}</td>
                  <td className="px-4 py-2 whitespace-nowrap font-medium align-middle">
                    <button onClick={() => handleEditClick(movie)} className="text-cyan-400 hover:text-cyan-300 ml-4">تعديل</button>
                    <button onClick={() => handleDeleteClick(movie)} className="text-red-500 hover:text-red-400">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMovies.length > ITEMS_PER_PAGE && (
          <div className="p-4 border-t border-gray-700">
             <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMovies;
