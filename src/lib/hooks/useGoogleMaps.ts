'use client';

import { useState, useEffect } from 'react';

interface UseGoogleMapsOptions {
  apiKey: string;
  libraries?: string[];
  version?: string;
}

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
}

// This custom hook manages loading the Google Maps script and provides loading status
export function useGoogleMaps({
  apiKey,
  libraries = ['places'],
  version = 'weekly'
}: UseGoogleMapsOptions): UseGoogleMapsReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip if already loaded or if there was an error
    if (isLoaded || loadError || (window as any).google?.maps) {
      if ((window as any).google?.maps && !isLoaded) {
        setIsLoaded(true);
      }
      return;
    }

    // Track whether the component is still mounted
    let isMounted = true;

    const loadScript = () => {
      const id = 'google-maps-script';
      
      // Don't load the script if it's already in the DOM
      if (document.getElementById(id)) {
        return;
      }
      
      const librariesParam = libraries.join(',');
      const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${librariesParam}&v=${version}&callback=initGoogleMaps`;
      
      // Set up the callback that the Google Maps script will call when loaded
      (window as any).initGoogleMaps = () => {
        if (isMounted) {
          console.log('Google Maps initialized through callback');
          setIsLoaded(true);
          delete (window as any).initGoogleMaps;
        }
      };
      
      // Create the script element
      const script = document.createElement('script');
      script.id = id;
      script.src = url;
      script.async = true;
      script.defer = true;
      script.onerror = (error) => {
        if (isMounted) {
          console.error('Error loading Google Maps script:', error);
          setLoadError(new Error('Failed to load Google Maps'));
        }
      };
      
      // Add the script to the DOM
      document.head.appendChild(script);
    };
    
    loadScript();
    
    // Clean up on unmount
    return () => {
      isMounted = false;
    };
  }, [apiKey, libraries, version, isLoaded, loadError]);

  return { isLoaded, loadError };
}

export default useGoogleMaps; 