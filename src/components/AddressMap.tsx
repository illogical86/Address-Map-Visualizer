'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { AddressData } from '@/lib/geocodeService';
import useGoogleMaps from '@/lib/hooks/useGoogleMaps';

// Use the environment variable for the API key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Show warning if API key is not set
if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API Key is not set. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.');
}

interface AddressMapProps {
  addresses: AddressData[];
  filters: {
    category?: string;
    searchTerm?: string;
  };
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
};

// Default center (New York City)
const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

export default function AddressMap({ addresses, filters }: AddressMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<AddressData | null>(null);
  const [filteredAddresses, setFilteredAddresses] = useState<AddressData[]>(addresses);
  const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Use our custom hook to load Google Maps
  const { isLoaded, loadError } = useGoogleMaps({
    apiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Debug output to console
  useEffect(() => {
    console.log('Addresses received:', addresses.length);
    console.log('API Key length:', GOOGLE_MAPS_API_KEY.length);
    console.log('First few addresses:', addresses.slice(0, 2));
    console.log('Google Maps loaded:', isLoaded);
  }, [addresses, isLoaded]);

  // Filter addresses when filters or addresses change
  useEffect(() => {
    if (!addresses.length) return;
    
    let filtered = [...addresses];
    
    // Apply search filter if provided
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(addr => 
        addr.address.toLowerCase().includes(searchLower) || 
        Object.values(addr.originalData).some(
          val => typeof val === 'string' && val.toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Apply category filter if provided
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(addr => 
        addr.originalData[filters.category!] !== undefined
      );
    }
    
    console.log('Filtered addresses:', filtered.length);
    setFilteredAddresses(filtered);
  }, [addresses, filters]);

  // Set initial map center when addresses load
  useEffect(() => {
    if (filteredAddresses.length > 0) {
      try {
        // Calculate the center as the average of all coordinates
        const centerLat = filteredAddresses.reduce((sum, addr) => sum + addr.latitude, 0) / filteredAddresses.length;
        const centerLng = filteredAddresses.reduce((sum, addr) => sum + addr.longitude, 0) / filteredAddresses.length;
        
        console.log('Setting map center to:', { lat: centerLat, lng: centerLng });
        
        setCenter({
          lat: centerLat,
          lng: centerLng
        });
      } catch (error) {
        console.error('Error setting map center:', error);
        // Fallback to default center
        setCenter(defaultCenter);
      }
    } else {
      setCenter(defaultCenter);
    }
  }, [filteredAddresses]);

  // Initialize the map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !center) return;

    try {
      console.log('Initializing Google Map');
      
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });
      
      mapRef.current = map;
      
      // Add markers
      const markers: google.maps.Marker[] = [];
      const bounds = new google.maps.LatLngBounds();
      
      filteredAddresses.forEach((address) => {
        const position = { lat: address.latitude, lng: address.longitude };
        bounds.extend(position);
        
        const marker = new google.maps.Marker({
          position,
          map,
          animation: google.maps.Animation.DROP,
          title: address.address,
        });
        
        // Add click handler for info window
        marker.addListener('click', () => {
          setSelectedMarker(address);
        });
        
        markers.push(marker);
      });
      
      // Fit bounds if we have markers
      if (filteredAddresses.length > 0) {
        map.fitBounds(bounds);
        
        // If there's only one marker, zoom out a bit
        if (filteredAddresses.length === 1) {
          map.setZoom(14);
        }
      }
      
      // Clean up markers on unmount
      return () => {
        markers.forEach(marker => marker.setMap(null));
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [isLoaded, center, filteredAddresses]);

  // Handle info window close
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // Create info window when marker is selected
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !selectedMarker) return;
    
    try {
      const position = { lat: selectedMarker.latitude, lng: selectedMarker.longitude };
      
      // Create content for the info window
      const contentString = `
        <div class="p-3">
          <h3 class="text-lg font-semibold mb-2">${selectedMarker.address}</h3>
          <div class="text-sm space-y-1">
            ${Object.entries(selectedMarker.originalData)
              .map(([key, value]) => `
                <div class="grid grid-cols-2 gap-2">
                  <span class="font-medium text-gray-700">${key}:</span>
                  <span>${String(value)}</span>
                </div>
              `)
              .join('')}
          </div>
          <div class="mt-4">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.latitude},${selectedMarker.longitude}"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Get Directions
            </a>
          </div>
        </div>
      `;
      
      const infoWindow = new google.maps.InfoWindow({
        content: contentString,
        position,
      });
      
      // Close event listener
      google.maps.event.addListenerOnce(infoWindow, 'closeclick', handleInfoWindowClose);
      
      infoWindow.open(mapRef.current);
      
      // Clean up
      return () => {
        infoWindow.close();
      };
    } catch (error) {
      console.error('Error creating info window:', error);
    }
  }, [selectedMarker, isLoaded, handleInfoWindowClose]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 border border-red-300 rounded-lg p-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load Google Maps</h3>
          <p className="text-sm text-red-600">{loadError.message}</p>
          <p className="text-sm text-gray-500 mt-4">
            Please check your API key and make sure the Google Maps JavaScript API is enabled.
          </p>
        </div>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-center p-8">
          <p className="text-lg text-gray-500">No addresses to display</p>
          <p className="text-sm text-gray-400 mt-2">Upload a spreadsheet with address data to get started</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainerRef}
        id="map-container"
        className="w-full h-full rounded-lg"
        style={mapContainerStyle}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      )}
    </div>
  );
} 