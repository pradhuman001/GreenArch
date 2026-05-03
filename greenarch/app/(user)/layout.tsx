'use client';

import { ReactNode } from 'react';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar would go here */}
      <main className="flex-1">{children}</main>
      {/* Footer would go here */}
    </div>
  );
}
