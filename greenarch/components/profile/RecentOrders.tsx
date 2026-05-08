'use client';

import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';

interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: 'completed' | 'processing' | 'cancelled';
  itemCount: number;
}

interface RecentOrdersProps {
  orders?: Order[];
}

const defaultOrders: Order[] = [
  {
    id: 'ORD-001',
    date: '2024-05-15',
    items: 'Tomato Plants, Basil, Potting Soil',
    total: 89.99,
    status: 'completed',
    itemCount: 3,
  },
  {
    id: 'ORD-002',
    date: '2024-05-08',
    items: 'Fertilizer, Plant Nutrients',
    total: 34.50,
    status: 'completed',
    itemCount: 2,
  },
  {
    id: 'ORD-003',
    date: '2024-04-28',
    items: 'Rose Bush, Garden Tools Set',
    total: 125.00,
    status: 'completed',
    itemCount: 2,
  },
];

const statusConfig = {
  completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
  processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing' },
  cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
};

export function RecentOrders({ orders = defaultOrders }: RecentOrdersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Orders</h2>
          <p className="text-gray-600">Your plant store purchases and deliveries.</p>
        </div>
        <button className="text-primary hover:text-secondary font-semibold flex items-center gap-2 transition-colors">
          View All
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{order.id}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${statusConfig[order.status].color}`}>
                    {statusConfig[order.status].text}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{order.items}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{order.itemCount} items</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
                <button className="text-xs text-gray-500 hover:text-primary mt-1 font-medium transition-colors">
                  Details →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
