//app\booking\components\database.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectSpeakersFilters,
  setFilters,
} from '@/store/slices/speakersSlice';
import {
  useGetSavedSpeakersForDatabaseQuery,
  useGetCustomTagsQuery,
} from '@/store/slices/savedSpeakersSlice';
import SpeakerCard from '@/app/speakers/components/SpeakerCard';
import { Plus, Search, Loader2, AlertCircle } from 'lucide-react';

export default function SpeakerDatabasePage() {
  const dispatch = useAppDispatch();

  // Local state for UI
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('All Tags');
  // Remove showSavedSpeakers state - always show saved speakers only

  // Redux state
  const filters = useAppSelector(selectSpeakersFilters);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update filters when search query changes
  React.useEffect(() => {
    if (debouncedSearchQuery !== filters.searchQuery) {
      dispatch(setFilters({ searchQuery: debouncedSearchQuery }));
    }
  }, [debouncedSearchQuery, filters.searchQuery, dispatch]);

  // Determine which query to use - always use saved speakers
  const hasActiveSearch = useMemo(() => {
    return !!(debouncedSearchQuery && debouncedSearchQuery.trim().length > 0);
  }, [debouncedSearchQuery]);

  // Remove hasActiveFilters logic since we only show saved speakers

  // API queries - only use saved speakers query
  // Remove all other queries since we only show saved speakers

  // Saved speakers queries - always fetch saved speakers
  const savedSpeakersParams = { page: 1, limit: 12, tags: tagFilter !== 'All Tags' ? [tagFilter] : undefined };
  console.log('🔍 Saved speakers query params:', savedSpeakersParams);
  
  const {
    data: savedSpeakersData,
    isLoading: isLoadingSaved,
    error: savedError,
  } = useGetSavedSpeakersForDatabaseQuery(
    savedSpeakersParams,
    { skip: false } // Always fetch saved speakers
  );

  const {
    data: customTagsData,
  } = useGetCustomTagsQuery();

  // Remove save speaker mutation since we only show saved speakers

  // Determine which data to use - always use saved speakers data
  const currentData = savedSpeakersData;
  const currentLoading = isLoadingSaved;
  const currentError = savedError;

  // Debug logging
  console.log('🔍 Current state:', { 
    currentData: currentData?.data, 
    currentLoading, 
    currentError,
    savedSpeakersData,
    isLoadingSaved,
    savedError
  });

  // Process speakers data with enhanced details - always process saved speakers
  const processedSpeakers = useMemo(() => {
    let speakers: unknown[] = [];
    
    if (currentData?.data && 'speakers' in currentData.data) {
      // Always process saved speakers data
      speakers = (currentData.data as { speakers: unknown[] }).speakers || [];
      console.log('🔍 Saved speakers data:', { speakers, currentData });
    }
    
    if (!speakers || speakers.length === 0) {
      console.log('🔍 No saved speakers found:', currentData);
      return [];
    }

    return speakers.map((speaker: unknown) => {
      // Type the speaker object properly
      const speakerObj = speaker as {
        _id: string;
        firstName: string;
        lastName: string;
        fullName?: string;
        email: string;
        mobileNo?: string;
        profileImageUrl?: string;
        bio?: string;
        professionalTitle?: string;
        location?: string;
        areaOfExpertise?: string[];
        yearsOfExperience?: number;
        roleSpecificData?: {
          industry?: string;
          activities?: string[];
          socialLinks?: Record<string, string>;
        };
        isProfileComplete: boolean;
        createdAt: string;
        availability?: {
          dates: string[];
          eventTypes: unknown[];
          modes: string[];
          timeSlots: unknown[];
        };
        customTags?: string[];
        notes?: string;
      };

      // Always process saved speakers data
      const speakerData = speakerObj;
      const customTags = speakerObj.customTags || [];

      // Extract all available data from the speaker object
      const {
        _id,
        firstName,
        lastName,
        fullName,
        email,
        mobileNo,
        profileImageUrl,
        bio,
        professionalTitle,
        location,
        areaOfExpertise,
        yearsOfExperience,
        roleSpecificData,
        isProfileComplete,
        createdAt,
        availability
      } = speakerData;

      // Extract role-specific data
      const industry = roleSpecificData?.industry;
      const activities = roleSpecificData?.activities || [];
      const socialLinks = roleSpecificData?.socialLinks;

      // Always merge custom tags with areaOfExpertise for saved speakers
      // Remove duplicates to prevent showing the same tag twice
      const allTags = [...(areaOfExpertise || []), ...(customTags || [])];
      const mergedTags = [...new Set(allTags)]; // Remove duplicates using Set
      
      // Debug logging
      console.log('🔍 Tag merging for speaker:', {
        speakerId: _id,
        areaOfExpertise,
        customTags,
        mergedTags,
        duplicateRemoved: allTags.length !== mergedTags.length
      });

      // Create specializations from merged tags and activities
      const specializations = [
        ...mergedTags,
        ...(activities || [])
      ].filter((spec, index, arr) => arr.indexOf(spec) === index);

      // Calculate rating and bookings (mock data for now, can be enhanced later)
      const rating = 4.5; // Default rating
      const totalBookings = 0; // Default bookings

      // Create price range (mock data for now, can be enhanced later)
      const priceRange = {
        min: 3000,
        max: 10000,
        currency: 'INR'
      };

        return {
          _id: _id,  // ✅ Fixed: Use _id instead of id
          fullName: fullName || `${firstName || ''} ${lastName || ''}`.trim() || 'Speaker',
          name: fullName || `${firstName || ''} ${lastName || ''}`.trim() || 'Speaker',
          title: professionalTitle || 'Speaker',
          rating: rating,
          bookings: totalBookings,
          location: location || 'Location not specified',
          price: priceRange.min,
          priceRange: priceRange,
          tags: mergedTags, // ✅ Now includes both areaOfExpertise and customTags
          specializations: specializations,
          specialization: industry || 'General',
          avatar: profileImageUrl,
          bio: bio,
          yearsOfExperience: yearsOfExperience || 0,
          isProfileComplete: isProfileComplete || false,
          updatedAt: new Date().toISOString(), // Add missing updatedAt

          // Additional details for enhanced display
          firstName: firstName,
          lastName: lastName,
          email: email,
          mobileNo: mobileNo,
          industry: industry,
          activities: activities,
          socialLinks: socialLinks as Record<string, string> | undefined,
          createdAt: createdAt || new Date().toISOString(),
          availability: availability as {
            dates: string[];
            eventTypes: unknown[];
            modes: string[];
            timeSlots: unknown[];
          } | undefined,

          // Saved speaker specific data
          isSavedSpeaker: true, // Always true since we only show saved speakers
          customTags: customTags,
          savedSpeakerId: speakerObj._id, // The saved speaker record ID
          notes: speakerObj.notes || '',

          // Raw speaker data for detailed view
          rawData: speakerObj as Record<string, unknown>
        };
    });
  }, [currentData]);

  // Sort speakers
  const sortedSpeakers = useMemo(() => {
    const sorted = [...processedSpeakers];

    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'experience':
        return sorted.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
      case 'reviews':
        return sorted.sort((a, b) => b.bookings - a.bookings);
      default:
        return sorted;
    }
  }, [processedSpeakers, sortBy]);

  const handleAddSpeaker = () => {
    // Navigate to add speaker page
    console.log('Navigate to add speaker page');
  };

  // Remove toggle functionality - always show saved speakers only

  // Remove handleSaveSpeaker since we only show saved speakers

  // Debug: Test saved speakers API directly
  const testSavedSpeakersAPI = async () => {
    try {
      console.log('🧪 Testing saved speakers API directly...');
      const response = await fetch('/api/speaker-search/saved', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Direct API test successful:', data);
      } else {
        const errorText = await response.text();
        console.error('❌ Direct API test failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Direct API test error:', error);
    }
  };

  // Loading state
  if (currentLoading && processedSpeakers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)]">
        <div className="flex justify-center items-center min-h-96">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-600">Loading speakers...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (currentError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)]">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading speakers</h3>
            <p className="text-gray-600 mb-4">
              {'Something went wrong while fetching speakers.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)]">
      {/* Header with Add Speaker Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Saved Speakers Database</h2>
          <p className="text-gray-600 text-sm">
            Manage your saved speakers with custom tags and notes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Debug: Test API button */}
          {/* <button 
            onClick={testSavedSpeakersAPI}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test API
          </button> */}
          
        <button 
          onClick={handleAddSpeaker}
          className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#FF6B35]/90 font-medium"
        >
          <Plus size={16} />
          <span>Add Speaker</span>
        </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search speaker by name, expertise, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#FF6B35] bg-[#FF6B35]/15 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
          />
        </div>

          {/* Tag Filter */}
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-7 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
          >
            <option>All Tags</option>
            {customTagsData?.data?.customTags ? (
              customTagsData.data.customTags.map((tag: string) => (
                <option key={tag} value={tag}>{tag}</option>
              ))
            ) : (
              <>
                <option>Conference & Summits</option>
                <option>Workshops</option>
                <option>Keynote Speeches</option>
                <option>Seminars</option>
              </>
            )}
          </select>

          {/* Clear Search */}
          {hasActiveSearch && (
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear search
            </button>
          )}

          {/* Results Count */}
          <div className="px-2 py-2 rounded-xl text-center font-medium">
            {processedSpeakers.length} saved speakers found
          </div>
          
          {/* Debug Info */}
          {/* <div className="px-2 py-2 rounded-xl text-center text-xs text-gray-500">
            {isLoadingSaved ? '⏳ Loading saved speakers...' : 
             savedError ? '❌ Error loading saved speakers' :
             `✅ Loaded ${(savedSpeakersData?.data as { speakers?: unknown[] })?.speakers?.length || 0} saved speakers`}
          </div> */}
        </div>

        {/* Sort Dropdown */}
        <div className="relative w-40">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm w-full"
          >
            <option value="relevance">Relevance</option>
            <option value="rating">Rating</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="experience">Experience</option>
            <option value="reviews">Most Reviews</option>
        </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Speaker Cards Grid */}
      {processedSpeakers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No saved speakers found
          </h3>
          <p className="text-gray-600 mb-4">
            {hasActiveSearch
              ? `No saved speakers found for "${debouncedSearchQuery}". Try different keywords.`
              : 'You haven\'t saved any speakers yet. Save speakers from the main speaker list to see them here.'
            }
          </p>
          {hasActiveSearch && (
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-3 gap-6">
          {sortedSpeakers.map((speaker) => (
            <SpeakerCard
              key={speaker._id}
              speaker={speaker}
              isCompact={false}
              // Remove save functionality since we only show saved speakers
              showSaveButton={false}
            />
        ))}
      </div>
      )}
    </div>
  );
}