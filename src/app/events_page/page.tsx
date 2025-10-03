'use client'

import { useState } from 'react'
import { 
  Search, 
  Eye, 
  Trash2, 
  Calendar, 
  ChevronDown,
  X,
  AlertTriangle,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/store/hooks'
import { useGetCurrentUserQuery } from '@/store/slices/authSlice'
import { 
  useGetUserEventsQuery, 
  useDeleteEventMutation
} from '@/store/slices/enhancedEventSlice'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import type { EnhancedEvent } from './types/eventTypes'

export default function EventManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<EnhancedEvent | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [currentPage] = useState(1)
  
  // Authentication hooks
  const { user, isAuthenticated } = useAuth()
  const { data: currentUserData } = useGetCurrentUserQuery()
  
  // API hooks
  const { 
    data: eventsData, 
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents 
  } = useGetUserEventsQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter === 'All Statuses' ? undefined : statusFilter.toLowerCase() as 'draft' | 'published' | 'cancelled'
  })
  
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation()

  // Helper function to get profile image URL
  const getProfileImageUrl = (url: string | null | undefined) => {
    if (!url) {
      return null;
    }
    
    // If it's already a URL string, return it
    if (typeof url === 'string') {
      return url;
    }
    
    return null;
  };

  // Get events from API
  const events = eventsData?.data?.events || []
  
  // Debug logging
  console.log('🔍 Events Page Debug:', {
    eventsData,
    events,
    eventsCount: events.length,
    isLoading: isLoadingEvents,
    error: eventsError
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'published':
        return 'Published'
      case 'draft':
        return 'Draft'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const filteredEvents = events.filter((event: EnhancedEvent) => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All Statuses' || event.status === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDeleteClick = (event: EnhancedEvent) => {
    setEventToDelete(event)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation === 'DELETE' && eventToDelete) {
      try {
        await deleteEvent(eventToDelete._id).unwrap()
        setShowDeleteModal(false)
        setEventToDelete(null)
        setDeleteConfirmation('')
        // Refetch events to update the list
        refetchEvents()
      } catch (error) {
        console.error('Failed to delete event:', error)
        // Handle error (show toast notification, etc.)
      }
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setEventToDelete(null)
    setDeleteConfirmation('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#FF6B35]/20 z-40"></div>
      )}
      
      <Navbar 
        user={user || undefined}
        currentUserData={currentUserData}
        isAuthenticated={isAuthenticated}
        forceHomepageStyle={true}
        getProfileImageUrl={getProfileImageUrl}
      />
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64  bg-orange-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
              <p className="text-gray-600 mt-1">View, create, and manage all your events.</p>
            </div>
            <Link 
              href="/events_page/create"
              className="bg-[#FF6B35] hover:bg-orange-600 text-white px-10 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Create Event</span>
            </Link>
          </div>

          {/* Main Content Card */}
          <main className="bg-white rounded-lg shadow-sm p-8">

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF6B35] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                />
              </div>
              <div className="relative w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 w-full focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                >
                  <option>All Statuses</option>
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Postponed</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Events Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-[#FF6B35]/15">
                  <tr>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Event Title</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Attendees</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Revenue</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingEvents ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Loading events...
                      </td>
                    </tr>
                  ) : filteredEvents.map((event: EnhancedEvent) => (
                    <tr key={event._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{event.eventName}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{formatDate(event.startDate)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusDisplayName(event.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {event.totalTicketsSold || 0}/{event.totalCapacity || 0}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        ${event.totalRevenue || 0}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <Link 
                            href={`/events_view/${event._id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {/* <Link 
                            href={`/events_page/edit/${event._id}`}
                            className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Link> */}
                          <button 
                            onClick={() => handleDeleteClick(event)}
                            disabled={isDeleting}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'All Statuses' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first event.'
                  }
                </p>
                <Link 
                  href="/events_page/create"
                  className="bg-[#FF6B35] hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Create Your First Event</span>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && eventToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-[#FF6B35]">Delete Event</h2>
              </div>
              <button 
                onClick={handleDeleteCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete &ldquo;{eventToDelete.eventName}&rdquo;? This action cannot be undone and will permanently remove the event and all associated data.
              </p>

              {/* Warning Box */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">Warning:</h3>
                    <ul className="text-sm text-red-600 space-y-1">
                      <li>• All event data will be permanently deleted</li>
                      <li>• Attendee registrations will be lost</li>
                      <li>• Payment records will remain but be orphaned</li>
                      <li>• This action cannot be reversed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  To confirm deletion, type DELETE in the field below:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE to Confirm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmation !== 'DELETE'}
                className={`px-4 py-2 rounded-lg font-medium ${
                  deleteConfirmation === 'DELETE'
                    ? 'bg-[#FF6B35] hover:bg-orange-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}