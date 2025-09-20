import { useState, useEffect, useRef } from 'react';

export const useLazyImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    const currentRef = imageRef.current;

    if (currentRef && !imageSrc) {
      observer = new IntersectionObserver(
        ([entry]) => {
          // Start loading the image when it's intersecting the viewport
          if (entry.isIntersecting) {
            setImageSrc(src);
            // Stop observing once triggered
            observer.unobserve(entry.target);
          }
        },
        {
          // Load images 200px before they enter the viewport for a smoother experience
          rootMargin: '0px 0px 200px 0px', 
        }
      );
      observer.observe(currentRef);
    }

    return () => {
      // Cleanup observer on component unmount
      if (observer && currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [src, imageSrc]);

  // This handler is called by the img element's onLoad event
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return { imageRef, imageSrc, isLoaded, handleImageLoad };
};
