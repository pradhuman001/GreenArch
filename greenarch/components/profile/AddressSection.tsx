'use client';

import { MapPin, Plus } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface AddressSectionProps {
  addresses?: Address[];
}

const defaultAddresses: Address[] = [
  {
    id: '1',
    label: 'Home',
    street: '123 Garden Lane',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Work',
    street: '456 Eco Park Drive',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    isDefault: false,
  },
];

export function AddressSection({ addresses = defaultAddresses }: AddressSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Saved Addresses</h2>
          <p className="text-gray-600">Manage your delivery and service addresses.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-all">
          <Plus size={18} />
          <span className="hidden sm:inline">Add New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
              address.isDefault
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 bg-gray-50 hover:border-primary/50'
            }`}
          >
            {address.isDefault && (
              <span className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                DEFAULT
              </span>
            )}

            <div className="flex gap-3">
              <MapPin className="text-primary flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{address.label}</h3>
                <p className="text-sm text-gray-700 mb-1">{address.street}</p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state} {address.zipCode}
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-2 pt-3 border-t border-gray-200">
              <button className="flex-1 text-center text-sm text-primary hover:text-secondary font-medium transition-colors">
                Edit
              </button>
              <button className="flex-1 text-center text-sm text-gray-500 hover:text-red-500 font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
