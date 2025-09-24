import { useState } from 'react'
import { Users, Calendar, Link, Trash2 } from 'lucide-react'

interface Speaker {
  name: string
  title: string
  bio: string
  image?: string
}

interface SpeakersStepProps {
  formData: {
    speakers: Speaker[]
  }
  onFormDataUpdate: (data: any) => void
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

  const availableSpeakers = [
    {
      name: 'Sarah Johnson',
      title: 'CEO of TechCorp',
      bio: 'Leading expert in AI and machine learning with 15 years experience in developing cutting-edge technology...',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      title: 'Data Science Director', 
      bio: 'Pioneering data scientist with expertise in machine learning algorithms and big data analytics...',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'Emily Rodriguez',
      title: 'Product Innovation Lead',
      bio: 'Award-winning product manager specializing in user experience and digital transformation...',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'David Kim',
      title: 'Tech Entrepreneur',
      bio: 'Serial entrepreneur and startup mentor with multiple successful exits in the tech industry...',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'Lisa Zhang',
      title: 'Marketing Strategist',
      bio: 'Digital marketing expert helping companies scale through innovative growth strategies...',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'Alex Thompson',
      title: 'Blockchain Specialist',
      bio: 'Cryptocurrency and blockchain technology expert with deep knowledge of DeFi and Web3...',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face'
    }
  ]

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

  const addAvailableSpeaker = (speaker: any) => {
    const isAlreadyAdded = formData.speakers.some(s => s.name === speaker.name)
    
    if (!isAlreadyAdded) {
      // Add directly to form data (Added Speakers section)
      onFormDataUpdate({
        speakers: [
          ...formData.speakers,
          { 
            name: speaker.name, 
            title: speaker.title, 
            bio: speaker.bio,
            image: speaker.image 
          }
        ]
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
                  <p className="text-sm text-gray-400">Click "Add Speaker" to add event speakers</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Available Speakers Tab Content */}
        {activeTab === 'available' && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">Select from our verified speakers database</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {availableSpeakers.map((speaker, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <img
                      src={speaker.image}
                      alt={speaker.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">{speaker.name}</h4>
                      <p className="text-xs text-orange-600 mb-2">{speaker.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{speaker.bio}</p>
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