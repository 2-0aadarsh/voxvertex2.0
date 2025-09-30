'use client';
import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/store/hooks';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';
import { selectSpeakers, useGetSpeakersQuery } from '@/store/slices/speakersSlice';
import { useGetDetailedSpeakerProfileQuery } from '@/store/slices/speakerProfileSlice';
import { useAppSelector } from '@/store/hooks';
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
  
  // Get speaker ID from URL parameters
  const searchParams = useSearchParams();
  const speakerId = searchParams.get('id');

  // Fetch detailed speaker profile data
  const { 
    data: detailedProfileData, 
    isLoading: isLoadingDetailedProfile, 
    error: detailedProfileError 
  } = useGetDetailedSpeakerProfileQuery(speakerId!, {
    skip: !speakerId // Skip if no speakerId
  });

  // Fallback: Fetch basic speakers data if detailed profile fails
  const { data: speakersData, isLoading: isLoadingSpeakers, error: speakersError } = useGetSpeakersQuery(
    { page: 1, limit: 100 },
    { skip: !speakerId || !!detailedProfileData } // Skip if we have detailed profile
  );

  // Get speaker data from detailed profile or fallback to basic speakers list
  const speaker = detailedProfileData?.data?.speaker || 
                  speakersData?.data?.speakers?.find((s: any) => s._id === speakerId);
  
  // Get detailed profile sections
  const detailedProfile = detailedProfileData?.data;

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
        // Use data from detailed profile (no lazy loading needed)
        return (
          <ExperienceSection 
            workExperience={detailedProfile?.workExperience} 
            isLoading={isLoadingDetailedProfile}
            error={detailedProfileError}
          />
        );
      case 'Events':
        return <Events />;
      case 'Education':
        // Use data from detailed profile (no lazy loading needed)
        return (
          <EducationSection 
            education={detailedProfile?.education} 
            isLoading={isLoadingDetailedProfile}
            error={detailedProfileError}
          />
        );
      case 'Awards':
        // Use data from detailed profile (no lazy loading needed)
        return (
          <AwardsSection 
            awards={detailedProfile?.awards} 
            isLoading={isLoadingDetailedProfile}
            error={detailedProfileError}
          />
        );
      case 'Videos':
        // Use data from detailed profile (no lazy loading needed)
        return (
          <VideosSection 
            featuredVideos={detailedProfile?.featuredVideos} 
            isLoading={isLoadingDetailedProfile}
            error={detailedProfileError}
          />
        );
      case 'Feedback':
        return <FeedbackSection />;
    }
  };

  // Handle loading and error states
  if (!speakerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Speaker Not Found</h2>
          <p className="text-gray-600">No speaker ID provided in the URL.</p>
        </div>
      </div>
    );
  }

  if ((isLoadingDetailedProfile || isLoadingSpeakers) && !speaker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Speaker Profile...</h2>
          <p className="text-gray-600">Please wait while we load the speaker information.</p>
          {(detailedProfileError || speakersError) && (
            <p className="text-red-600 mt-2">
              Error loading speaker: {(detailedProfileError || speakersError)?.toString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!speaker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Speaker Not Found</h2>
          <p className="text-gray-600">The requested speaker profile could not be found.</p>
        </div>
      </div>
    );
  }

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
            <ProfileHeader speaker={speaker} />
            <RatingsCard speaker={speaker} />
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
            {renderContent()}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <AvailabilityCard
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                availability={detailedProfile?.availability}
                isLoading={isLoadingDetailedProfile}
                error={detailedProfileError}
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