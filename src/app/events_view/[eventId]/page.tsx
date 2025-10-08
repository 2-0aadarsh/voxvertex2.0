'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  AlertTriangle
} from 'lucide-react'
import Overview from './components/Overview'
import Participants from './components/Participants'
import Actions from './components/Actions'
import { useGetEventByIdQuery } from '@/store/slices/enhancedEventSlice'
import type { EnhancedEvent } from '@/app/events_page/types/eventTypes'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/store/hooks'
import { useGetCurrentUserQuery } from '@/store/slices/authSlice'

// Enhanced Event interface matching the one from events_page
interface Event {
  id: string
  title: string
  date: string
  status: 'Published' | 'Draft' | 'Postponed'
  attendees: string
  revenue: string
  description: string
  mode: 'Online' | 'Offline' | 'Hybrid'
  eventUrl?: string
  location?: string
  time: string
  duration: string
  capacity: number
  price: number
  image: string
  startDate: string
  endDate: string
  format: string
  tags: string[]
  ticketTypes: Array<{
    type: string
    price: number
    sold: number
    total: number
    percentage: number
  }>
  speakers: Array<{
    name: string
    title: string
    bio: string
    image?: string
    expertise?: string
  }>
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'actions'>('overview')
  
  // Authentication hooks
  const { user, isAuthenticated } = useAuth()
  const { data: currentUserData } = useGetCurrentUserQuery()
  
  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: any) => {
    if (!profileImage) return null;
    
    // Handle string URLs
    if (typeof profileImage === 'string') {
      if (profileImage.startsWith('http')) return profileImage;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`;
    }
    
    // Handle object with data and contentType (Buffer)
    if (typeof profileImage === 'object' && (profileImage as any).data && (profileImage as any).contentType) {
      const dataUrl = `data:${(profileImage as any).contentType};base64,${((profileImage as any).data as { toString: (encoding: string) => string }).toString('base64')}`;
      return dataUrl;
    }
    
    // Handle object with url property
    if (typeof profileImage === 'object' && (profileImage as any).url) {
      if ((profileImage as any).url.startsWith('http')) return (profileImage as any).url;
      return `https://res.cloudinary.com/demo/image/fetch/${(profileImage as any).url}`;
    }
    
    return null;
  };
  
  // Fetch event data from API
  const { 
    data: eventData, 
    isLoading: loading, 
    error: apiError,
    refetch: refetchEvent
  } = useGetEventByIdQuery(eventId, {
    skip: !eventId
  })

  // Transform EnhancedEvent to Event interface
  const transformEnhancedEventToEvent = (enhancedEvent: EnhancedEvent): Event => {
    const startDate = new Date(enhancedEvent.startDate)
    const endDate = new Date(enhancedEvent.endDate)
    
    return {
      id: enhancedEvent._id,
      title: enhancedEvent.eventName,
      date: startDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      status: enhancedEvent.status === 'published' ? 'Published' : 
              enhancedEvent.status === 'draft' ? 'Draft' : 'Postponed',
      attendees: `${enhancedEvent.totalTicketsSold || 0}/${enhancedEvent.totalCapacity || 0}`,
      revenue: `₹${enhancedEvent.totalRevenue || 0}`,
      description: enhancedEvent.description,
      mode: enhancedEvent.eventMode === 'offline' ? 'Offline' : 
            enhancedEvent.eventMode === 'online' ? 'Online' : 'Hybrid',
      eventUrl: enhancedEvent.eventUrl,
      location: enhancedEvent.location,
      time: startDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      duration: `${Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))} hours`,
      capacity: enhancedEvent.totalCapacity || 0,
      price: enhancedEvent.ticketTypes?.[0]?.price ? parseInt(enhancedEvent.ticketTypes[0].price) : 0,
      image: enhancedEvent.bannerImage || '',
      startDate: enhancedEvent.startDate,
      endDate: enhancedEvent.endDate,
      format: enhancedEvent.format,
      tags: enhancedEvent.tags,
      ticketTypes: enhancedEvent.ticketTypes.map(ticket => ({
        type: ticket.name,
        price: parseInt(ticket.price),
        sold: 0, // This would need to be fetched from ticket sales data
        total: parseInt(ticket.quantity),
        percentage: 0 // This would be calculated based on sold/total
      })),
      speakers: [
        ...enhancedEvent.speakers.manualSpeakers.map(speaker => ({
          name: speaker.name,
          title: speaker.title,
          bio: speaker.bio,
          image: speaker.image,
          expertise: speaker.title
        })),
        ...enhancedEvent.speakers.platformSpeakers.map(speaker => ({
          name: speaker.speakerDetails?.fullName || 'Unknown Speaker',
          title: speaker.speakerDetails?.professionalTitle || 'Speaker',
          bio: speaker.speakerDetails?.bio || '',
          image: speaker.speakerDetails?.profileImageUrl,
          expertise: speaker.speakerDetails?.professionalTitle || 'Speaker'
        }))
      ]
    }
  }


  // Transform API data to component format when data is available
  useEffect(() => {
    if (eventData?.success && eventData.data) {
      const transformedEvent = transformEnhancedEventToEvent(eventData.data)
      setCurrentEvent(transformedEvent)
    }
  }, [eventData])

  const handleEventSave = async (updatedEvent: Event) => {
    setCurrentEvent(updatedEvent)
    // Refetch the latest data from the server to ensure consistency
    await refetchEvent()
    console.log('Event updated:', updatedEvent)
  }

  const handleEdit = () => {
    console.log('Edit clicked')
  }

  const handleBackToEvents = () => {
    router.push('/events_page')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (apiError || (!loading && !currentEvent)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={handleBackToEvents}
            className="bg-[#FF6B35] hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      <Navbar 
        user={user || undefined}
        currentUserData={currentUserData}
        isAuthenticated={isAuthenticated}
        forceHomepageStyle={true}
        getProfileImageUrl={getProfileImageUrl}
      />
      {/* Main Content */}
      <div className="ml-64 pt-20 bg-orange-50 min-h-screen">
        {/* Top Profile Bar */}
        

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex w-full">
              {(['overview', 'participants', 'actions'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-6 rounded-full font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'bg-[#FF6B35] text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {/* ✅ FIXED: Pass both currentEvent state and handleEventSave callback */}
            {activeTab === 'overview' && currentEvent && (
              <Overview 
                event={currentEvent} 
                onEdit={handleEdit}
                onSave={handleEventSave}
              />
            )}
            {activeTab === 'participants' && <Participants eventId={params.eventId} />}
            {activeTab === 'actions' && <Actions />}
          </div>
        </div>
      </div>
    </div>
  )
}