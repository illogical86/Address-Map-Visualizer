'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import AddressMap from '@/components/AddressMap';
import ExportMap from '@/components/ExportMap';

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

          // Find the column that contains addresses
          const firstRow = jsonData[0] as any;
          const addressColumn = Object.keys(firstRow).find(key => 
            key.toLowerCase().includes('address') || 
            key.toLowerCase().includes('location')
          );

          if (!addressColumn) {
            throw new Error('No address column found in the spreadsheet');
          }

          // Extract categories if they exist
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

          // Extract unique categories
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
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Address Map Visualizer</h1>
        
        <div className="mb-8 p-6 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200" {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-center text-gray-600">Drop the file here...</p>
          ) : (
            <p className="text-center text-gray-600">
              Drag and drop an Excel file here, or click to select a file
            </p>
          )}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {addresses.length > 0 && (
          <div className="mb-8 flex gap-4">
            <input
              type="text"
              placeholder="Search addresses..."
              className="flex-1 p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {addresses.length > 0 && (
          <>
            <div className="mb-4">
              <ExportMap addresses={addresses} />
            </div>
            <div className="h-[600px] rounded-lg overflow-hidden">
              <AddressMap addresses={addresses} setAddresses={setAddresses} />
            </div>
          </>
        )}
      </div>
    </main>
  );
} 
