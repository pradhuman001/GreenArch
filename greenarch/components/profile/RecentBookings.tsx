'use client';

import { MapPin, User, Calendar, Star, ChevronRight } from 'lucide-react';

interface Booking {
  id: string;
  serviceName: string;
  gardenerName: string;
  date: string;
  time: string;
  location: string;
  status: 'completed' | 'scheduled' | 'cancelled';
  rating?: number;
}

interface RecentBookingsProps {
  bookings?: Booking[];
}

const defaultBookings: Booking[] = [
  {
    id: 'BK-001',
    serviceName: 'Garden Maintenance',
    gardenerName: 'Marcus Green',
    date: '2024-05-20',
    time: '10:00 AM',
    location: 'San Francisco, CA',
    status: 'scheduled',
    rating: undefined,
  },
  {
    id: 'BK-002',
    serviceName: 'Lawn Care & Trimming',
    gardenerName: 'Elena Bloom',
    date: '2024-05-10',
    time: '2:00 PM',
    location: 'San Francisco, CA',
    status: 'completed',
    rating: 5,
  },
  {
    id: 'BK-003',
    serviceName: 'Tree Pruning',
    gardenerName: 'John Landscaper',
    date: '2024-04-25',
    time: '9:00 AM',
    location: 'San Francisco, CA',
    status: 'completed',
    rating: 4,
  },
];

const statusConfig = {
  scheduled: { color: 'bg-blue-100 text-blue-800', text: 'Scheduled' },
  completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
};

export function RecentBookings({ bookings = defaultBookings }: RecentBookingsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Bookings</h2>
          <p className="text-gray-600">Your gardening service appointments and history.</p>
        </div>
        <button className="text-primary hover:text-secondary font-semibold flex items-center gap-2 transition-colors">
          View All
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{booking.serviceName}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${statusConfig[booking.status].color}`}>
                    {statusConfig[booking.status].text}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={16} className="text-primary flex-shrink-0" />
                    <span>{booking.gardenerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="text-primary flex-shrink-0" />
                    <span>{new Date(booking.date).toLocaleDateString()} at {booking.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                    <MapPin size={16} className="text-primary flex-shrink-0" />
                    <span>{booking.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {booking.status === 'completed' && booking.rating ? (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < booking.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                ) : null}
                <button className="text-xs text-gray-500 hover:text-primary font-medium transition-colors">
                  {booking.status === 'scheduled' ? 'Reschedule' : 'Details'} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
