import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function useRefreshScrollTrigger() {
  const { pathname } = useLocation();

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      Promise.all([
        document.fonts.ready,
        ...Array.from(document.images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => { img.onload = img.onerror = res; });
        }),
      ]).finally(() => ScrollTrigger.refresh(true)); // true = force
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);
}