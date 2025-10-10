import { useState, useMemo } from 'react'
import { Users, Link, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { useGetOrganizerBookingsQuery } from '@/store/slices/organizerBookingsSlice'

interface Speaker {
  name: string
  title: string
  bio: string
  image?: string
  speakerId?: string // Add speakerId for platform speakers
  bookingId?: string // Add bookingId for platform speakers
}

interface ConfirmedSpeaker {
  name: string
  title: string
  bio: string
  image: string
  expertise: string[]
  speakerId: string // Add speakerId field
  bookingDetails: {
    eventName: string
    date: string
    amount: number
    bookingId: string
    _id: string // MongoDB ObjectId
  }
}

interface SpeakersStepProps {
  formData: {
    speakers: Speaker[]
  }
  onFormDataUpdate: (data: { speakers: Speaker[] }) => void
}

export default function SpeakersStep({ formData, onFormDataUpdate }: SpeakersStepProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'available'>('manual')
  const [manualSpeakers, setManualSpeakers] = useState<Array<{
    id: number
    name: string
    title: string
    bio: string
    image: string
  }>>([])
  const [nextId, setNextId] = useState(1)

  // Fetch confirmed speakers from existing organizer bookings
  const { 
    data: bookingsData, 
    isLoading: isLoadingSpeakers,
    error: speakersError 
  } = useGetOrganizerBookingsQuery()

  // Transform confirmed bookings to speaker format
  const confirmedSpeakers = useMemo((): ConfirmedSpeaker[] => {
    if (!bookingsData?.data?.confirmed) return []
    
    return bookingsData.data.confirmed.map(booking => ({
      name: `${booking.speaker.firstName} ${booking.speaker.lastName}`,
      title: booking.speaker.professionalTitle || 'Speaker',
      bio: booking.speaker.bio || 'Professional speaker with expertise in various topics.',
      image: booking.speaker.profileImageUrl || '',
      expertise: booking.speaker.areaOfExpertise || [],
      speakerId: booking.speaker._id, // Include the actual speaker user ID
      bookingDetails: {
        eventName: booking.eventDetails.name,
        date: booking.date,
        amount: booking.compensationAndArrangements.primaryCompensation.speakerFeeAmount,
        bookingId: booking.bookingId,
        _id: booking._id // Include the MongoDB ObjectId
      }
    }))
  }, [bookingsData])

  const addManualSpeaker = () => {
    const newSpeaker = {
      id: nextId,
      name: '',
      title: '',
      bio: '',
      image: ''
    }
    setManualSpeakers(prev => [...prev, newSpeaker])
    setNextId(prev => prev + 1)
  }

  const removeManualSpeaker = (id: number) => {
    setManualSpeakers(prev => prev.filter(speaker => speaker.id !== id))
    // Also remove from form data if it was saved
    const speakerToRemove = manualSpeakers.find(s => s.id === id)
    if (speakerToRemove && speakerToRemove.name) {
      onFormDataUpdate({
        speakers: formData.speakers.filter(s => s.name !== speakerToRemove.name)
      })
    }
  }

  const updateManualSpeaker = (id: number, field: string, value: string) => {
    setManualSpeakers(prev => prev.map(speaker => 
      speaker.id === id ? { ...speaker, [field]: value } : speaker
    ))
    
    // Update form data in real-time
    const updatedSpeaker = manualSpeakers.find(s => s.id === id)
    if (updatedSpeaker) {
      const updatedSpeakers = [...formData.speakers]
      const existingIndex = updatedSpeakers.findIndex(s => s.name === updatedSpeaker.name)
      
      const speakerData = { ...updatedSpeaker, [field]: value }
      
      if (speakerData.name && speakerData.title && speakerData.bio) {
        if (existingIndex >= 0) {
          updatedSpeakers[existingIndex] = {
            name: speakerData.name,
            title: speakerData.title,
            bio: speakerData.bio,
            image: speakerData.image
          }
        } else {
          updatedSpeakers.push({
            name: speakerData.name,
            title: speakerData.title,
            bio: speakerData.bio,
            image: speakerData.image
          })
        }
        onFormDataUpdate({ speakers: updatedSpeakers })
      }
    }
  }

  const addAvailableSpeaker = (speaker: ConfirmedSpeaker) => {
    const isAlreadyAdded = formData.speakers.some(s => s.name === speaker.name)
    
    if (!isAlreadyAdded) {
      // Add as platform speaker to the new structure
      const currentSpeakers = formData.speakers || []
      const platformSpeakers = currentSpeakers.filter(s => s.speakerId) // Existing platform speakers
      const manualSpeakers = currentSpeakers.filter(s => !s.speakerId) // Existing manual speakers
      
      // Add new platform speaker
      const newPlatformSpeaker = {
        name: speaker.name,
        title: speaker.title,
        bio: speaker.bio,
        image: speaker.image,
        speakerId: speaker.speakerId, // Real database speaker ID
        bookingId: speaker.bookingDetails._id // Required booking ID (MongoDB ObjectId)
      }
      
      onFormDataUpdate({
        speakers: [...manualSpeakers, ...platformSpeakers, newPlatformSpeaker]
      })
    }
  }

  const removeSpeaker = (index: number) => {
    onFormDataUpdate({
      speakers: formData.speakers.filter((_, i) => i !== index)
    })
  }

  const updateSpeaker = (index: number, field: keyof Speaker, value: string) => {
    const newSpeakers = [...formData.speakers]
    newSpeakers[index][field] = value
    onFormDataUpdate({ speakers: newSpeakers })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="border border-gray-300 rounded-lg p-6 bg-white">
        <label className="block text-lg font-medium text-[#FF6B35] mb-2">
          Event Speakers
        </label>
        <p className="text-sm text-gray-600 mb-6">
          Add speakers manually or select from our available speakers database
        </p>

        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1 px-4 font-medium rounded-l-full transition-colors ${
              activeTab === 'manual'
                ? 'bg-[#FF6B35] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-1 px-4 font-medium rounded-r-full transition-colors ${
              activeTab === 'available'
                ? 'bg-[#FF6B35] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Available Speakers
          </button>
        </div>

        {/* Manual Entry Tab Content */}
        {activeTab === 'manual' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Create speaker profiles</p>
              <button
                type="button"
                onClick={addManualSpeaker}
                className="px-4 py-1 border border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35] hover:text-white transition-colors"
              >
                + Add Speaker
              </button>
            </div>

            {manualSpeakers.length > 0 && (
              <div className="space-y-6">
                {manualSpeakers.map((speaker) => (
                  <div key={speaker.id} className="border border-[#FF6B35] rounded-lg p-6 bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[#FF6B35] font-medium">Speaker {speaker.id}</h4>
                      <button
                        type="button"
                        onClick={() => removeManualSpeaker(speaker.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center overflow-hidden">
                          {speaker.image ? (
                            <img
                              src={speaker.image}
                              alt="Speaker"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <span className={`text-white font-bold text-lg ${speaker.image ? 'hidden' : 'flex'}`}>S</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 relative">
                              <span className="block text-sm font-medium text-[#FF6B35] mb-1 bg-white px-3 relative z-10 w-fit ml-2">
                                Speaker Image*
                              </span>
                              <input
                                type="text"
                                value={speaker.image}
                                onChange={(e) => updateManualSpeaker(speaker.id, 'image', e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] -mt-3 pt-4"
                                placeholder="https://images.unsplash.com/photo..."
                              />
                            </div>
                            <div className="mt-4">
                              <Link className="w-5 h-5 text-[#FF6B35]" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Paste a Google Drive link to upload a photo</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                          <span className="block text-sm font-medium text-[#FF6B35] mb-1 bg-white px-3 relative z-10 w-fit ml-2">
                            Name*
                          </span>
                          <input
                            type="text"
                            value={speaker.name}
                            onChange={(e) => updateManualSpeaker(speaker.id, 'name', e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] -mt-3 pt-4"
                            placeholder="Speaker name"
                          />
                        </div>
                        <div className="relative">
                          <span className="block text-sm font-medium text-[#FF6B35] mb-1 bg-white px-3 relative z-10 w-fit ml-2">
                            Title*
                          </span>
                          <input
                            type="text"
                            value={speaker.title}
                            onChange={(e) => updateManualSpeaker(speaker.id, 'title', e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] -mt-3 pt-4"
                            placeholder="e.g. CEO at company"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <span className="block text-sm font-medium text-[#FF6B35] mb-1 bg-white px-3 relative z-10 w-fit ml-2">
                          Bio*
                        </span>
                        <textarea
                          value={speaker.bio}
                          onChange={(e) => updateManualSpeaker(speaker.id, 'bio', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] resize-none -mt-3 pt-4"
                          placeholder="Speaker biography..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {manualSpeakers.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-400 font-medium">No speakers added yet</p>
                  <p className="text-sm text-gray-400">Click &quot;Add Speaker&quot; to add event speakers</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Available Speakers Tab Content */}
        {activeTab === 'available' && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Select from your previously confirmed speakers
            </p>

            {/* Loading State */}
            {isLoadingSpeakers && (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35] mb-2" />
                  <p className="text-gray-600 text-sm">Loading confirmed speakers...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {speakersError && (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
                  <p className="text-red-600 text-sm">Error loading speakers</p>
                  <p className="text-gray-500 text-xs mt-1">Please try again later</p>
                </div>
              </div>
            )}

            {/* Speakers Grid */}
            {!isLoadingSpeakers && !speakersError && (
              <>
                {confirmedSpeakers.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-400 font-medium">No confirmed speakers available</p>
                      <p className="text-sm text-gray-400">You haven&apos;t confirmed any speaker bookings yet</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {confirmedSpeakers.map((speaker, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FF6B35] flex items-center justify-center">
                            {speaker.image ? (
                              <img
                                src={speaker.image}
                                alt={speaker.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.nextElementSibling) {
                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <span className={`text-white font-bold text-lg ${speaker.image ? 'hidden' : 'flex'}`}>
                              {speaker.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm">{speaker.name}</h4>
                            <p className="text-xs text-orange-600 mb-2">{speaker.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{speaker.bio}</p>
                            
                            {/* Booking Context */}
                            <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                              <p className="text-xs text-orange-700 font-medium">Previously booked for:</p>
                              <p className="text-xs text-orange-600">{speaker.bookingDetails.eventName}</p>
                              <p className="text-xs text-orange-500">
                                ₹{speaker.bookingDetails.amount?.toLocaleString() || '0'} • {new Date(speaker.bookingDetails.date).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Expertise Tags */}
                            {speaker.expertise.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {speaker.expertise.slice(0, 3).map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="inline-block px-2 py-1 text-xs bg-[#FF6B35]/10 text-[#FF6B35] rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {speaker.expertise.length > 3 && (
                                  <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    +{speaker.expertise.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addAvailableSpeaker(speaker)}
                          disabled={formData.speakers.some(s => s.name === speaker.name)}
                          className={`w-full mt-3 py-1 px-4 rounded-lg text-sm font-medium transition-colors ${
                            formData.speakers.some(s => s.name === speaker.name)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#FF6B35] text-white hover:bg-orange-600'
                          }`}
                        >
                          {formData.speakers.some(s => s.name === speaker.name) ? 'Already Added' : 'Add Speaker'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {formData.speakers.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Added Speakers ({formData.speakers.length})
            </h4>
            
            <div className="space-y-6">
              {formData.speakers.map((speaker, index) => (
                <div key={index} className="border border-[#FF6B35] rounded-lg p-6 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[#FF6B35] font-medium">Speaker {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSpeaker(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center overflow-hidden">
                        {speaker.image ? (
                          <img
                            src={speaker.image}
                            alt="Speaker"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <span className={`text-white font-bold text-lg ${speaker.image ? 'hidden' : 'flex'}`}>
                          {speaker.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 relative">
                            <span className="block text-sm font-medium text-[#FF6B35] mb-1 bg-white px-3 relative z-10 w-fit ml-2">
                              Speaker Image*
                            </span>
                            <input
                              type="text"
                              value={speaker.image || ''}
                              onChange={(e) => updateSpeaker(index, 'image', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] -mt-3 pt-4"
                              placeholder="https://images.unsplash.com/photo..."
                            />
                          </div>
                          <div className="mt-4">
                            <Link className="w-5 h-5 text-[#FF6B35]" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Paste a Google Drive link to upload a photo</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="block text-sm font-medium text-[#FF6B35] mb-1 bg-white px-3 relative z-10 w-fit ml-2">
                          Name*
                        </span>
                        <input
                          type="text"
                          value={speaker.name}
                          onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] -mt-3 pt-4"
                          placeholder="Speaker name"
                        />
                      </div>
                      <div className="relative">
                        <span className="block text-sm font-medium text-[#FF6B35] mb-1 bg-white px-3 relative z-10 w-fit ml-2">
                          Title*
                        </span>
                        <input
                          type="text"
                          value={speaker.title}
                          onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] -mt-3 pt-4"
                          placeholder="e.g. CEO at company"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <span className="block text-sm font-medium text-[#FF6B35] mb-1 bg-white px-3 relative z-10 w-fit ml-2">
                        Bio*
                      </span>
                      <textarea
                        value={speaker.bio}
                        onChange={(e) => updateSpeaker(index, 'bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] resize-none -mt-3 pt-4"
                        placeholder="Speaker biography..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}