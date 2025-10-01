'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Eye, 
  Trash2, 
  Calendar, 
  ChevronDown,
  X,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/store/hooks'
import { useGetCurrentUserQuery } from '@/store/slices/authSlice'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

interface Event {
  id: string
  title: string
  date: string
  status: 'Published' | 'Draft' | 'Postponed'
  attendees: string
  revenue: string
}

export default function EventManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  
  // Authentication hooks
  const { user, isAuthenticated } = useAuth()
  const { data: currentUserData } = useGetCurrentUserQuery()

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: { data?: Buffer | string; contentType?: string; url?: string } | string | null) => {
    if (!profileImage) {
      return null;
    }
    
    // Check if it's already a URL string
    if (typeof profileImage === 'string') {
      return profileImage;
    }
    
    // Check if it has data and contentType (binary data)
    if (profileImage.data && profileImage.contentType) {
      const dataUrl = `data:${profileImage.contentType};base64,${profileImage.data.toString('base64')}`;
      return dataUrl;
    }
    
    // Check if it has a url property
    if (profileImage.url) {
      return profileImage.url;
    }
    
    return null;
  };

  // Sample event data
  useEffect(() => {
    const sampleEvents: Event[] = [
      {
        id: '1',
        title: 'Innovate 2025',
        date: 'Sep 4, 2025',
        status: 'Published',
        attendees: '250/300',
        revenue: '$12,500'
      },
      {
        id: '2',
        title: 'Tech Summit 2025',
        date: 'Sep 10, 2025',
        status: 'Draft',
        attendees: '0/500',
        revenue: '$0'
      },
      {
        id: '3',
        title: 'AI Conference',
        date: 'Sep 15, 2025',
        status: 'Published',
        attendees: '180/200',
        revenue: '$9,000'
      },
      {
        id: '4',
        title: 'Digital Marketing Workshop',
        date: 'Sep 20, 2025',
        status: 'Postponed',
        attendees: '50/100',
        revenue: '$2,500'
      }
    ]
    setEvents(sampleEvents)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800'
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'Postponed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All Statuses' || event.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmation === 'DELETE' && eventToDelete) {
      setEvents(events.filter(e => e.id !== eventToDelete.id))
      setShowDeleteModal(false)
      setEventToDelete(null)
      setDeleteConfirmation('')
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
      <div className="ml-64 pt-16 bg-orange-50 min-h-screen">
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
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{event.title}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{event.date}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{event.attendees}</td>
                      <td className="py-4 px-4 text-gray-600">{event.revenue}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(event)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
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
                Are you sure you want to delete &ldquo;{eventToDelete.title}&rdquo;? This action cannot be undone and will permanently remove the event and all associated data.
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