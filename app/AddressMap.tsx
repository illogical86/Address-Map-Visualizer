'use client';

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Address {
  id: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  category?: string;
}

interface AddressMapProps {
  addresses: Address[];
}

export default function AddressMap({ addresses }: AddressMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places']
      });

      try {
        const google = await loader.load();
        const geocoder = new google.maps.Geocoder();

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        });

        mapInstanceRef.current = map;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Geocode and add markers for each address
        for (const address of addresses) {
          if (!address.latitude || !address.longitude) {
            try {
              const result = await geocoder.geocode({ address: address.address });
              if (result.results[0]) {
                const location = result.results[0].geometry.location;
                address.latitude = location.lat();
                address.longitude = location.lng();
              }
            } catch (error) {
              console.error('Error geocoding address:', error);
            }
          }

          if (address.latitude && address.longitude) {
            const marker = new google.maps.Marker({
              position: { lat: address.latitude, lng: address.longitude },
              map,
              title: address.address,
              label: {
                text: address.category || '📍',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 'bold'
              }
            });

            markersRef.current.push(marker);

            // Add click listener to marker
            marker.addListener('click', () => {
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <h3 class="font-bold">${address.address}</h3>
                    ${address.category ? `<p class="text-sm text-gray-600">${address.category}</p>` : ''}
                  </div>
                `
              });
              infoWindow.open(map, marker);
            });
          }
        }

        // Fit bounds to show all markers
        if (markersRef.current.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          markersRef.current.forEach(marker => bounds.extend(marker.getPosition()!));
          map.fitBounds(bounds);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, [addresses]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
} 