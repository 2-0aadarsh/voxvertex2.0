import React, { useState } from 'react';
import { 
  X, 
  Edit, 
  MapPin, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  Car,
  CheckCircle,
  XCircle,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/authSlice';

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
  onPrevious: () => void;
  formData: FormData; 
  onEdit: (step: number) => void;
  speakerName?: string;
  speakerExpertise?: string[];
  speakerId?: string;
}

const Step4: React.FC<Step4Props> = ({ 
  isVisible, 
  onClose, 
  onPrevious, 
  formData,
  onEdit,
  speakerName = 'Speaker',
  speakerExpertise = ['Expertise'],
  speakerId
}) => {
  const currentUser = useSelector(selectUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!speakerId) {
      setSubmitError('Speaker ID is required');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/book-speaker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          speakerId,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          eventName: formData.eventName,
          eventType: formData.eventType,
          location: formData.location,
          attendees: formData.attendees,
          description: formData.description,
          offerAmount: formData.offerAmount,
          currency: formData.currency === '$' ? 'USD' : formData.currency === '₹' ? 'INR' : formData.currency || 'USD',
          specialRequests: formData.specialRequests,
          personalMessage: message.greeting + '\n\n' + message.introduction + '\n\n' + 
            'SPEAKING OPPORTUNITY DETAILS:\n' +
            `📍 Event: ${message.eventDetails.event}\n` +
            `📍 Location: ${message.eventDetails.location}\n` +
            `👥 Audience: ${message.eventDetails.audience}\n` +
            `⏰ Duration: ${message.eventDetails.duration}\n` +
            `📅 Date: ${message.eventDetails.date}\n` +
            `🕐 Time: ${message.eventDetails.time}\n` +
            `💰 Compensation: ${message.eventDetails.compensation}\n` +
            `🚗 Special Arrangements: ${message.eventDetails.specialArrangements}\n\n` +
            'WHAT WE OFFER:\n' +
            '• Professional speaking fee/honorarium as outlined\n' +
            '• Travel and accommodation arrangements (if applicable)\n' +
            '• Professional event production and support\n' +
            '• Networking opportunities with industry leaders\n' +
            '• Post-event content and marketing materials\n\n' +
            'We believe your insights would provide tremendous value to our audience, and we would be honored to have you as our speaker.\n\n' +
            'Please review the detailed proposal below and let me know if you would like to:\n' +
            '✅ ACCEPT - Confirm your participation\n' +
            '❌ DECLINE - Politely decline this opportunity\n' +
            '🤝 NEGOTIATE - Discuss modifications to the proposal\n\n' +
            'Looking forward to your response!\n\n' +
            message.closing.regards + '\n' +
            message.closing.name
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send booking request');
      }

      console.log('Booking request sent successfully:', result);
      
      // Close modal and show success
      onClose();
      
      // You can add a success notification here
      alert('Booking request sent successfully! The speaker will receive a message with your proposal.');

    } catch (error) {
      console.error('Error sending booking request:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to send booking request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleEdit = () => {
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

  // Generate dynamic personal message
  const generatePersonalMessage = () => {
    const organizerName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : 'Organizer';
    const expertiseText = speakerExpertise.length > 0 ? speakerExpertise.join(', ') : 'your field of expertise';
    const eventDate = formData.date ? new Date(formData.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'TBD';
    
    return {
      greeting: `Dear ${speakerName},`,
      introduction: `I hope this message finds you well. I am reaching out to invite you to speak at our upcoming "${formData.eventName || 'event'}" ${formData.eventType?.toLowerCase() || 'event'} based on your exceptional expertise in ${expertiseText}.`,
      eventDetails: {
        event: formData.eventName || 'Event',
        location: formData.location || 'Location',
        audience: `${formData.attendees || 0} attendees`,
        duration: formData.duration ? formatDuration(formData.duration) : 'TBD',
        date: eventDate,
        time: formData.startTime && formData.endTime 
          ? `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`
          : 'TBD',
        compensation: formData.offerAmount 
          ? `${formData.currency || '$'}${formData.offerAmount.toLocaleString()}`
          : 'TBD',
        specialArrangements: formData.specialRequests || 'None specified'
      },
      closing: {
        regards: 'Best regards,',
        name: organizerName,
        note: `*This message will be sent to ${speakerName} along with your booking proposal.`
      }
    };
  };

  const message = generatePersonalMessage();

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

              <div className="w-16 h-px bg-[#FF6B35] mx-4"></div>

              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900 text-center whitespace-nowrap">Compensation & Arrangements</span>
              </div>

              <div className="w-16 h-px bg-[#FF6B35] mx-4"></div>
  
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

          {/* Error Message */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Personal Message */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-[#FF6B35] mb-4">Personal Message</h4>
            <div className="bg-gray-50 border border-[#FF6B35] rounded-lg p-4">
              <p className="text-sm text-gray-900 mb-4">
                {message.greeting}
              </p>
              <p className="text-sm text-gray-900 mb-4">
                {message.introduction}
              </p>
              <p className="text-sm text-gray-900 mb-4 font-medium">
                SPEAKING OPPORTUNITY DETAILS:
              </p>
              <div className="text-sm text-gray-900 mb-4 space-y-1">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Event:</strong> {message.eventDetails.event}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Location:</strong> {message.eventDetails.location}</span>
                </div>
                <div className="flex items-start">
                  <Users className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Audience:</strong> {message.eventDetails.audience}</span>
                </div>
                <div className="flex items-start">
                  <Clock className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Duration:</strong> {message.eventDetails.duration}</span>
                </div>
                <div className="flex items-start">
                  <Calendar className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Date:</strong> {message.eventDetails.date}</span>
                </div>
                <div className="flex items-start">
                  <Clock className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Time:</strong> {message.eventDetails.time}</span>
                </div>
                <div className="flex items-start">
                  <DollarSign className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Compensation:</strong> {message.eventDetails.compensation}</span>
                </div>
                <div className="flex items-start">
                  <Car className="w-4 h-4 text-[#FF6B35] mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Special Arrangements:</strong> {message.eventDetails.specialArrangements}</span>
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
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  <span><strong>ACCEPT</strong> - Confirm your participation</span>
                </div>
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                  <span><strong>DECLINE</strong> - Politely decline this opportunity</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                  <span><strong>NEGOTIATE</strong> - Discuss modifications to the proposal</span>
                </div>
              </div>
              <p className="text-sm text-gray-900 mb-4">
                Looking forward to your response!
              </p>
              <p className="text-sm text-gray-900 mb-2">
                {message.closing.regards}
              </p>
              <p className="text-sm text-gray-900 mb-4">
                {message.closing.name}
              </p>
              <p className="text-xs text-gray-500 italic">
                {message.closing.note}
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
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Booking Request'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step4;