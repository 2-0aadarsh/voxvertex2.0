'use client'

import { useState } from 'react'
import { EventFormData } from '../types/eventTypes'
import ProgressIndicator from '../components/ProgressIndicator'
import CoreDetailsStep from '../components/steps/CoreDetailsStep'
import BrandingContentStep from '../components/steps/BrandingContentStep'
import TicketingStep from '../components/steps/TicketingStep'
import SpeakersStep from '../components/steps/SpeakersStep'
import AddonsStep from '../components/steps/AddonsStep'
import ReviewPublishStep from '../components/steps/ReviewPublishStep'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/store/hooks'
import { useGetCurrentUserQuery } from '@/store/slices/authSlice'

export default function CreateEvent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    startDate: '',
    endDate: '',
    eventMode: 'offline',
    location: '',
    description: '',
    image: null,
    tags: [],
    ticketTypes: [],
    speakers: [],
    format: 'virtual',
    eventUrl: '',
    addons: {
      featureOnHome: false,
      includeInNewsletter: false,
      socialMediaPromotion: true
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const totalSteps = 6
  const stepTitles = [
    'Core Details',
    'Branding & Content', 
    'Ticketing',
    'Speakers',
    'Add-ons',
    'Review & Publish'
  ]

  // Authentication hooks
  const { user, isAuthenticated } = useAuth()
  const { data: currentUserData } = useGetCurrentUserQuery()

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: { data?: Buffer | string; contentType?: string; url?: string } | string | null | undefined) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const updateFormData = (data: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3004/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Event created successfully!')
        window.location.href = '/events_page'
      } else {
        alert('Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert('Error creating event')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CoreDetailsStep 
            formData={formData}
            onInputChange={handleInputChange}
          />
        )
      
      case 2:
        return (
          <BrandingContentStep 
            formData={formData}
            onInputChange={handleInputChange}
            onFormDataUpdate={updateFormData}
          />
        )
      
      case 3:
        return (
          <TicketingStep 
            formData={formData}
            onFormDataUpdate={updateFormData}
          />
        )
      
      case 4:
        return (
          <SpeakersStep 
            formData={formData}
            onFormDataUpdate={updateFormData}
          />
        )
      
      case 5:
        return (
          <AddonsStep 
            formData={formData}
            onFormDataUpdate={updateFormData}
          />
        )
      
      case 6:
        return (
          <ReviewPublishStep 
            formData={formData}
            onStepChange={setCurrentStep}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user || undefined}
        currentUserData={currentUserData}
        isAuthenticated={isAuthenticated}
        forceHomepageStyle={true}
        getProfileImageUrl={(url) => getProfileImageUrl(url)}
      />
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64">
        {/* Main Form Content */}
        <div className="p-6 bg-[#FF6B35]/10">
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border-1 border-[#FF6B35]/50 max-w-4xl mx-auto">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-[#FF6B35] text-center mb-6">Create New Event</h1>
              
              {/* Progress Indicator */}
              <ProgressIndicator 
                currentStep={currentStep}
                totalSteps={totalSteps}
                stepTitles={stepTitles}
              />
            </div>

            {/* Form Content */}
            <div className="px-2 pb-6">
              {/* Step Content */}
              <div className="w-full">
                {renderStepContent()}
              </div>

              {/* Navigation Buttons */}
              {currentStep < 6 && (
                <div className="flex justify-center space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="px-6 py-2 text-sm border-2 border-[#FF6B35] text-[#FF6B35] rounded-full hover:bg-[#FF6B35]/5 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 text-sm bg-[#FF6B35] text-white rounded-full hover:bg-[#e55a2b] transition-colors font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}