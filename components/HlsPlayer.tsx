import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    let hls: any;
    const video = videoRef.current;
    if (!video) return;

    const playVideo = () => {
      video.play().catch(error => {
        console.warn("Autoplay was prevented by the browser.", error);
        // User will have to click the play button manually if autoplay fails.
      });
    };

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
        console.error('HLS.js error:', data);
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      
      const canPlayHandler = () => {
        playVideo();
      };
      video.addEventListener('canplay', canPlayHandler);
      
      // Cleanup event listener
      return () => {
        video.removeEventListener('canplay', canPlayHandler);
      };
    }

    // Cleanup function for HLS.js instance
    return () => {
      if (hls) {
        hls.destroy();
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
        playsInline // For better mobile browser compatibility
      />
    </div>
  );
};

export default HlsPlayer;
