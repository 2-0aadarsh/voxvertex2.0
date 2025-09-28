import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FormData {
  eventName: string;
  eventType: string;
  location: string;
  attendees: number;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  offerAmount: number;
  currency?: string;
  specialRequests?: string;
  topics?: string[];
}

interface Step1Props {
  isVisible: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious?: () => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const Step1: React.FC<Step1Props> = ({ isVisible, onClose, onNext, onPrevious, formData, updateFormData }) => {
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');

  // Sync with formData when component mounts or when editing
  useEffect(() => {
    if (formData.eventName) setEventName(formData.eventName);
    if (formData.eventType) setEventType(formData.eventType);
    if (formData.location) setLocation(formData.location);
    if (formData.attendees) setExpectedAttendees(formData.attendees.toString());
  }, [formData]);

  const handleNext = () => {
    // Validation
    if (!eventName.trim()) {
      alert('Please enter an event name');
      return;
    }
    if (!eventType) {
      alert('Please select an event type');
      return;
    }
    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }

    // Convert expected attendees to number for storage
    let attendeesNum = 0;
    if (expectedAttendees) {
      if (expectedAttendees.includes('-')) {
        attendeesNum = parseInt(expectedAttendees.split('-')[1]);
      } else if (expectedAttendees.includes('+')) {
        attendeesNum = parseInt(expectedAttendees.replace('+', ''));
      } else {
        attendeesNum = parseInt(expectedAttendees);
      }
    }

    // Save data to parent state
    updateFormData({
      eventName,
      eventType,
      location,
      attendees: attendeesNum
    });

    // Move to next step
    onNext();
  };

  const handlePrevious = () => {
    // Convert expected attendees to number for storage
    let attendeesNum = 0;
    if (expectedAttendees) {
      if (expectedAttendees.includes('-')) {
        attendeesNum = parseInt(expectedAttendees.split('-')[1]);
      } else if (expectedAttendees.includes('+')) {
        attendeesNum = parseInt(expectedAttendees.replace('+', ''));
      } else {
        attendeesNum = parseInt(expectedAttendees);
      }
    }

    // Save data before going back
    updateFormData({
      eventName,
      eventType,
      location,
      attendees: attendeesNum
    });

    if (onPrevious) {
      onPrevious();
    }
  };

