import { Loader } from '@googlemaps/js-api-loader';

export interface AddressData {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  originalData: Record<string, any>;
  [key: string]: any;
}

// Use the environment variable for the API key
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Show warning if API key is not set
if (!GOOGLE_MAPS_API_KEY) {
  console.warn('Google Maps API Key is not set. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.');
}

// This is a direct implementation using fetch to geocode addresses
// It's more reliable than the Google Maps JavaScript API for bulk geocoding
export async function geocodeAddressWithAPI(address: string): Promise<{lat: number, lng: number} | null> {
  try {
    console.log(`Geocoding address: ${address}`);
    
    // Add a small delay to avoid hitting rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Use the Geocoding API directly
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      console.log(`Geocoded ${address} to:`, { lat, lng });
      return { lat, lng };
    }
    
    if (data.status === 'ZERO_RESULTS') {
      console.warn(`No results found for address: ${address}`);
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('Google Maps API query limit exceeded');
      throw new Error('Google Maps API query limit exceeded. Please try again later.');
    } else {
      console.warn(`Geocoding failed for address: ${address}, status: ${data.status}`);
    }
    
    return null;
  } catch (error) {
    console.error(`Geocoding error for address ${address}:`, error);
    return null;
  }
}

// Fallback to using the JavaScript API if needed
let geocoder: google.maps.Geocoder | null = null;
let geocoderPromise: Promise<google.maps.Geocoder> | null = null;

export async function initGeocoder() {
  // If we already have a geocoder instance, return it
  if (geocoder) return geocoder;
  
  // If we're already initializing the geocoder, return the promise
  if (geocoderPromise) return geocoderPromise;
  
  // Create a new promise to initialize the geocoder
  geocoderPromise = new Promise(async (resolve, reject) => {
    try {
      const loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places']
      });
      
      await loader.load();
      geocoder = new google.maps.Geocoder();
      console.log('Geocoder initialized successfully');
      resolve(geocoder);
    } catch (error) {
      console.error('Failed to initialize geocoder:', error);
      geocoderPromise = null; // Reset the promise so we can try again
      reject(error);
    }
  });
  
  return geocoderPromise;
}

export async function geocodeAddress(address: string, originalData: any = {}): Promise<AddressData | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results[0]) {
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;

      return {
        address: result.formatted_address,
        latitude: lat,
        longitude: lng,
        originalData: originalData || {} // Ensure originalData is never null
      };
    }

    console.error('Geocoding failed for address:', address, 'Status:', data.status);
    return null;
  } catch (error) {
    console.error('Error geocoding address:', address, error);
    return null;
  }
}

export async function batchGeocodeAddresses(
  data: any[], 
  addressField: string
): Promise<AddressData[]> {
  const geocodedData: AddressData[] = [];
  const errors: string[] = [];
  
  console.log(`Starting batch geocoding of ${data.length} addresses using field: ${addressField}`);
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const address = item[addressField];
    
    if (!address) {
      console.warn(`Item ${i} has no address in field "${addressField}"`);
      continue;
    }
    
    try {
      const coordinates = await geocodeAddress(address);
      
      if (coordinates) {
        geocodedData.push({
          id: `${i}-${Date.now()}`,
          address,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          originalData: { ...item }
        });
        console.log(`Successfully geocoded item ${i+1}/${data.length}`);
      } else {
        errors.push(`Could not geocode address: ${address}`);
      }
    } catch (error) {
      console.error(`Error geocoding address ${address}:`, error);
      errors.push(`Error geocoding address: ${address}`);
    }
    
    // Add progress indicator for every 5 items
    if ((i + 1) % 5 === 0 || i === data.length - 1) {
      console.log(`Geocoded ${i+1}/${data.length} addresses`);
    }
    
    // Add a small delay between geocoding requests to avoid rate limits
    if (i < data.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Log any errors that occurred
  if (errors.length > 0) {
    console.warn(`${errors.length} errors occurred during geocoding:`);
    console.warn(errors.slice(0, 5)); // Show first 5 errors
    if (errors.length > 5) {
      console.warn(`...and ${errors.length - 5} more errors`);
    }
  }
  
  console.log(`Batch geocoding complete. Successfully geocoded ${geocodedData.length}/${data.length} addresses.`);
  
  return geocodedData;
}

// This function identifies the potential address field in the data
export function detectAddressField(data: any[]): string | null {
  if (!data || data.length === 0) return null;
  
  const firstRow = data[0];
  const keys = Object.keys(firstRow);
  
  console.log('Available fields for address detection:', keys);
  
  // Check for common address field names
  const possibleAddressFields = [
    'address',
    'location',
    'street',
    'streetaddress',
    'fulladdress',
    'addressline1',
    'address1',
    'addr',
    'location'
  ];
  
  for (const field of possibleAddressFields) {
    const match = keys.find(k => k.toLowerCase().includes(field));
    if (match) {
      console.log(`Detected address field: ${match}`);
      return match;
    }
  }
  
  console.log(`No address field detected. Defaulting to first field: ${keys[0]}`);
  return keys[0]; // Default to first field if no match found
} 