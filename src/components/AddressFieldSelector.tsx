'use client';

import { useState, useEffect } from 'react';
import { detectAddressField } from '@/lib/geocodeService';

interface AddressFieldSelectorProps {
  data: any[];
  onSelectField: (field: string) => void;
}

export default function AddressFieldSelector({ data, onSelectField }: AddressFieldSelectorProps) {
  const [fields, setFields] = useState<string[]>([]);
  const [selectedField, setSelectedField] = useState<string>('');

  useEffect(() => {
    if (data.length > 0) {
      const availableFields = Object.keys(data[0]);
      setFields(availableFields);
      
      // Try to auto-detect address field
      const detectedField = detectAddressField(data);
      if (detectedField) {
        setSelectedField(detectedField);
      } else if (availableFields.length > 0) {
        setSelectedField(availableFields[0]);
      }
    }
  }, [data]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedField(e.target.value);
  };

  const handleConfirm = () => {
    if (selectedField) {
      onSelectField(selectedField);
    }
  };

  // Display a sample of the selected field's data
  const getSampleData = () => {
    if (!selectedField || data.length === 0) return [];
    
    return data.slice(0, 3).map(item => item[selectedField]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Select Address Field</h2>
      <p className="text-gray-600 mb-4">
        We need to identify which column from your spreadsheet contains the address information.
        Please select the appropriate field below.
      </p>
      
      <div className="mb-4">
        <label htmlFor="addressField" className="block text-sm font-medium text-gray-700 mb-1">
          Address Field
        </label>
        <select
          id="addressField"
          value={selectedField}
          onChange={handleFieldChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {fields.map(field => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>
      
      {selectedField && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-1">Sample Addresses:</h3>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <ul className="list-disc pl-5 space-y-1">
              {getSampleData().map((sample, index) => (
                <li key={index} className="text-sm text-gray-800">
                  {sample ? String(sample) : '(empty)'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={handleConfirm}
          disabled={!selectedField}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
} 