  const handleEventTypeSelect = (type: string) => {
    setEventType(type);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[#FF6B35]/10 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#FF6B35] rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-center p-6 relative">
          <h2 className="text-xl font-semibold text-[#FF6B35]">Book Speaker</h2>
          <button
            onClick={onClose}
            className="absolute right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar - Updated for new step order */}
        <div className="px-6 py-6">
          <div className="flex justify-center">
            <div className="flex items-center">
              {/* Step 1 - Date & Time (completed) */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900 text-center whitespace-nowrap">Date & Time</span>
              </div>
              
              {/* Line 1 - Orange since step 1 is completed */}
              <div className="w-16 h-px bg-[#FF6B35] mx-4"></div>
              
              {/* Step 2 - Event Details (current) */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900 text-center whitespace-nowrap">Event Details</span>
              </div>
              
              {/* Line 2 - Gray since step 3 is not reached */}
              <div className="w-16 h-px bg-gray-300 mx-4"></div>
              
              {/* Step 3 - Inactive */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="mt-2 text-sm text-gray-500 text-center whitespace-nowrap">Compensation & Arrangements</span>
              </div>
              
              {/* Line 3 - Gray since step 4 is not reached */}
              <div className="w-16 h-px bg-gray-300 mx-4"></div>
              
              {/* Step 4 - Inactive */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <span className="mt-2 text-sm text-gray-500 text-center whitespace-nowrap">Review & Send</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
            <p className="text-gray-600 text-sm">Tell us about your event</p>
          </div>

          {/* Event Type Selection Badges */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              {/* Keynote Speaker */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  eventType === 'Keynote Speaker' 
                    ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleEventTypeSelect('Keynote Speaker')}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    eventType === 'Keynote Speaker' 
                      ? 'border-[#FF6B35] bg-[#FF6B35]' 
                      : 'border-gray-300'
                  }`}>
                    {eventType === 'Keynote Speaker' && (
                      <div className="w-full h-full rounded-full bg-[#FF6B35]"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Keynote Speaker</h4>
                    <p className="text-sm text-gray-500">Main presentation at your event</p>
                  </div>
                </div>
              </div>

              {/* Workshop */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  eventType === 'Workshop' 
                    ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleEventTypeSelect('Workshop')}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    eventType === 'Workshop' 
                      ? 'border-[#FF6B35] bg-[#FF6B35]' 
                      : 'border-gray-300'
                  }`}>
                    {eventType === 'Workshop' && (
                      <div className="w-full h-full rounded-full bg-[#FF6B35]"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Workshop</h4>
                    <p className="text-sm text-gray-500">Interactive workshop or masterclass</p>
                  </div>
                </div>
              </div>

              {/* Panel Discussion */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  eventType === 'Panel Discussion' 
                    ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleEventTypeSelect('Panel Discussion')}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    eventType === 'Panel Discussion' 
                      ? 'border-[#FF6B35] bg-[#FF6B35]' 
                      : 'border-gray-300'
                  }`}>
                    {eventType === 'Panel Discussion' && (
                      <div className="w-full h-full rounded-full bg-[#FF6B35]"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Panel Discussion</h4>
                    <p className="text-sm text-gray-500">Participate in a panel discussion</p>
                  </div>
                </div>
              </div>

              {/* Breakout Session */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  eventType === 'Breakout Session' 
                    ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleEventTypeSelect('Breakout Session')}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    eventType === 'Breakout Session' 
                      ? 'border-[#FF6B35] bg-[#FF6B35]' 
                      : 'border-gray-300'
                  }`}>
                    {eventType === 'Breakout Session' && (
                      <div className="w-full h-full rounded-full bg-[#FF6B35]"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Breakout Session</h4>
                    <p className="text-sm text-gray-500">Focused session on specific topic</p>
                  </div>
                </div>
              </div>

              {/* Consultation */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  eventType === 'Consultation' 
                    ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleEventTypeSelect('Consultation')}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    eventType === 'Consultation' 
                      ? 'border-[#FF6B35] bg-[#FF6B35]' 
                      : 'border-gray-300'
                  }`}>
                    {eventType === 'Consultation' && (
                      <div className="w-full h-full rounded-full bg-[#FF6B35]"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Consultation</h4>
                    <p className="text-sm text-gray-500">Private consultation or advisory session</p>
                  </div>
                </div>
              </div>

              {/* Mentorship */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  eventType === 'Mentorship' 
                    ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleEventTypeSelect('Mentorship')}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    eventType === 'Mentorship' 
                      ? 'border-[#FF6B35] bg-[#FF6B35]' 
                      : 'border-gray-300'
                  }`}>
                    {eventType === 'Mentorship' && (
                      <div className="w-full h-full rounded-full bg-[#FF6B35]"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Mentorship</h4>
                    <p className="text-sm text-gray-500">Ongoing mentorship arrangement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Form Fields */}
          <div className="space-y-6">
            {/* Event Name */}
            <div className="relative">
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
                className="w-full px-3 py-1 pt-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-xs text-gray-900"
              />
              <label className="absolute left-3 top-[-6] text-xs font-medium text-[#FF6B35] bg-white">
                Event Name *
              </label>
            </div>

            {/* Location */}
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter event Location"
                className="w-full px-3 py-1 pt-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-xs text-gray-900"
              />
              <label className="absolute left-3 top-[-6] text-xs font-medium text-[#FF6B35] bg-white">
                Location *
              </label>
            </div>

            {/* Expected Attendees */}
            <div className="relative">
              <input
                type="number"
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(e.target.value)}
                min="0"
                className="w-full px-3 py-1 pt-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-xs text-gray-900 bg-white"
              />
              <label className="absolute left-3 top-[-6px] text-xs font-medium text-[#FF6B35] bg-white px-1">
                Expected Attendees *
              </label>
            </div>
          </div>
        </div>

        {/* Footer - Now has Previous button since this is step 2 */}
        <div className="flex justify-center items-center gap-4 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/80 transition-colors font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1;