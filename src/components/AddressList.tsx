import { AddressData } from '@/lib/geocodeService';

interface AddressListProps {
  addresses: AddressData[];
  filteredAddresses: AddressData[];
  onAddressClick: (address: AddressData) => void;
  isLoading: boolean;
  loadingProgress: number;
}

export default function AddressList({
  addresses,
  filteredAddresses,
  onAddressClick,
  isLoading,
  loadingProgress
}: AddressListProps) {
  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Processing Addresses</h3>
          <span className="text-blue-500 font-medium">{loadingProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Processed {loadingProgress}% of {addresses.length} addresses...
        </p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-center">No addresses uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Address List</h3>
          <span className="text-sm text-gray-500">
            Showing {filteredAddresses.length} of {addresses.length} addresses
          </span>
        </div>
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {filteredAddresses.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No addresses match your search
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredAddresses.map((address, index) => (
              <li 
                key={`${address.address}-${index}`}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onAddressClick(address)}
              >
                <div className="p-4">
                  <h4 className="font-medium text-gray-900">{address.address}</h4>
                  <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-500">
                    {Object.entries(address.originalData).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-1">
                        <span className="font-medium">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 