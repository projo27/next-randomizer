// src/components/TabContentGuard.tsx
'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LockKeyhole } from 'lucide-react';

export default function TabContentGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-700">Checking authentication status...</p>
      </div>
    );
  }

  // Jika user TIDAK ADA (belum login)
  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center mt-2 justify-center p-4 bg-primary dark:bg-secondary border border-red-200 rounded-lg text-center">
          <LockKeyhole className="h-10 w-10 text-red-70 mb-2" />
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Feature accessible only to registered users.
          </h2>
          <p className="text-lg text-current mb-4">
            Please sign in to unlock this feature.
          </p>
        </div>
        <div className="relative pointer-events-none opacity-60">
          {children}
          {/* Overlay modal */}
          <div className="absolute inset-0 bg-white/30 flex items-center justify-center z-10 pointer-events-auto w-full h-full">
            {/* <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <LockKeyhole className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
              <p className="text-gray-700">
                Please login to access this feature.
              </p>
            </div> */}
          </div>
        </div>
      </div>
    );
  }

  // Jika user ADA (sudah login), tampilkan konten tab
  return <>{children}</>;
}
