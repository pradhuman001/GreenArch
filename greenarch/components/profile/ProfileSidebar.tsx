'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ProfileSidebarProps {
  userName?: string;
  userEmail?: string;
}

export function ProfileSidebar({ 
  userName = 'Sarah Anderson', 
  userEmail = 'sarah@example.com' 
}: ProfileSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/profile', label: 'Profile' },
    { href: '/profile/bookings', label: 'My Bookings' },
    { href: '/profile/saved', label: 'Saved Services' },
    { href: '/profile/support', label: 'Support' },
    { href: '/profile/settings', label: 'Settings' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-full md:w-64 md:sticky md:top-20 h-fit">
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border border-gray-100">
        {/* User Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Hello, <span className="text-primary">{userName.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-600 text-sm">{userEmail}</p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <button className="w-full mt-8 px-4 py-3 border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-primary hover:text-primary transition-all">
          Logout
        </button>
      </div>
    </aside>
  );
}
