'use client'

import { useState } from 'react'
import { 
  User, 
  BarChart3, 
  MessageCircle, 
  Calendar, 
  CalendarDays, 
  CreditCard, 
  AlertTriangle, 
  HelpCircle, 
  Settings,
  Bell,
  LogOut
} from 'lucide-react'
import { EventFormData } from '../types/eventTypes'
import ProgressIndicator from '../components/ProgressIndicator'
import CoreDetailsStep from '../components/steps/CoreDetailsStep'
import BrandingContentStep from '../components/steps/BrandingContentStep'
import TicketingStep from '../components/steps/TicketingStep'
import SpeakersStep from '../components/steps/SpeakersStep'
import AddonsStep from '../components/steps/AddonsStep'
import ReviewPublishStep from '../components/steps/ReviewPublishStep'

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

  const menuItems = [
    { icon: User, label: 'Profile', active: false },
    { icon: BarChart3, label: 'Dashboard', active: false },
    { icon: MessageCircle, label: 'Messages', active: false },
    { icon: Calendar, label: 'Bookings', active: false },
    { icon: CalendarDays, label: 'Events', active: true },
    { icon: CreditCard, label: 'Payments', active: false },
    { icon: AlertTriangle, label: 'Dispute', active: false },
  ];

  const bottomMenuItems = [
    { icon: HelpCircle, label: 'Support' },
    { icon: Settings, label: 'Settings' },
  ];

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
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200">
        <div className="p-4 h-full flex flex-col">

          <div className="space-y-1 flex-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    item.active
                      ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                      : 'text-gray-600 hover:bg-[#FF6B35]/5 hover:text-[#FF6B35]'
                  }`}
                >
                  <IconComponent size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-1 mb-4">
            {bottomMenuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer text-gray-600 hover:bg-[#FF6B35]/5 hover:text-[#FF6B35] transition-colors"
                >
                  <IconComponent size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-3 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate hover:text-[#FF6B35] transition-colors cursor-pointer">John Doe</p>
                <p className="text-xs text-gray-500 truncate hover:text-[#FF6B35] transition-colors cursor-pointer">John@gmail.com</p>
              </div>
            </div>
            <button className="p-1.5 text-red-500 hover:text-[#FF6B35] hover:bg-[#FF6B35]/5 rounded-md transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Profile Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex justify-end">
            <div className="flex items-center space-x-4">
              <Bell size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Senior Product Manager</p>
                </div>
                <div className="w-8 h-8 bg-[#FF6B35]/50 rounded-full text-black text-xs flex items-center justify-center font-medium">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>

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