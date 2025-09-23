import React from 'react';
import { X, Edit } from 'lucide-react';

// Define the data structure for form data
interface FormData {
  // Step 1 - Event Details
  eventName: string;
  eventType: string;
  location: string;
  attendees: number;
  description?: string;
  
  // Step 2 - Date & Time
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  
  // Step 3 - Preferences
  offerAmount: number;
  currency?: string;
  specialRequests?: string;
  topics?: string[];
}

interface Step4Props {
  isVisible: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  formData: FormData; // Add formData prop
  onEdit: (step: number) => void; // Add edit handler
}

const Step4: React.FC<Step4Props> = ({ 
  isVisible, 
  onClose, 
  onNext, 
  onPrevious, 
  formData,
  onEdit 
}) => {
  const handleSubmit = () => {
    // Handle form submission with formData
    console.log('Submitting booking:', formData);
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleEdit = () => {
    // You might want to specify which step to edit
    // For now, going back to step 1
    onEdit(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${mins} minutes`;
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

        {/* Progress Bar - Updated to match Step1 order */}
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
              
              {/* Step 2 - Event Details (completed) */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900 text-center whitespace-nowrap">Event Details</span>
              </div>
              
              {/* Line 2 - Orange since step 2 is completed */}
              <div className="w-16 h-px bg-[#FF6B35] mx-4"></div>
              
              {/* Step 3 - Compensation & Arrangements (completed) */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900 text-center whitespace-nowrap">Compensation & Arrangements</span>
              </div>
              
              {/* Line 3 - Orange since step 3 is completed */}
              <div className="w-16 h-px bg-[#FF6B35] mx-4"></div>
              
              {/* Step 4 - Review & Send (current) */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900 text-center whitespace-nowrap">Review & Send</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Send</h3>
            <p className="text-gray-600 text-sm">Confirm your booking request</p>
          </div>

          {/* Booking Summary */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-medium text-[#FF6B35]">Booking Summary</h4>
              <button 
                onClick={handleEdit}
                className="flex items-center gap-1 bg-[#FF6B35] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#FF6B35]/80"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>

            {/* Summary Details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Event:</span>
                <span className="text-sm text-gray-900">{formData.eventName || 'Future of Work Summit 2025'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <span className="text-sm text-gray-900">{formData.eventType || 'training'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Date:</span>
                <span className="text-sm text-gray-900">{formData.date ? formatDate(formData.date) : '9/17/2025'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Time:</span>
                <span className="text-sm text-gray-900">
                  {formData.startTime && formData.endTime 
                    ? `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`
                    : '3:00 PM - 4:00 PM'
                  }
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Duration:</span>
                <span className="text-sm text-gray-900">
                  {formData.duration ? formatDuration(formData.duration) : '60 minutes'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Location:</span>
                <span className="text-sm text-gray-900">{formData.location || 'Pune'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Attendees:</span>
                <span className="text-sm text-gray-900">{formData.attendees || '50'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Offer Amount:</span>
                <span className="text-sm font-medium text-[#FF6B35]">
                  {formData.offerAmount 
                    ? `${formData.currency || '$'}${formData.offerAmount.toLocaleString()}`
                    : '$5,000'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Personal Message */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-[#FF6B35] mb-4">Personal Message</h4>
            <div className="bg-gray-50 border border-[#FF6B35] rounded-lg p-4">
              <p className="text-sm text-gray-900 mb-4">
                Dear Dr. Jane Doe,
              </p>
              <p className="text-sm text-gray-900 mb-4">
                I hope this message finds you well. I am reaching out to invite you to speak at our upcoming event 
                based on your exceptional expertise in AI and Healthcare.
              </p>
              <p className="text-sm text-gray-900 mb-4 font-medium">
                SPEAKING OPPORTUNITY DETAILS:
              </p>
              <div className="text-sm text-gray-900 mb-4 space-y-1">
                <div className="flex items-start">
                  <span className="text-red-500 mr-2">📍</span>
                  <span><strong>Event:</strong> [Event name will be filled from your details]</span>
                </div>
                <div className="flex items-start">
                  <span className="text-red-500 mr-2">📍</span>
                  <span><strong>Location:</strong> [Location will be filled from your details]</span>
                </div>
                <div className="flex items-start">
                  <span className="text-red-500 mr-2">👥</span>
                  <span><strong>Audience:</strong> [Expected attendees will be filled from your details]</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">⏰</span>
                  <span><strong>Duration:</strong> [Session duration will be filled from your details]</span>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-500 mr-2">💰</span>
                  <span><strong>Compensation:</strong> [Compensation details will be filled from your details]</span>
                </div>
              </div>
              <p className="text-sm text-gray-900 mb-4 font-medium">
                WHAT WE OFFER:
              </p>
              <div className="text-sm text-gray-900 mb-4 space-y-1">
                <div>• Professional speaking fee/honorarium as outlined</div>
                <div>• Travel and accommodation arrangements (if applicable)</div>
                <div>• Professional event production and support</div>
                <div>• Networking opportunities with industry leaders</div>
                <div>• Post-event content and marketing materials</div>
              </div>
              <p className="text-sm text-gray-900 mb-4">
                We believe your insights would provide tremendous value to our audience, and we would be honored 
                to have you as our speaker.
              </p>
              <p className="text-sm text-gray-900 mb-4">
                Please review the detailed proposal below and let me know if you would like to:
              </p>
              <div className="text-sm text-gray-900 mb-4 space-y-1">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  <span><strong>ACCEPT</strong> - Confirm your participation</span>
                </div>
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  <span><strong>DECLINE</strong> - Politely decline this opportunity</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">💬</span>
                  <span><strong>NEGOTIATE</strong> - Discuss modifications to the proposal</span>
                </div>
              </div>
              <p className="text-sm text-gray-900 mb-4">
                Looking forward to your response!
              </p>
              <p className="text-sm text-gray-900 mb-2">
                Best regards,
              </p>
              <p className="text-sm text-gray-900 mb-4">
                [Your name will be added automatically]
              </p>
              <p className="text-xs text-gray-500 italic">
                *This message will be sent to Dr. Jane Doe along with your booking proposal.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center items-center gap-4 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            className="px-6 py-2 border border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/5 transition-colors font-medium"
          >
            Previous
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/80 transition-colors font-medium"
          >
            Send Booking Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4;