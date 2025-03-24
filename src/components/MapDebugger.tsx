'use client';

import { useState, useEffect } from 'react';

interface DebugInfo {
  googleMapsLoaded: boolean;
  apiKeyPresent: boolean;
  apiKeyLength: number;
  addressCount: number;
  errors: string[];
  logs: string[];
}

export default function MapDebugger() {
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    googleMapsLoaded: false,
    apiKeyPresent: false,
    apiKeyLength: 0,
    addressCount: 0,
    errors: [],
    logs: []
  });

  // Collect debug information
  useEffect(() => {
    const errors: string[] = [];
    const logs: string[] = [];
    
    // Check if Google Maps is loaded
    const googleMapsLoaded = !!(window as any).google?.maps;
    
    // Check API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const apiKeyPresent = !!apiKey;
    
    // Log information
    logs.push(`Google Maps loaded: ${googleMapsLoaded}`);
    logs.push(`API key present: ${apiKeyPresent}`);
    logs.push(`API key length: ${apiKey.length}`);
    
    if (!apiKeyPresent) {
      errors.push('Google Maps API key is missing');
    }
    
    if (!googleMapsLoaded) {
      errors.push('Google Maps failed to load');
    }
    
    setDebugInfo({
      googleMapsLoaded,
      apiKeyPresent,
      apiKeyLength: apiKey.length,
      addressCount: 0, // Will be updated by parent component
      errors,
      logs
    });
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleVisibility}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
        title="Debug Map Issues"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 w-80 bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Map Debug Info</h3>
          
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Google Maps Loaded:</span>
              <span className={debugInfo.googleMapsLoaded ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.googleMapsLoaded ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>API Key Present:</span>
              <span className={debugInfo.apiKeyPresent ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.apiKeyPresent ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>API Key Length:</span>
              <span>{debugInfo.apiKeyLength}</span>
            </div>
          </div>
          
          {debugInfo.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-red-600">Errors:</h4>
              <ul className="list-disc pl-5 text-sm text-red-600">
                {debugInfo.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="font-medium">Quick Fix Steps:</h4>
            <ol className="list-decimal pl-5 text-sm">
              <li>Check if your API key is in .env.local</li>
              <li>Enable Maps JavaScript API in Google Cloud Console</li>
              <li>Enable Geocoding API in Google Cloud Console</li>
              <li>Check browser console for errors</li>
              <li>Try refreshing the page</li>
            </ol>
          </div>
          
          <button
            onClick={toggleVisibility}
            className="mt-4 w-full py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
} 