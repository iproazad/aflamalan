import React, { useEffect, useCallback } from 'react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
}

const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  let videoId: string | null = null;

  // Regular expression to find the YouTube video ID in various URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    videoId = match[2];
  } else {
     // Fallback for URLs that might not match the regex but are valid embed links
    if (url.includes('/embed/')) {
        const urlParts = url.split('/embed/');
        if (urlParts.length > 1) {
            videoId = urlParts[1].split(/[?&]/)[0];
        }
    }
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }
  
  // If not a YouTube URL, assume it's a direct embeddable link.
  return url;
};


const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, trailerUrl }) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleKeyDown]);


  if (!isOpen) return null;

  const embedUrl = getYouTubeEmbedUrl(trailerUrl);
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-modal-title"
    >
      <div
        className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl aspect-video relative transform transition-all duration-300 scale-95 animate-zoom-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-20 bg-white rounded-full p-1 text-gray-800 hover:bg-gray-200 transition-colors"
          aria-label="Close trailer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white text-lg">رابط المقطع الدعائي غير صالح.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrailerModal;
