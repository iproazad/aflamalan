
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import type { Movie } from '../types';
import { useWatchLater } from '../hooks/useWatchLater';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';

const WatchLaterPage: React.FC = () => {
  const [watchLaterMovies, setWatchLaterMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { watchLater } = useWatchLater();

  useEffect(() => {
    const fetchWatchLaterMovies = async () => {
      // If there are no watch later IDs, don't make a DB call
      if (watchLater.length === 0) {
        setWatchLaterMovies([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Firestore's 'in' query is limited to 30 items per query.
        // We must batch the requests if the user has more than 30 items.
        const CHUNK_SIZE = 30;
        const watchLaterIdChunks: string[][] = [];
        for (let i = 0; i < watchLater.length; i += CHUNK_SIZE) {
          watchLaterIdChunks.push(watchLater.slice(i, i + CHUNK_SIZE));
        }

        const moviePromises = watchLaterIdChunks.map(chunk => 
          db.collection('movies')
            .where(window.firebase.firestore.FieldPath.documentId(), 'in', chunk)
            .get()
        );

        const querySnapshots = await Promise.all(moviePromises);
        
        const moviesData = querySnapshots.flatMap(snapshot => 
            snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie))
        );
        
        // Sort movies by creation date to show the newest ones first
        moviesData.sort((a, b) => {
            if (a.createdAt?.toMillis && b.createdAt?.toMillis) {
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            }
            return 0;
        });
        
        setWatchLaterMovies(moviesData);

      } catch (error) {
        console.error("Error fetching watch later movies: ", error);
        setWatchLaterMovies([]); // Clear movies on error
      } finally {
        setLoading(false);
      }
    };

    fetchWatchLaterMovies();
  }, [watchLater]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-black text-white mb-8 border-r-4 border-cyan-400 pr-4">
        قائمة المشاهدة لاحقاً
      </h1>
      {watchLaterMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {watchLaterMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-gray-800/50 rounded-lg mt-8">
            <p className="text-2xl text-gray-300 mb-4">قائمة المشاهدة لاحقاً فارغة.</p>
            <p className="text-gray-400 mb-6">أضف أفلامًا لمشاهدتها لاحقًا بالنقر على أيقونة الإشارة المرجعية.</p>
            <Link to="/" className="inline-block bg-cyan-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors">
                تصفح الأفلام
            </Link>
        </div>
      )}
    </div>
  );
};

export default WatchLaterPage;