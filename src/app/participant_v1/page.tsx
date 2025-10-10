'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports for participant page components
const Sidebar = dynamic(() => import('./components/sidebar/Sidebar'), {
  loading: () => <div className="w-64 bg-gray-100 animate-pulse h-screen"></div>,
  ssr: false
});

const AboutUser = dynamic(() => import('./components/sections/aboutUser/AboutUser'), {
  loading: () => <div className="flex-1 bg-gray-50 animate-pulse h-screen"></div>,
  ssr: false
});

export default function ParticipantPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Suspense fallback={<div className="w-64 bg-gray-100 animate-pulse h-screen"></div>}>
        <Sidebar />
      </Suspense>
      
      <main className="flex-1 overflow-y-auto">
        <Suspense fallback={<div className="flex-1 bg-gray-50 animate-pulse h-screen"></div>}>
          <AboutUser />
        </Suspense>
      </main>
    </div>
  );
}


