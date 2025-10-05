'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import useEventForm from '../hooks/useEventForm'
import { EventStep } from '../types/eventTypes'

export default function CreateEvent() {
  const router = useRouter()
  
  // Event form hook
  const {
    currentStep,
    formData,
    isLoading,
    error,
    isDraft,
    lastSaved,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    updateStep1,
    updateStep2,
    updateStep3,
    updateStep4,
    updateStep5,
    canProceedToNext,
    canGoToPrevious,
    createNewEvent,
    saveAsDraft,
    uploadImage,
    updateEventStatus,
    clearFormError
  } = useEventForm()

  const totalSteps = 6
  const stepTitles = [
    'Core Details',
    'Branding & Content', 
    'Ticketing',
    'Speakers',
    'Add-ons',
    'Review & Publish'
  ]

  // Authentication hooks - simplified
  const { user, isAuthenticated } = useAuth()
  const { data: currentUserData } = useGetCurrentUserQuery()
  
  // Simple check - only redirect to login if no auth cookies at all
  useEffect(() => {
    const hasAuthCookies = document.cookie.includes('accessToken') || document.cookie.includes('refreshToken')
    
    if (!hasAuthCookies) {
      console.log('❌ No auth cookies found, redirecting to login')
      router.push('/home')
      return
    }
    
    console.log('✅ Auth cookies found, proceeding with event creation')
  }, [router])

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
    updateStep1({ [name]: value })
  }

  const handleNext = () => {
    console.log('🔍 Next Button Clicked - Debug Info:', {
      canProceedToNext,
      currentStep,
      formData: {
        eventName: formData.eventName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        eventMode: formData.eventMode,
        format: formData.format,
        location: formData.location,
        eventUrl: formData.eventUrl
      }
    })
    
    if (canProceedToNext) {
      goToNextStep()
    } else {
      console.log('❌ Cannot proceed to next step - validation failed')
    }
  }

  const handlePrevious = () => {
    if (canGoToPrevious) {
      goToPreviousStep()
    }
  }

  const handleSubmit = async () => {
    try {
      // Determine the final banner image URL
      let finalBannerImageUrl = formData.bannerImageUrl
      
      // Handle banner image upload/fallback
      if (formData.image) {
        console.log('📸 Uploading banner image...')
        
        try {
          const imageUrl = await uploadImage(formData.image)
          if (imageUrl) {
            console.log('✅ Banner image uploaded successfully:', imageUrl)
            finalBannerImageUrl = imageUrl
      } else {
            throw new Error('Upload returned no URL')
          }
        } catch (uploadError) {
          console.warn('⚠️ Banner image upload failed, using fallback image:', uploadError)
          
          // Use fallback image URL for development mode
          const fallbackImageUrl = 'https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          console.log('🔄 Using fallback banner image:', fallbackImageUrl)
          finalBannerImageUrl = fallbackImageUrl
        }
      } else if (!formData.bannerImageUrl) {
        // If no image is uploaded and no bannerImageUrl exists, use fallback
        const fallbackImageUrl = 'https://images.unsplash.com/photo-1506765515384-028b60a970df?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        console.log('🔄 No banner image provided, using fallback:', fallbackImageUrl)
        finalBannerImageUrl = fallbackImageUrl
      }
      
      // Set status to "published" before creating the event
      console.log('📝 Setting event status to "published"')
      updateEventStatus('published')
      
      // Clear the File object from state to avoid Redux serialization warnings
      if (formData.image) {
        console.log('🧹 Clearing File object from Redux state')
        updateStep2({ bannerImage: null })
      }
      
      // Create the event with the final banner image URL and published status
      console.log('🎯 Creating event with banner image:', finalBannerImageUrl)
      const event = await createNewEvent(finalBannerImageUrl, 'published')
      
      if (event) {
        // Redirect to events page on success
        router.push('/events_page')
      }
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error)
    }
  }

  const handleSaveDraft = () => {
    saveAsDraft()
    // Show success message or notification
    console.log('Draft saved successfully!')
  }

  const handleStepChange = (stepNumber: number) => {
    console.log(`🔄 Navigating to step ${stepNumber}`)
    goToStep(stepNumber as EventStep) // Cast to EventStep type
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
            onFormDataUpdate={updateStep2}
          />
        )
      
      case 3:
        return (
          <TicketingStep 
            formData={formData}
            onFormDataUpdate={updateStep3}
          />
        )
      
      case 4:
        return (
          <SpeakersStep 
            formData={{ speakers: formData.speakersArray || [] }}
            onFormDataUpdate={(data) => {
              // Convert legacy speakers array to new format
              const speakersArray = data.speakers || []
              const manualSpeakers = speakersArray.filter((speaker: { speakerId?: string }) => !speaker.speakerId).map((speaker: { name: string; title: string; bio: string; image?: string }) => ({
                image: speaker.image || '',
                name: speaker.name,
                title: speaker.title,
                bio: speaker.bio
              }))
              const platformSpeakers = (speakersArray as Array<{ speakerId: string; bookingId: string; name: string; title: string; bio: string; image?: string }>)
                .filter((speaker) => speaker.speakerId)
                // @ts-expect-error - Type compatibility issue with legacy Speaker interface
                .map((speaker) => ({
                  speakerId: speaker.speakerId,
                  bookingId: speaker.bookingId, // This will now be the MongoDB ObjectId
                  speakerDetails: {
                    fullName: speaker.name,
                    professionalTitle: speaker.title,
                    bio: speaker.bio,
                    profileImageUrl: speaker.image || ''
                  }
                }))
              updateStep4({
                speakers: {
                  manualSpeakers,
                  platformSpeakers
                },
                speakersArray
              })
            }}
          />
        )
      
      case 5:
        return (
          <AddonsStep 
            formData={{ addons: formData.addons }}
            onFormDataUpdate={updateStep5}
          />
        )
      
      case 6:
        return (
          <ReviewPublishStep 
            formData={{
              eventName: formData.eventName,
              startDate: formData.startDate,
              endDate: formData.endDate,
              eventMode: formData.eventMode,
              location: formData.location,
              description: formData.description,
              image: formData.image,
              tags: formData.tags,
              ticketTypes: formData.ticketTypes,
              speakers: formData.speakersArray || [],
              addons: formData.addons
            }}
            onStepChange={handleStepChange}
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
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
      <div className="ml-64 pt-20">
        {/* Main Form Content */}
        <div className="p-6 bg-[#FF6B35]/10">
          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border-1 border-[#FF6B35]/50 max-w-4xl mx-auto">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-[#FF6B35]">Create New Event</h1>
                <div className="flex items-center space-x-4">
                  {isDraft && (
                    <span className="text-sm text-gray-500">
                      Draft saved {lastSaved ? new Date(lastSaved).toLocaleTimeString() : ''}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 text-sm border border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/5 transition-colors"
                  >
                    Save Draft
                  </button>
                </div>
              </div>
              
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

              {/* Error Display */}
              {error && (
                <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    type="button"
                    onClick={clearFormError}
                    className="mt-2 text-red-500 hover:text-red-700 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 6 && (
                <div className="flex justify-center space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={!canGoToPrevious}
                    className="px-6 py-2 text-sm border-2 border-[#FF6B35] text-[#FF6B35] rounded-full hover:bg-[#FF6B35]/5 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceedToNext}
                    className="px-6 py-2 text-sm bg-[#FF6B35] text-white rounded-full hover:bg-[#e55a2b] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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