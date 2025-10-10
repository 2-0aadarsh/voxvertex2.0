import React from 'react'
import Box from './box'
import { useGetPublishedEventsQuery } from '@/store/slices/enhancedEventSlice'
import { Loader2, AlertCircle } from 'lucide-react'

export default function Grid() {
  // Fetch published enhanced events
  const { 
    data: eventsData, 
    isLoading, 
    error,
    refetch 
  } = useGetPublishedEventsQuery({
    page: 1,
    limit: 12, // Show up to 12 events
    sortBy: 'startDate',
    sortOrder: 'asc'
  });

  const events = eventsData?.data?.events || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35] mb-2" />
          <p className="text-gray-600 text-sm">Loading events...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-600 text-sm">Failed to load events</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!events || events.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <div className="w-16 h-16 mx-auto mb-2 text-gray-300">
              📅
            </div>
            <p className="text-gray-400 font-medium">No events available</p>
            <p className="text-sm text-gray-400">Check back later for new events</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-10 mt-4 mb-4">
      {events.map((event: any) => (
        <Box key={event._id} event={event} />
      ))}
    </div>
  )
}