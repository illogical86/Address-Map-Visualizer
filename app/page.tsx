'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import AddressMap from './AddressMap';
import ExportMap from './ExportMap';

interface Address {
  id: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  category?: string;
}

export default function Home() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [originalData, setOriginalData] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          const firstRow = jsonData[0] as any;
          const addressColumn = Object.keys(firstRow).find(key => 
            key.toLowerCase().includes('address') || 
            key.toLowerCase().includes('location')
          );

          if (!addressColumn) {
            throw new Error('No address column found in the spreadsheet');
          }

          const categoryColumn = Object.keys(firstRow).find(key =>
            key.toLowerCase().includes('category') ||
            key.toLowerCase().includes('type')
          );

          const addressList: Address[] = jsonData.map((row: any, index: number) => ({
            id: `address-${index}`,
            address: row[addressColumn],
            latitude: null,
            longitude: null,
            category: categoryColumn ? row[categoryColumn] : undefined
          }));

          if (categoryColumn) {
            const uniqueCategories = Array.from(new Set(addressList
              .map(addr => addr.category)
              .filter(category => category !== undefined)
            ));
            setCategories(['all', ...uniqueCategories]);
          }

          setAddresses(addressList);
          setOriginalData(addressList);
        } catch (error) {
          setError('Error processing file: ' + (error as Error).message);
        }
      };

      reader.onerror = () => {
        setError('Error reading file');
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      setError('Error processing file: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    }
  });

  useEffect(() => {
    if (searchTerm === '' && selectedCategory === 'all') {
      setAddresses(originalData);
      return;
    }

    let filteredAddresses = originalData;

    if (searchTerm !== '') {
      filteredAddresses = filteredAddresses.filter(address =>
        address.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filteredAddresses = filteredAddresses.filter(address =>
        address.category === selectedCategory
      );
    }

    setAddresses(filteredAddresses);
  }, [searchTerm, selectedCategory, originalData]);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">Address Map Visualizer</h1>
        
        <div 
          {...getRootProps()} 
          className={`p-8 border-2 border-dashed rounded-lg transition-colors duration-200 cursor-pointer
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-white'}`}
        >
          <input {...getInputProps()} />
          <p className="text-center text-gray-600">
            {isDragActive
              ? 'Drop the file here...'
              : 'Drag and drop an Excel file here, or click to select a file'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {addresses.length > 0 && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search addresses..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="mb-4">
                <ExportMap addresses={addresses} />
              </div>
              <div className="h-[600px] rounded-lg overflow-hidden border border-gray-200">
                <AddressMap addresses={addresses} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 
