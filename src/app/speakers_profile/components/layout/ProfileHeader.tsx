import React, { useState } from 'react';
import Image from 'next/image';
import { MapPin, Check } from 'lucide-react';
import { Speaker } from '@/store/types';
import Step1 from '../../../speakers/components/steps/step1';
import Step2 from '../../../speakers/components/steps/step2';
import Step3 from '../../../speakers/components/steps/step3';
import Step4 from '../../../speakers/components/steps/step4';

interface ProfileHeaderProps {
  speaker: Speaker;
}

// Define the FormData interface to match the booking steps
interface FormData {
  // Step 1 - Date & Time (previously Step 2)
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  
  // Step 2 - Event Details (previously Step 1)
  eventName: string;
  eventType: string;
  location: string;
  attendees: number;
  description?: string;
  
  // Step 3 - Preferences
  offerAmount: number;
  currency?: string;
  specialRequests?: string;
  topics?: string[];
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ speaker }) => {
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Add form data state to collect data from all steps
  const [formData, setFormData] = useState<FormData>({
    // Step 1 - Date & Time (previously Step 2)
    date: '',
    startTime: '',
    endTime: '',
    duration: 0,
    
    // Step 2 - Event Details (previously Step 1)
    eventName: '',
    eventType: '',
    location: '',
    attendees: 0,
    description: '',
    
    // Step 3 - Preferences
    offerAmount: 0,
    currency: '$',
    specialRequests: '',
    topics: []
  });

  const handleBookSpeakerClick = () => {
    setIsBookingModalVisible(true);
    setCurrentStep(1); // Reset to step 1 when opening modal
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalVisible(false);
    setCurrentStep(1); // Reset to step 1 when closing modal
    // Optionally reset form data
    setFormData({
      // Step 1 - Date & Time (previously Step 2)
      date: '',
      startTime: '',
      endTime: '',
      duration: 0,
      
      // Step 2 - Event Details (previously Step 1)
      eventName: '',
      eventType: '',
      location: '',
      attendees: 0,
      description: '',
      
      // Step 3 - Preferences
      offerAmount: 0,
      currency: '$',
      specialRequests: '',
      topics: []
    });
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 4) {
      // Handle booking request completion
      handleCloseBookingModal();
      // You can add success notification or redirect logic here
      console.log('Booking request sent successfully!', formData);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle editing from Step4
  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  // Function to update form data (you'll need to pass this to each step)
  const updateFormData = (stepData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  return (
    <>
  <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
    <div className="p-6 text-white relative" style={{ backgroundColor: '#FF6B35' }}>
      <div className="flex items-start space-x-6">
        <div className="relative flex-shrink-0">
          <div className="w-30 h-30 rounded-lg overflow-hidden border-2 border-white">
            {speaker.profileImageUrl ? (
              <Image
                src={speaker.profileImageUrl}
                alt={speaker.fullName || `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim() || 'Speaker'}
                width={120}
                height={120}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-lg font-medium">
                  {speaker.firstName?.charAt(0)}{speaker.lastName?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        </div>
        
        <div className="flex-1 pt-0">
          <h1 className="text-2xl font-semibold mb-1 text-black">
            {speaker.fullName || `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim() || 'Speaker'}
          </h1>
          <p className="text-sm opacity-90 mb-4">{speaker.professionalTitle || 'Speaker'}</p>
          {speaker.bio && (
            <p className="text-xs text-white/60 leading-relaxed mb-3">
              {speaker.bio}
            </p>
          )}
          
          {speaker.areaOfExpertise && speaker.areaOfExpertise.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5 mb-3">
              {speaker.areaOfExpertise.slice(0, 3).map((expertise, index) => (
                <span key={index} className="px-4 py-1 text-xs bg-white/20 border border-white border-opacity-30 rounded-lg">
                  {expertise}
                </span>
              ))}
              {speaker.areaOfExpertise.length > 3 && (
                <span className="px-4 py-1 text-xs bg-white/20 border border-white border-opacity-30 rounded-lg">
                  + {speaker.areaOfExpertise.length - 3} more
                </span>
              )}
            </div>
          )}
          
          {speaker.location && (
            <div className="flex space-x-6 mt-4 text-xs">
              <span className="flex items-center space-x-1 text-white-400">
                <MapPin className="h-3 w-3" />
                <span>{speaker.location}</span>
              </span>
              
            </div>
          )}
        </div>
        
        <button 
          className="px-9 py-2 bg-white rounded-lg text-sm font-medium self-start hover:shadow-md transition-shadow"
          style={{ color: '#FF6B35' }}
          onClick={handleBookSpeakerClick}
        >
          Book Speaker
        </button>
      </div>
    </div>
  </div>

  {/* Booking Modal Steps - Same as SpeakerCard */}
  <Step2
    isVisible={isBookingModalVisible && currentStep === 1}
    onClose={handleCloseBookingModal}
    onNext={handleNextStep}
    onPrevious={handlePreviousStep}
    formData={formData}
    updateFormData={updateFormData}
    speakerId={speaker._id}
  />
  <Step1
    isVisible={isBookingModalVisible && currentStep === 2}
    onClose={handleCloseBookingModal}
    onNext={handleNextStep}
    onPrevious={handlePreviousStep}
    formData={formData}
    updateFormData={updateFormData}
  />
  <Step3
    isVisible={isBookingModalVisible && currentStep === 3}
    onClose={handleCloseBookingModal}
    onNext={handleNextStep}
    onPrevious={handlePreviousStep}
    formData={formData}
    updateFormData={updateFormData}
  />
  <Step4
    isVisible={isBookingModalVisible && currentStep === 4}
    onClose={handleCloseBookingModal}
    onPrevious={handlePreviousStep}
    formData={formData}
    onEdit={handleEdit}
    speakerId={speaker._id}
    speakerName={speaker.fullName || `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim() || 'Speaker'}
    speakerExpertise={speaker.areaOfExpertise || []}
  />
    </>
  );
};

export default ProfileHeader;