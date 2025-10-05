'use client';

import React, { useState, Suspense } from 'react';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/store/hooks';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';
import dynamic from 'next/dynamic';
import Overview from './components/Overview';
import Transactions from './components/Transactions';
import Subscription from './components/Subscription';
import PaymentMethods from './components/PaymentMethods';
import { PaymentData } from './types';
import Sidebar from '@/components/Sidebar';

// Dynamic import for Navbar
const Navbar = dynamic(() => import('@/components/Navbar'), {
  loading: () => <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>,
  ssr: false
});

type TabType = 'overview' | 'transactions' | 'subscription' | 'payment-methods';

// Mock data
const paymentData: PaymentData = {
  totalBalance: 8750.00,
  availableNow: 2250.00,
  pendingClearance: 1800.00,
  dailyTransactionLimit: 100.0,
  dailyWithdrawalLimit: 50.0,
  availableUtilization: 25.7,
  pendingUtilization: 20.6,
  isVerified: true
};

export default function PaymentsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Authentication hooks
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: unknown) => {
    if (!profileImage) return null;
    
    // Handle string URLs
    if (typeof profileImage === 'string') {
      if (profileImage.startsWith('http')) return profileImage;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`;
    }
    
    // Handle object with data and contentType (Buffer)
    if (typeof profileImage === 'object' && profileImage.data && profileImage.contentType) {
      const dataUrl = `data:${profileImage.contentType};base64,${profileImage.data.toString('base64')}`;
      return dataUrl;
    }
    
    // Handle object with url property
    if (typeof profileImage === 'object' && profileImage.url) {
      if (profileImage.url.startsWith('http')) return profileImage.url;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage.url}`;
    }
    
    return null;
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'transactions' as TabType, label: 'Transactions' },
    { id: 'subscription' as TabType, label: 'Subscription' },
    { id: 'payment-methods' as TabType, label: 'Payment Methods' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview data={paymentData} />;
      case 'transactions':
        return <Transactions data={paymentData} />;
      case 'subscription':
        return <Subscription />;
      case 'payment-methods':
        return <PaymentMethods />;
      default:
        return <Overview data={paymentData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>}>
        <Navbar 
          user={user || undefined}
          currentUserData={currentUserData}
          isAuthenticated={isAuthenticated}
          forceHomepageStyle={true}
          getProfileImageUrl={getProfileImageUrl}
        />
        {/* Hide sidebar on mobile, show on large screens */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      </Suspense>

      <div className="lg:ml-64 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payments Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your funds, transactions, and payment methods</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span className="text-green-600">Verified Account</span>
              </div>
              <span className="sm:ml-4 font-semibold text-gray-900">
                Total Balance: ${paymentData.totalBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-[#FF6B35]/10 rounded-2xl sm:rounded-full shadow-sm border border-white mb-4 sm:mb-8 p-1.5 sm:p-2">
            <div className="flex flex-col sm:flex-row w-full gap-1 sm:gap-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full transition-all duration-200 font-medium text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-[#FF6B35] text-white shadow-md'
                      : 'text-gray-600 hover:text-[#FF6B35] hover:bg-[#FF6B35]/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}