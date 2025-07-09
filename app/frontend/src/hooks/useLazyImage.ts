import { useState, useRef, useEffect } from 'react';

interface UseLazyImageOptions {
  src: string;
  alt: string;
  threshold?: number;
  rootMargin?: string;
}

export function useLazyImage({ src, alt, threshold = 0.1, rootMargin = '50px' }: UseLazyImageOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(img);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(img);

    return () => {
      observer.unobserve(img);
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!isInView) return;

    const img = imgRef.current;
    if (!img) return;

    const handleLoad = () => {
      setIsLoaded(true);
      setError(null);
    };

    const handleError = () => {
      setError('Failed to load image');
      setIsLoaded(false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Set the src to trigger loading
    img.src = src;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src, isInView]);

  return {
    imgRef,
    isLoaded,
    isInView,
    error,
    src: isInView ? src : undefined,
  };
} 