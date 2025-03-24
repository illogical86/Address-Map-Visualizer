'use client';

import { useState, useEffect } from 'react';
import { AddressData } from '@/lib/geocodeService';

interface SidebarProps {
  addresses: AddressData[];
  onFilterChange: (filters: { category?: string; searchTerm?: string }) => void;
  onExport: () => void;
}

export default function Sidebar({ addresses, onFilterChange, onExport }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Detect available categories from address data
  useEffect(() => {
    setIsLoading(true);
    
    // If we have addresses, process them
    if (addresses.length > 0) {
      try {
        // Get all unique keys from the first address's original data
        const firstAddressKeys = Object.keys(addresses[0].originalData);
        
        // Filter out the address key itself (we don't need to filter by address)
        const categories = firstAddressKeys.filter(
          key => key.toLowerCase() !== 'address' && 
          key.toLowerCase() !== 'id' && 
          key.toLowerCase() !== 'latitude' && 
          key.toLowerCase() !== 'longitude'
        );
        
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Error processing categories:', error);
        setAvailableCategories([]);
      }
    }
    
    setIsLoading(false);
  }, [addresses]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFilterChange({ searchTerm: value, category: selectedCategory });
  };

  // Handle category selection change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    onFilterChange({ searchTerm, category: value });
  };

  // Handle export button click
  const handleExportClick = () => {
    onExport();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Filter Options</h2>

      {/* Search Filter */}
      <div className="mb-4">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search addresses..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          disabled={addresses.length === 0}
        />
      </div>

      {/* Category Filter */}
      {availableCategories.length > 0 && (
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Field
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Fields</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExportClick}
        className={`w-full py-2 px-4 rounded-md transition-colors ${
          addresses.length > 0 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={addresses.length === 0}
      >
        Export Map
      </button>

      {/* Address Count */}
      <div className="mt-4 text-sm text-gray-600">
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-blue-500 animate-spin"></div>
            Loading...
          </div>
        ) : (
          <div>
            Showing {addresses.length} location{addresses.length !== 1 ? 's' : ''}
            {addresses.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Upload a file with addresses to see them on the map
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 