import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileInfoCard } from '@/components/profile/ProfileInfoCard';
import { AddressSection } from '@/components/profile/AddressSection';
import { RecentOrders } from '@/components/profile/RecentOrders';
import { RecentBookings } from '@/components/profile/RecentBookings';

export const metadata = {
  title: 'My Profile | GreenArch',
  description: 'Manage your profile, addresses, orders, and bookings on GreenArch.',
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <ProfileSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="space-y-8">
              {/* Profile Information */}
              <ProfileInfoCard />

              {/* Saved Addresses */}
              <AddressSection />

              {/* Recent Orders and Bookings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RecentOrders />
                <RecentBookings />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
