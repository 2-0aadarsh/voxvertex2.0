'use client';

import React, { useState } from 'react';
import { Plus, Search, Loader2, AlertCircle, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { 
  useGetSpeakerBookingsQuery,
  useAcceptBookingMutation,
  useDeclineBookingMutation,
  type SpeakerBooking,
  type SpeakerBookingsData
} from '@/store/api/speakerBookingsApi';
import { useAuth } from '@/store/hooks';
import OrganizerCard from './parts/OrganizerCard';

interface SpeakerBookingManagementProps {
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

export default function SpeakerBookingManagement({ onTabChange, activeTab }: SpeakerBookingManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('All Tags');
  const { isAuthenticated } = useAuth();

  // RTK Query hooks
  const { 
    data: apiData, 
    error: apiError, 
    isLoading: apiLoading,
    refetch 
  } = useGetSpeakerBookingsQuery({}, {
    skip: !isAuthenticated,
  });

  const [acceptBooking, { isLoading: isAccepting }] = useAcceptBookingMutation();
  const [declineBooking, { isLoading: isDeclining }] = useDeclineBookingMutation();

  // Extract data from API response
  const bookings: SpeakerBookingsData = apiData?.data?.bookings || {
    pending: [],
    accepted: [],
    declined: []
  };

  const counts = apiData?.data?.counts || {
    pending: 0,
    accepted: 0,
    declined: 0,
    total: 0
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await acceptBooking(bookingId).unwrap();
      console.log('Booking accepted successfully');
    } catch (error) {
      console.error('Failed to accept booking:', error);
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      await declineBooking(bookingId).unwrap();
      console.log('Booking declined successfully');
    } catch (error) {
      console.error('Failed to decline booking:', error);
    }
  };

  const handleViewDetails = (bookingId: string) => {
    console.log('View details for booking:', bookingId);
    // TODO: Implement navigation to booking details page
  };

  const handleMessage = (conversationId: string) => {
    console.log('Navigate to conversation:', conversationId);
    // TODO: Implement navigation to messages
  };

  // Filter bookings based on search term
  const filterBookings = (bookingList: SpeakerBooking[]) => {
    if (!searchTerm) return bookingList;
    
    return bookingList.filter(booking => 
      booking.organizer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.organizer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredPendingBookings = filterBookings(bookings.pending);
  const filteredAcceptedBookings = filterBookings(bookings.accepted);
  const filteredDeclinedBookings = filterBookings(bookings.declined);

  if (apiError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="ml-64 pt-20">
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Bookings</h3>
              <p className="text-red-600 mb-4">
                {apiError && 'data' in apiError 
                  ? (apiError.data as any)?.message || 'Failed to load bookings'
                  : 'Failed to load bookings'
                }
              </p>
              <button
                onClick={handleRefresh}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="ml-64 pt-20">
        <div className="p-8">
          <div className="bg-gradient-to-r from-[#FF6B35] via-[#FFB194] to-[#FFCBB8] rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">Booking Management</h1>
            <p className="text-white">
              Manage your speaking opportunities and organizer proposals
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-50 p-1 rounded-lg mb-6 flex">
            <button
              onClick={() => onTabChange?.('Booking Management')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'Booking Management'
                  ? 'text-white bg-[#FF6B35]'
                  : 'text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35]'
              }`}
            >
              Booking Management
            </button>
            <button
              onClick={() => onTabChange?.('Documents')}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'Documents'
                  ? 'text-white bg-[#FF6B35]'
                  : 'text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35]'
              }`}
            >
              Documents
            </button>
          </div>

          {/* Booking Management Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Booking Management</h2>
                <p className="text-gray-600">Manage your speaker relationships and bookings</p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={apiLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${apiLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search organizer by name, event, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="All Tags">All Tags</option>
                  <option value="Conference">Conference</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Webinar">Webinar</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {apiLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Loading bookings...</span>
              </div>
            )}

            {/* Booking Columns */}
            {!apiLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* In Progress Column */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-orange-500" />
                      In Progress
                    </h3>
                    <span className="bg-orange-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                      {filteredPendingBookings.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {filteredPendingBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No pending bookings</p>
                      </div>
                    ) : (
                      filteredPendingBookings.map((booking) => (
                        <OrganizerCard
                          key={booking._id}
                          booking={booking}
                          onAccept={handleAcceptBooking}
                          onDecline={handleDeclineBooking}
                          onViewDetails={handleViewDetails}
                          onMessage={handleMessage}
                          isLoading={isAccepting || isDeclining}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Confirmed Column */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Confirmed
                    </h3>
                    <span className="bg-green-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                      {filteredAcceptedBookings.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {filteredAcceptedBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No confirmed bookings</p>
                      </div>
                    ) : (
                      filteredAcceptedBookings.map((booking) => (
                        <OrganizerCard
                          key={booking._id}
                          booking={booking}
                          onAccept={handleAcceptBooking}
                          onDecline={handleDeclineBooking}
                          onViewDetails={handleViewDetails}
                          onMessage={handleMessage}
                          isLoading={isAccepting || isDeclining}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Declined Column */}
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <XCircle className="w-5 h-5 mr-2 text-red-500" />
                      Declined
                    </h3>
                    <span className="bg-red-500 text-white text-sm font-medium px-2 py-1 rounded-full">
                      {filteredDeclinedBookings.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {filteredDeclinedBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No declined bookings</p>
                      </div>
                    ) : (
                      filteredDeclinedBookings.map((booking) => (
                        <OrganizerCard
                          key={booking._id}
                          booking={booking}
                          onAccept={handleAcceptBooking}
                          onDecline={handleDeclineBooking}
                          onViewDetails={handleViewDetails}
                          onMessage={handleMessage}
                          isLoading={isAccepting || isDeclining}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
