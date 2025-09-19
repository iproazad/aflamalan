
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/firebase';
import type { Movie } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { useRatings } from '../contexts/RatingsContext';
import StarRating from '../components/StarRating';
import HlsPlayer from '../components/HlsPlayer';
import NativePlayer from '../components/NativePlayer';
import TrailerModal from '../components/TrailerModal';

type PlayerInfo = {
  type: 'HLS' | 'NATIVE' | 'IFRAME';
  src: string;
};

/**
 * Determines the correct player type and source URL based on the video link.
 * @param url The video server URL.
 * @returns An object with the player type and the source URL.
 */
const getPlayerInfo = (url: string): PlayerInfo => {
  // HLS streams
  if (url.includes('.m3u8') || url.includes('.m3u')) {
    return { type: 'HLS', src: url };
  }
  
  // Direct video files
  if (/\.(mp4|webm|ogg)$/i.test(url)) {
    return { type: 'NATIVE', src: url };
  }
  
  // Special handling for files.fm embeddable galleries
  if (url.includes('files.fm/u/')) {
    try {
      const embedUrl = `${url.split('?')[0]}?iframe`;
      return { type: 'IFRAME', src: embedUrl };
    } catch (e) {
      console.error("Could not parse files.fm URL, falling back to default iframe:", url, e);
      return { type: 'IFRAME', src: url };
    }
  }

  // Special handling for videa.hu links
  if (url.includes('videa.hu/letoltes/')) {
    try {
      // Extracts the ID from URLs like https://videa.hu/letoltes/wvx7xjs2Z1TMmWWO
      const videoId = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
      const embedUrl = `https://videa.hu/player?v=${videoId}`;
      return { type: 'IFRAME', src: embedUrl };
    } catch (e) {
      console.error("Could not parse videa.hu URL, falling back to default iframe:", url, e);
      return { type: 'IFRAME', src: url };
    }
  }

  // Default to a generic iframe for all other links
  return { type: 'IFRAME', src: url };
};


const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRating, getAverageRating, getUserRating } = useRatings();


  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      try {
        const doc = await db.collection('movies').doc(id).get();
        if (doc.exists) {
          const movieData = { id: doc.id, ...doc.data() } as Movie;
          setMovie(movieData);
          if (movieData.servers && movieData.servers.length > 0) {
            setSelectedServer(movieData.servers[0].url);
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching movie: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleToggleFavorite = () => {
    if (movie) {
      toggleFavorite(movie.id);
    }
  };
  
  const { average, count } = movie ? getAverageRating(movie.id) : { average: 0, count: 0 };
  const userRating = movie ? getUserRating(movie.id) : 0;

  const renderPlayer = () => {
    if (!selectedServer) {
        return (
            <div className="w-full h-full bg-black flex items-center justify-center">
                <p className="text-gray-400">الرجاء اختيار سيرفر للمشاهدة.</p>
            </div>
        );
    }

    const { type, src } = getPlayerInfo(selectedServer);

    switch (type) {
        case 'HLS':
            return <HlsPlayer src={src} />;
        case 'NATIVE':
            return <NativePlayer src={src} />;
        case 'IFRAME':
            return (
                <iframe
                    src={src}
                    title="Movie Player"
                    frameBorder="0"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    sandbox="allow-scripts allow-same-origin allow-fullscreen"
                ></iframe>
            );
        default:
            // This case should not be reachable with the current implementation
            return <p>نوع مشغل الفيديو غير مدعوم.</p>;
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-2xl">جاري التحميل...</div>;
  }

  if (!movie) {
    return <div className="text-center mt-20 text-2xl">لم يتم العثور على الفيلم.</div>;
  }
  
  return (
    <div className="animate-fade-in">
      {/* Backdrop */}
      <div className="relative h-[50vh] -mx-4 -mt-8 mb-8">
        <img src={movie.backdropUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Poster */}
        <div className="md:col-span-1 -mt-32 z-10">
          <img src={movie.posterUrl} alt={movie.title} className="rounded-lg shadow-2xl w-full" />
        </div>

        {/* Details */}
        <div className="md:col-span-2">
          <h1 className="text-5xl font-black mb-4">{movie.title}</h1>
          <div className="flex items-center space-x-4 mb-2 text-gray-400">
            <span>{movie.year}</span>
            <span>&bull;</span>
            <div className="flex flex-wrap gap-2">
              {movie.genres.map(genre => (
                <span key={genre} className="bg-gray-700 px-2 py-1 text-xs rounded">{genre}</span>
              ))}
            </div>
          </div>
          
          {/* Average Rating */}
          <div className="flex items-center gap-4 mb-6">
            <StarRating rating={average} size="md" disabled={true} />
            {count > 0 ? (
                <p className="text-gray-400">
                    <span className="font-bold text-white">{average.toFixed(1)}</span>/5 
                    <span className="mx-2">|</span> 
                    {count} {count === 1 ? 'تقييم' : 'تقييمات'}
                </p>
            ) : (
                <p className="text-gray-400">لا توجد تقييمات بعد.</p>
            )}
          </div>
          
          <p className="text-lg leading-relaxed text-gray-300 mb-8">{movie.description}</p>
          
          {/* User Interaction Section */}
          <div className="flex flex-wrap gap-4 mb-8">
              {currentUser && (
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors duration-300 font-bold ${
                    isFavorite(movie.id)
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite(movie.id) ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                  <span>
                    {isFavorite(movie.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                  </span>
                </button>
              )}
               {movie.trailerUrl && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-yellow-500 text-white font-bold hover:bg-yellow-600 transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>مشاهدة المقطع الدعائي</span>
                </button>
              )}
               {movie.downloadUrl && (
                  <a
                    href={movie.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors duration-300"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    <span>تحميل الفيلم</span>
                  </a>
                )}
          </div>
          
          {/* User Rating Box */}
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg mb-8">
            <h3 className="text-lg font-bold text-white mb-3">
              {currentUser ? (userRating > 0 ? 'تقييمك' : 'قيّم هذا الفيلم') : 'تقييم الفيلم'}
            </h3>
            {currentUser ? (
               <StarRating 
                  rating={userRating} 
                  onRate={(rating) => addRating(movie.id, rating)}
                  size="lg"
               />
            ) : (
                <div className="text-center py-2">
                    <p className="text-gray-400 mb-3">يجب تسجيل الدخول لتقييم الفيلم.</p>
                    <Link to="/login" className="bg-cyan-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors">
                        تسجيل الدخول
                    </Link>
                </div>
            )}
          </div>
          
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 shadow-lg">
              {renderPlayer()}
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl font-bold mb-4">سيرفرات المشاهدة</h3>
            <div className="flex flex-wrap gap-2">
              {movie.servers?.map((server, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedServer(server.url)}
                  className={`px-4 py-2 rounded-md transition-colors duration-200 ${selectedServer === server.url ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {server.name} ({server.quality})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
       {movie.trailerUrl && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={movie.trailerUrl}
        />
      )}
    </div>
  );
};

export default MovieDetailsPage;