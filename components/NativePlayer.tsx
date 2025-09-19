import React, { useState, useEffect } from 'react';

interface NativePlayerProps {
  src: string;
}

const NativePlayer: React.FC<NativePlayerProps> = ({ src }) => {
  const [error, setError] = useState<string | null>(null);

  // Reset error state when the source changes
  useEffect(() => {
    setError(null);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.target as HTMLVideoElement;
    const videoError = videoElement.error;
    
    // Log detailed error for debugging
    console.error("Video playback error:", {
        code: videoError?.code,
        message: videoError?.message,
        src: videoElement.currentSrc
    });

    let userMessage = "حدث خطأ غير معروف. يرجى المحاولة مرة أخرى أو اختيار سيرفر آخر.";
    switch (videoError?.code) {
        case 1: // MEDIA_ERR_ABORTED
            userMessage = "تم إيقاف تحميل الفيديو.";
            break;
        case 2: // MEDIA_ERR_NETWORK
            userMessage = "حدث خطأ في الشبكة أثناء تحميل الفيديو. يرجى التحقق من اتصالك بالإنترنت.";
            break;
        case 3: // MEDIA_ERR_DECODE
            userMessage = "لا يمكن تشغيل الفيديو بسبب مشكلة في التشفير أو تلف الملف.";
            break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            userMessage = "صيغة الفيديو غير مدعومة أو الرابط غير صحيح.";
            break;
    }

    // Set user-friendly error message
    setError(userMessage);
  };

  return (
    <div className="w-full h-full bg-black relative">
        <video
          src={src}
          controls
          autoPlay
          className="w-full h-full"
          style={{ objectFit: 'contain' }}
          onError={handleError}
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

export default NativePlayer;
