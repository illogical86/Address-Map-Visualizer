'use client';

import { useState } from 'react';

interface Address {
  id: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  category?: string;
}

interface ExportMapProps {
  addresses: Address[];
}

export default function ExportMap({ addresses }: ExportMapProps) {
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const handleExport = () => {
    if (exportFormat === 'csv') {
      const headers = ['Address', 'Latitude', 'Longitude', 'Category'];
      const csvContent = [
        headers.join(','),
        ...addresses.map(addr => [
          `"${addr.address}"`,
          addr.latitude || '',
          addr.longitude || '',
          addr.category || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'addresses.csv';
      link.click();
    } else {
      const jsonContent = JSON.stringify(addresses, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'addresses.json';
      link.click();
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Export Data
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Export Data</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                className="w-full p-2 border rounded"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleExport();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 