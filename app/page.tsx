'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { geocodeAddress, AddressData } from '../src/lib/geocodeService';
import AddressMap from '../src/components/AddressMap';
import ExportMap from '../src/components/ExportMap';
import AddressList from '../src/components/AddressList';

export default function Home() {
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [filteredAddresses, setFilteredAddresses] = useState<AddressData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Handle file drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    onDrop: handleFileDrop
  });

  // Process dropped file
  async function handleFileDrop(acceptedFiles: File[]) {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setLoadingProgress(0);
      setError(null);
      
      const data = await readFileData(file);
      if (!data || !data.length) {
        throw new Error('No data found in file');
      }

      const geocodedAddresses: AddressData[] = [];
      const total = data.length;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const addressField = await findAddressField(row);
        
        if (addressField) {
          try {
            const geocoded = await geocodeAddress(row[addressField], row);
            if (geocoded) {
              geocodedAddresses.push(geocoded);
            }
          } catch (error) {
            console.error('Error geocoding address:', error);
          }
        }

        // Update progress
        const progress = Math.round(((i + 1) / total) * 100);
        setLoadingProgress(progress);
      }

      setAddresses(geocodedAddresses);
      setFilteredAddresses(geocodedAddresses);
      
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Error processing file');
    } finally {
      setIsLoading(false);
    }
  }

  // Read file data using XLSX
  async function readFileData(file: File) {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  }

  // Find the address field in the data
  async function findAddressField(data: any) {
    const addressKeywords = ['address', 'location', 'street'];
    const keys = Object.keys(data);
    
    return keys.find(key => 
      addressKeywords.some(keyword => 
        key.toLowerCase().includes(keyword)
      )
    );
  }

  // Filter addresses based on search term and category
  useEffect(() => {
    let filtered = [...addresses];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(addr => 
        addr.address.toLowerCase().includes(search) || 
        (addr.originalData && Object.values(addr.originalData).some(
          val => typeof val === 'string' && val.toLowerCase().includes(search)
        ))
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(addr => 
        addr.originalData && addr.originalData[selectedCategory] !== undefined
      );
    }
    
    setFilteredAddresses(filtered);
  }, [addresses, searchTerm, selectedCategory]);

  // Handle address selection from list
  const handleAddressClick = (address: AddressData) => {
    // You might want to add logic here to center the map on the selected address
    // or highlight the corresponding marker
  };

  return (
    <main className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Address Map Visualizer</h1>
        <span className="text-sm text-gray-500">Version 1.0</span>
      </div>
      
      {/* File Upload */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? 'Drop the file here...'
            : 'Drag and drop an Excel file here, or click to select'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supported formats: .xlsx, .xls, .csv
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search addresses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {addresses.length > 0 && addresses[0]?.originalData && 
                Object.keys(addresses[0].originalData).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))
              }
            </select>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="h-[600px] bg-gray-100 rounded-lg overflow-hidden">
        <AddressMap 
          addresses={filteredAddresses}
          filters={{ category: selectedCategory, searchTerm }}
        />
      </div>

      {/* Address List */}
      <AddressList
        addresses={addresses}
        filteredAddresses={filteredAddresses}
        onAddressClick={handleAddressClick}
        isLoading={isLoading}
        loadingProgress={loadingProgress}
      />

      {/* Export Button */}
      {addresses.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowExport(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Export Data
          </button>
        </div>
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportMap
          addresses={addresses}
          onClose={() => setShowExport(false)}
        />
      )}
    </main>
  );
} 