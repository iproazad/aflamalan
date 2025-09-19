import React, { useEffect, useRef, useState } from 'react';

// Declare Hls on the window object for CDN usage
declare global {
  interface Window {
    Hls: any;
  }
}

interface HlsPlayerProps {
  src: string;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hls: any;
    const video = videoRef.current;
    if (!video) return;

    // Reset error state when the source changes
    setError(null);

    // Helper to attempt playing the video, with error handling for autoplay
    const playVideo = () => {
      video.play().catch(error => {
        console.warn("Autoplay was prevented by the browser.", error);
        // User will have to click the play button manually if autoplay fails.
      });
    };
    
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        debug: false
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed, attempting to play.');
        playVideo();
      });

      hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
        console.error('HLS.js error:', data);
        
        let userMessage = "تعذر تحميل الفيديو من هذا السيرفر. يرجى المحاولة مرة أخرى أو اختيار سيرفر آخر.";

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            userMessage = "حدث خطأ في الشبكة أثناء تحميل البث. يرجى التحقق من اتصالك بالإنترنت.";
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            userMessage = "حدث خطأ أثناء فك تشفير الفيديو. قد يكون البث تالفًا.";
        }
        setError(userMessage);

        if (data.fatal) {
          switch (data.type) {
            case window.Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error encountered, trying to recover...');
              hls.startLoad();
              break;
            case window.Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error encountered, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Unrecoverable HLS.js error, destroying instance.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        console.log('Native HLS metadata loaded, attempting to play.');
        playVideo();
      });
    }
    
    // Fallback for native video element errors
    const handleNativeError = () => {
        if(video.error) {
            console.error("Native video element error in HLS player:", video.error);
            let errorMessage = "حدث خطأ غير متوقع في مشغل الفيديو.";
            switch (video.error.code) {
                case 1: errorMessage = "تم إيقاف تحميل الفيديو."; break;
                case 2: errorMessage = "خطأ في الشبكة منع تشغيل الفيديو."; break;
                case 3: errorMessage = "لا يمكن تشغيل الفيديو بسبب مشكلة في التشفير."; break;
                case 4: errorMessage = "صيغة الفيديو غير مدعومة."; break;
            }
            setError(errorMessage);
        }
    };
    video.addEventListener('error', handleNativeError);


    // Cleanup function
    return () => {
      if (hls) {
        hls.destroy();
      }
      if (video) {
        video.removeEventListener('error', handleNativeError);
      }
    };
  }, [src]);

  return (
    <div className="w-full h-full bg-black relative">
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        style={{ objectFit: 'contain' }}
        autoPlay
      />
      {error && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold text-white mb-2">حدث خطأ</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      )}
    </div>
  );
};

export default HlsPlayer;
