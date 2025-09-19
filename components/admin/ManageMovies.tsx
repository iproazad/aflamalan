import React, { useState, useEffect } from 'react';
import { db, Timestamp } from '../../services/firebase';
import type { Movie } from '../../types';
import MovieForm from './MovieForm';
import Pagination from '../Pagination';
import ConfirmationModal from './ConfirmationModal';

const ITEMS_PER_PAGE = 10;

const ManageMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // State for confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);

  useEffect(() => {
    const unsubscribe = db.collection('movies').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
      const moviesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
      setMovies(moviesData);
    });
    return () => unsubscribe();
  }, []);

  const handleAddMovie = async (movieData: Omit<Movie, 'id' | 'createdAt'>) => {
    try {
      await db.collection('movies').add({
        ...movieData,
        createdAt: Timestamp.now(),
      });
      setIsFormVisible(false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error adding movie: ", error);
    }
  };

  const handleUpdateMovie = async (id: string, movieData: Omit<Movie, 'id' | 'createdAt'>) => {
    try {
      await db.collection('movies').doc(id).update(movieData);
      setEditingMovie(null);
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error updating movie: ", error);
    }
  };

  const handleDeleteClick = (movie: Movie) => {
    setMovieToDelete(movie);
    setIsConfirmModalOpen(true);
  };
  
  const confirmDeleteMovie = async () => {
    if (movieToDelete) {
      try {
        await db.collection('movies').doc(movieToDelete.id).delete();
      } catch (error) {
        console.error("Error deleting movie: ", error);
        window.alert('حدث خطأ أثناء حذف الفيلم.');
      } finally {
        setIsConfirmModalOpen(false);
        setMovieToDelete(null);
      }
    }
  };
  
  const handleEditClick = (movie: Movie) => {
    setEditingMovie(movie);
    setIsFormVisible(true);
  };

  const handleAddNewClick = () => {
    setEditingMovie(null);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setEditingMovie(null);
    setIsFormVisible(false);
  }

  // Pagination Logic
  const totalPages = Math.ceil(movies.length / ITEMS_PER_PAGE);
  const paginatedMovies = movies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


  return (
    <div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setMovieToDelete(null);
        }}
        onConfirm={confirmDeleteMovie}
        title="تأكيد الحذف"
        message={
            <>
                هل أنت متأكد أنك تريد حذف الفيلم
                <strong className="text-white"> "{movieToDelete?.title}"</strong>؟
                <br />
                <span className="text-yellow-400">لا يمكن التراجع عن هذا الإجراء.</span>
            </>
        }
      />

      {!isFormVisible && (
        <button onClick={handleAddNewClick} className="mb-6 bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors">
          إضافة فيلم جديد
        </button>
      )}

      {isFormVisible && (
        <MovieForm
          onSubmit={editingMovie ? (data) => handleUpdateMovie(editingMovie.id, data) : handleAddMovie}
          initialData={editingMovie}
          onCancel={handleCancel}
        />
      )}

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الصورة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">العنوان</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">السنة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">الفئات</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">تاريخ الإضافة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedMovies.map(movie => (
                <tr key={movie.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <img src={movie.posterUrl} alt={movie.title} className="h-20 w-auto rounded object-cover" loading="lazy" />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-white align-middle">{movie.title}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-300 align-middle">{movie.year}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-300 align-middle">
                     <div className="flex flex-wrap gap-1 max-w-xs">
                        {movie.genres?.slice(0, 3).map(genre => (
                            <span key={genre} className="bg-gray-600 text-gray-200 px-2 py-1 text-xs rounded-full">
                                {genre}
                            </span>
                        ))}
                        {movie.genres?.length > 3 && (
                             <span className="bg-gray-600 text-gray-200 px-2 py-1 text-xs rounded-full">
                                ...
                            </span>
                        )}
                    </div>
                  </td>
                   <td className="px-4 py-2 whitespace-nowrap text-gray-300 align-middle">
                    {movie.createdAt?.toDate ? movie.createdAt.toDate().toLocaleDateString('ar-EG') : 'غير متاح'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap font-medium align-middle">
                    <button onClick={() => handleEditClick(movie)} className="text-cyan-400 hover:text-cyan-300 ml-4">تعديل</button>
                    <button onClick={() => handleDeleteClick(movie)} className="text-red-500 hover:text-red-400">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {movies.length > ITEMS_PER_PAGE && (
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
  );
};

export default ManageMovies;
