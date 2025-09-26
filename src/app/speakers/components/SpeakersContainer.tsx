// ============================================================================
// SPEAKERS CONTAINER - Optimized Speaker Data Fetching
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  useGetSpeakersQuery,
  useSearchSpeakersQuery,
  useGetSpeakerSuggestionsQuery,
  useGetAvailableEventTypesQuery,
  selectSpeakers,
  selectSpeakersFilters,
  selectSpeakersLoading,
  selectSpeakersError,
  setFilters,
  clearFilters,
} from '@/store/slices/speakersSlice';
import SpeakerCard from './SpeakerCard';
import FiltersSidebar from './FiltersSidebar';
import { Speaker } from '@/store/types';

interface SpeakersContainerProps {
  initialFilters?: {
    searchQuery?: string;
    location?: string;
    expertise?: string[];
    yearsOfExperience?: number;
    availabilityDate?: string;
    eventTypes?: string[];
    priceRange?: { min: number; max: number };
  };
}

const SpeakersContainer: React.FC<SpeakersContainerProps> = ({ 
  initialFilters = {} 
}) => {
  const dispatch = useAppDispatch();
  
  // Local state for UI
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Redux state
  const filters = useAppSelector(selectSpeakersFilters);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Update filters when search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== filters.searchQuery) {
      dispatch(setFilters({ searchQuery: debouncedSearchQuery }));
    }
  }, [debouncedSearchQuery, filters.searchQuery, dispatch]);
  
  // Determine which query to use
  const hasActiveFilters = useMemo(() => {
    return !!(
      debouncedSearchQuery ||
      filters.location ||
      filters.expertise?.length ||
      filters.yearsOfExperience ||
      filters.availabilityDate ||
      filters.eventTypes?.length ||
      (filters.priceRange.min > 0 || filters.priceRange.max < 10000)
    );
  }, [debouncedSearchQuery, filters]);
  
  // API queries
  const {
    data: basicSpeakersData,
    isLoading: isLoadingBasic,
    error: basicError,
  } = useGetSpeakersQuery(
    { page: 1, limit: 12 },
    { skip: hasActiveFilters } // Only fetch if no filters
  );
  
  const {
    data: filteredSpeakersData,
    isLoading: isLoadingFiltered,
    error: filteredError,
  } = useSearchSpeakersQuery(
    {
      q: debouncedSearchQuery,
      page: 1,
      limit: 12,
      location: filters.location,
      expertise: filters.expertise,
      yearsOfExperience: filters.yearsOfExperience,
      availabilityDate: filters.availabilityDate,
      eventTypes: filters.eventTypes,
      minFee: filters.priceRange.min,
      maxFee: filters.priceRange.max,
    },
    { skip: !hasActiveFilters } // Only fetch if filters are active
  );
  
  // Get suggestions for autocomplete (commented out for now to avoid unused variables)
  // const {
  //   data: suggestionsData,
  //   isLoading: isLoadingSuggestions,
  // } = useGetSpeakerSuggestionsQuery(
  //   { q: debouncedSearchQuery, limit: 5 },
  //   { skip: debouncedSearchQuery.length < 2 }
  // );
  
  // Get available event types for filters
  const {
    data: eventTypesData,
    isLoading: isLoadingEventTypes,
  } = useGetAvailableEventTypesQuery();
  
  // Determine which data to use
  const currentData = hasActiveFilters ? filteredSpeakersData : basicSpeakersData;
  const currentLoading = hasActiveFilters ? isLoadingFiltered : isLoadingBasic;
  const currentError = hasActiveFilters ? filteredError : basicError;
  
  // Process speakers data with enhanced details
  const processedSpeakers = useMemo(() => {
    if (!currentData?.data?.speakers) return [];
    
    return currentData.data.speakers.map((speaker: Speaker) => {
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
      } = speaker;

      // Extract role-specific data
      const industry = roleSpecificData?.industry;
      const activities = roleSpecificData?.activities || [];
      const socialLinks = roleSpecificData?.socialLinks;

      // Create comprehensive tags array from all available sources
      const tags = [
        ...(areaOfExpertise || []),
        ...(activities || []),
        ...(industry ? [industry] : [])
      ].filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates

      // Create specializations from areaOfExpertise and activities
      const specializations = [
        ...(areaOfExpertise || []),
        ...(activities || [])
      ].filter((spec, index, arr) => arr.indexOf(spec) === index);

      // Calculate rating and bookings (mock data for now, can be enhanced later)
      const rating = 4.5; // Default rating
      const totalBookings = 0; // Default bookings

      // Create price range (mock data for now, can be enhanced later)
      const priceRange = {
        min: 3000,
        max: 10000,
        currency: 'USD'
      };

      return {
        id: _id,
        name: fullName,
        title: professionalTitle || 'Speaker',
        rating: rating,
        bookings: totalBookings,
        location: location || 'Location not specified',
        price: priceRange.min,
        priceRange: priceRange,
        tags: tags,
        specializations: specializations,
        specialization: industry || 'General',
        avatar: profileImageUrl,
        bio: bio,
        yearsOfExperience: yearsOfExperience || 0,
        isProfileComplete: isProfileComplete,
        
        // Additional details for enhanced display
        firstName: firstName,
        lastName: lastName,
        email: email,
        mobileNo: mobileNo,
        industry: industry,
        activities: activities,
        socialLinks: socialLinks,
        createdAt: createdAt,
        availability: availability,
        
        // Raw speaker data for detailed view
        rawData: speaker
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
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    dispatch(setFilters(newFilters));
  };
  
  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchQuery('');
  };
  
  // Loading state
  if (currentLoading && processedSpeakers.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  // Error state
  if (currentError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading speakers</h3>
        <p className="text-gray-600 mb-4">
          {currentError?.message || 'Something went wrong while fetching speakers.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Section */}
      <div 
        className="rounded-lg p-6 mb-6 bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/ai.png)' }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {hasActiveFilters ? `Search Results` : 'Speaker Marketplace'}
            </h1>
            <p className="text-gray-600">
              {hasActiveFilters 
                ? `Found ${processedSpeakers.length} speaker(s) matching your criteria`
                : 'Discover and book expert speakers for your events'
              }
            </p>
          </div>
          <div className="bg-[#FF6B35] text-white px-4 py-2 rounded-full font-medium">
            {processedSpeakers.length} speakers found
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left side - Search and Filters */}
          <div className="flex items-center gap-4 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search speakers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Filters Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-[#FF6B35] text-white hover:bg-orange-600' 
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filters
            </button>
            
            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Right side - Sort dropdown */}
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
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
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex gap-8 ${showFilters ? '' : 'justify-center'}`}>
        {/* Filters Sidebar */}
        {showFilters && (
          <FiltersSidebar 
            filters={filters}
            onFilterChange={handleFilterChange}
            availableEventTypes={eventTypesData?.data || []}
            isLoadingEventTypes={isLoadingEventTypes}
          />
        )}
        
        {/* Speaker Grid */}
        <div className="flex-1">
          {processedSpeakers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No speakers found</h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No speakers are currently available.'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className={`grid gap-4 ${showFilters ? 'grid-cols-2' : 'grid-cols-3 max-w-6xl mx-auto'}`}>
              {sortedSpeakers.map((speaker) => (
                <SpeakerCard 
                  key={speaker.id} 
                  speaker={speaker} 
                  isCompact={showFilters}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeakersContainer;
