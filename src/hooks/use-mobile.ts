import { useEffect, useState } from 'react';

const DEFAULT_QUERY = '(max-width: 768px)';

export function useIsMobile(query: string = DEFAULT_QUERY): boolean {
  const getMatches = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [isMobile, setIsMobile] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', listener);

    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return isMobile;
}
