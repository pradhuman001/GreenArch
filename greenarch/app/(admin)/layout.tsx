'use client';

import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
