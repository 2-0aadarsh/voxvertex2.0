'use client';
import React, { useState, Suspense } from 'react';
import { useAuth } from '@/store/hooks';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';
import dynamic from 'next/dynamic';

// Dynamic import for Navbar
const Navbar = dynamic(() => import('@/components/Navbar'), {
  loading: () => <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>,
  ssr: false
});

// Layout imports
import ProfileHeader from './components/layout/ProfileHeader';

// Profile imports
import RatingsCard from './components/profile/RatingsCard';
import TabNavigation from './components/profile/TabNavigation';
import ExperienceSection from './components/profile/ExperienceSection';
import Events from './components/profile/SpeakingSection';
import EducationSection from './components/profile/EducationSection';
import AwardsSection from './components/profile/AwardsSection';
import VideosSection from './components/profile/VideosSection';

// Sidebar imports
import AvailabilityCard from './components/sidebar/AvailabilityCard';
import PricingCard from './components/sidebar/PricingCard';
import FeedbackSection from './components/profile/FeedbackSection';

const SpeakerProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Experience');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Authentication hooks
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Helper function to get profile image URL 
  const getProfileImageUrl = (profileImage: any) => {
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

  const tabs = ['Experience', 'Events', 'Education', 'Awards', 'Videos', 'Feedback'];

  const renderContent = () => {
    switch (activeTab) {
      case 'Experience':
        return <ExperienceSection />;
      case 'Events':
        return <Events />;
      case 'Education':
        return <EducationSection />;
      case 'Awards':
        return <AwardsSection />;
      case 'Videos':
        return <VideosSection />;
      case 'Feedback':
        return <FeedbackSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>}>
        <Navbar 
          user={user || undefined}
          currentUserData={currentUserData}
          isAuthenticated={isAuthenticated}
          forceHomepageStyle={true}
          getProfileImageUrl={getProfileImageUrl}
        />
      </Suspense>
      
      <div className="max-w-8xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-2">
          <div className="lg:col-span-5">
            <ProfileHeader />
            <RatingsCard />
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
            {renderContent()}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <AvailabilityCard 
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
              <PricingCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakerProfile;