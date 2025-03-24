'use client';

import { useState } from 'react';
import { AddressData } from '@/lib/geocodeService';

interface ExportMapProps {
  addresses: AddressData[];
  onClose: () => void;
}

export default function ExportMap({ addresses, onClose }: ExportMapProps) {
  const [exportFormat, setExportFormat] = useState<'image' | 'csv' | 'json'>('image');
  const [isExporting, setIsExporting] = useState(false);

  // Generate CSV content from addresses
  const generateCSV = () => {
    if (!addresses.length) return '';
    
    // Get all unique keys from the first address's original data
    const keys = ['address', 'latitude', 'longitude', ...Object.keys(addresses[0].originalData)];
    
    // Create CSV header
    let csv = keys.join(',') + '\n';
    
    // Add data rows
    addresses.forEach(address => {
      const row = keys.map(key => {
        if (key === 'latitude') return address.latitude;
        if (key === 'longitude') return address.longitude;
        if (key === 'address') return `"${address.address.replace(/"/g, '""')}"`;
        
        const value = address.originalData[key] || '';
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  };

  // Generate JSON content from addresses
  const generateJSON = () => {
    return JSON.stringify(
      addresses.map(addr => ({
        address: addr.address,
        latitude: addr.latitude,
        longitude: addr.longitude,
        ...addr.originalData
      })),
      null,
      2
    );
  };

  // Handle export button click
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (exportFormat === 'csv') {
        const csvContent = generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'address_map_export.csv');
        link.click();
        
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'json') {
        const jsonContent = generateJSON();
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'address_map_export.json');
        link.click();
        
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'image') {
        // For image export, we'd ideally take a screenshot of the map
        // This is a simplified version that creates a visual representation
        // In a real app, you might use html2canvas or a similar library
        alert('Image export functionality would capture the current map view.');
        
        // Example of how you might implement this with html2canvas:
        // const mapElement = document.getElementById('google-map');
        // const canvas = await html2canvas(mapElement);
        // const url = canvas.toDataURL('image/png');
        // const link = document.createElement('a');
        // link.setAttribute('href', url);
        // link.setAttribute('download', 'address_map_export.png');
        // link.click();
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('An error occurred during export. Please try again.');
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Export Map</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setExportFormat('image')}
              className={`py-2 px-4 rounded-md border ${
                exportFormat === 'image'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              Image
            </button>
            <button
              onClick={() => setExportFormat('csv')}
              className={`py-2 px-4 rounded-md border ${
                exportFormat === 'csv'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              CSV
            </button>
            <button
              onClick={() => setExportFormat('json')}
              className={`py-2 px-4 rounded-md border ${
                exportFormat === 'json'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              JSON
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          {exportFormat === 'image' && 'Export the current map view as an image file.'}
          {exportFormat === 'csv' && 'Export all address data to a CSV file for use in spreadsheet applications.'}
          {exportFormat === 'json' && 'Export all address data to a JSON file for use in other applications.'}
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
} 