'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SpeakerCard from './parts/SpeakerCard';
import { Plus, Search, Loader2, AlertCircle, RefreshCw, User } from 'lucide-react';
import { 
  useGetOrganizerBookingsQuery,
  selectOrganizerBookings,
  selectOrganizerBookingsStats,
  selectOrganizerBookingsLoading,
  selectOrganizerBookingsError,
  type Booking
} from '@/store/slices/organizerBookingsSlice';
import { useAuth } from '@/store/hooks';

// Type for converted speaker data
interface ConvertedSpeaker {
  id: string;
  name: string;
  expertise?: string;
  date: string;
  price: number;
  image: string;
  status: 'In Progress' | 'Confirmed' | 'Declined';
  tags: string[];
  timeAgo: string;
  bookingId?: string;
  originalBooking?: unknown;
}

export default function SpeakerManagementPage({ onTabChange }: { onTabChange?: (tab: string) => void; activeTab?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('All Tags');
  const { isAuthenticated } = useAuth();

  // Redux state selectors
  const bookings = useSelector(selectOrganizerBookings);
  const stats = useSelector(selectOrganizerBookingsStats);
  const isLoading = useSelector(selectOrganizerBookingsLoading);
  const error = useSelector(selectOrganizerBookingsError);

  // RTK Query hook for fetching data
  const { 
    data: apiData, 
    error: apiError, 
    isLoading: apiLoading,
    refetch 
  } = useGetOrganizerBookingsQuery(undefined, {
    skip: !isAuthenticated, // Only fetch if authenticated
  });

  // Update local state when API data changes
  useEffect(() => {
    if (apiData) {
      // Data is automatically handled by RTK Query
      console.log('📊 Organizer bookings loaded:', apiData);
    }
  }, [apiData]);

  const handleAddSpeaker = () => {
    // Navigate to add speaker page
    console.log('Navigate to add speaker page');
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleViewDetails = (bookingId: string) => {
    // Navigate to booking details or open modal
    console.log('View details for booking:', bookingId);
    // TODO: Implement navigation to booking details page
  };

  // Convert Booking to Speaker format for compatibility
  const convertBookingToSpeaker = React.useCallback((booking: Booking): ConvertedSpeaker => ({
    id: booking._id,
    name: `${booking.speaker.firstName} ${booking.speaker.lastName}`,
    expertise: booking.speaker.expertise || undefined,
    date: new Date(booking.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    price: booking.compensationAndArrangements.primaryCompensation.speakerFeeAmount,
    image: booking.speaker.profileImageUrl || '',
    status: getDisplayStatus(booking.status),
    tags: [booking.eventDetails.type],
    timeAgo: booking.timeAgo,
    bookingId: booking.bookingId,
    originalBooking: booking as unknown
  }), []);

  const getDisplayStatus = (status: string): 'In Progress' | 'Confirmed' | 'Declined' => {
    switch (status) {
      case 'pending':
      case 'negotiating':
        return 'In Progress';
      case 'accepted':
        return 'Confirmed';
      case 'declined':
      case 'cancelled':
        return 'Declined';
      default:
        return 'In Progress';
    }
  };

  // Get speakers from Redux state or API data
  const speakers = React.useMemo(() => {
    const data = bookings || apiData?.data;
    if (!data) return [];

    const allBookings = [
      ...data.inProgress.map(convertBookingToSpeaker),
      ...data.confirmed.map(convertBookingToSpeaker),
      ...data.declined.map(convertBookingToSpeaker),
    ];

    return allBookings;
  }, [bookings, apiData, convertBookingToSpeaker]);

  const getStatusConfig = (status: 'In Progress' | 'Confirmed' | 'Declined') => {
    switch (status) {
      case 'In Progress':
        return { 
          bgColor: 'bg-[#42A4FF]/10', 
          borderColor: 'border-[#42A4FF]',
          textColor: 'text-[#42A4FF]',
          badgeColor: 'bg-[#FF6B35]'
        };
      case 'Confirmed':
        return { 
          bgColor: 'bg-[#15823B]/10', 
          borderColor: 'border-[#15823B]',
          textColor: 'text-[#15823B]',
          badgeColor: 'bg-[#FF6B35]'
        };
      case 'Declined':
        return { 
          bgColor: 'bg-[#DC2626]/10', 
          borderColor: 'border-[#DC2626]',
          textColor: 'text-[#DC2626]',
          badgeColor: 'bg-[#FF6B35]'
        };
      default:
        return { 
          bgColor: 'bg-gray-100', 
          borderColor: 'border-gray-300',
          textColor: 'text-gray-600',
          badgeColor: 'bg-gray-400'
        };
    }
  };

  const filteredSpeakers = speakers.filter(speaker => {
    const matchesSearch = speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (speaker.expertise || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const groupedSpeakers = {
    'In Progress': filteredSpeakers.filter(s => s.status === 'In Progress'),
    'Confirmed': filteredSpeakers.filter(s => s.status === 'Confirmed'),
    'Declined': filteredSpeakers.filter(s => s.status === 'Declined')
  };

  // Loading state
  if (apiLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="ml-64 pt-20 p-6">
          <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md mb-6">
            <h1 className="text-2xl font-bold text-black mb-2">Speaker Management</h1>
            <p className="text-white">Manage your speakers, bookings, and payments in one place</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF6B35] mx-auto mb-4" />
              <p className="text-gray-600">Loading speaker bookings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError || error) {
    const errorMessage = (apiError as { data?: { message?: string } })?.data?.message || error || 'Failed to load speaker bookings';
    return (
      <div className="min-h-screen bg-white">
        <div className="ml-64 pt-20 p-6">
          <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md mb-6">
            <h1 className="text-2xl font-bold text-black mb-2">Speaker Management</h1>
            <p className="text-white">Manage your speakers, bookings, and payments in one place</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)] flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{errorMessage}</p>
              <button
                onClick={handleRefresh}
                className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#FF6B35]/90 font-medium mx-auto"
              >
                <RefreshCw size={16} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="ml-64 pt-20">
        
        {/* Orange Header Card */}
        <div className="p-6">
          <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md mb-6">
            <h1 className="text-2xl font-bold text-black mb-2">Speaker Management</h1>
            <p className="text-white">Manage your speakers, bookings, and payments in one place</p>
          </div>

          {/* Navigation Tabs - Full Width */}
          <div className="bg-gray-50 p-1 rounded-lg mb-6 flex">
            <button 
              onClick={() => onTabChange?.('Speaker Database')}
              className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
            >
              Speaker Database
            </button>
            <button className="flex-1 text-white bg-[#FF6B35] py-3 px-4 rounded-md font-medium">
              Speaker Management
            </button>
            <button 
              onClick={() => onTabChange?.('Documents')}
              className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
            >
              Documents
            </button>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)]">
            {/* Header with Add Speaker Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Speaker Management</h2>
                <p className="text-gray-600 text-sm">
                  {stats ? `${stats.total} total bookings • ${stats.inProgress} in progress • ${stats.confirmed} confirmed • ${stats.declined} declined` : 'Manage your speaker relationships and bookings'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  className="text-gray-600 hover:text-[#FF6B35] p-2 rounded-lg hover:bg-gray-100"
                  title="Refresh data"
                >
                  <RefreshCw size={16} />
                </button>
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
            <div className="flex items-center space-x-10 mb-6">
              <div className="relative flex-1 max-w-3xl">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search speaker by name, expertise, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#FF6B35] bg-[#FF6B35]/15 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
                />
              </div>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="px-7 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
              >
                <option>All Tags</option>
                <option>Conference & Summits</option>
                <option>Workshops</option>
              </select>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-3 gap-6 h-full">
              {Object.entries(groupedSpeakers).map(([status, speakers]) => {
                const statusConfig = getStatusConfig(status as 'In Progress' | 'Confirmed' | 'Declined');
                return (
                  <div key={status} className="flex flex-col h-full">
                    {/* Column Header */}
                    <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-1  rounded-t-md p-4`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${statusConfig.textColor}`}>{status} </h3>
                        <span className={`${statusConfig.badgeColor} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                          {speakers.length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Speaker Cards - Stretch to bottom with minimum height */}
                    <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-1 border-t-0 rounded-b-xl p-4 space-y-4 flex-1 min-h-[200px]`}>
                      {speakers.length > 0 ? (
                        speakers.map((speaker) => (
                          <SpeakerCard 
                            key={speaker.id} 
                            speaker={speaker}
                            showAttachButton={status === 'Confirmed'}
                            onViewDetails={handleViewDetails}
                          />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                            <User size={24} className="text-gray-400" />
                          </div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">No {status.toLowerCase()} speakers</h4>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {status === 'In Progress' && "No speakers are currently being processed"}
                            {status === 'Confirmed' && "No speakers have been confirmed yet"}
                            {status === 'Declined' && "No speakers have been declined"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}