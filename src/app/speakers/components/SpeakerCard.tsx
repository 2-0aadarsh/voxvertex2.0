import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Star, 
  Bookmark,
  Check,
  Eye,
  DollarSign,
  X
} from 'lucide-react';
import Step1 from './steps/step1';
import Step2 from './steps/step2';
import Step3 from './steps/step3';
import Step4 from './steps/step4';
import { Speaker } from '@/store/types';


// Extended Speaker interface for display purposes
interface DisplaySpeaker extends Omit<Speaker, 'availability'> {
  name: string;
  title: string;
  rating: number;
  bookings: number;
  price: number;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  tags: string[];
  specializations: string[];
  specialization: string;
  avatar?: string;
  industry?: string;
  activities?: string[];
  socialLinks?: Record<string, string>;
  availability?: {
    dates: string[];
    eventTypes: unknown[];
    modes: string[];
    timeSlots: unknown[];
  };
  rawData?: Record<string, unknown>;
}

interface SpeakerCardProps {
  speaker: DisplaySpeaker;
  isCompact?: boolean;
  onSaveSpeaker?: (speakerId: string, customTags: string[], notes?: string) => Promise<void>;
  showSaveButton?: boolean;
}

// Define the FormData interface to match Step4's requirements
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

const TagCard: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  position: { top: number; right: number };
  onSave: (tags: string[], notes: string) => void;
  isLoading?: boolean;
}> = ({ isVisible, onClose, position, onSave, isLoading = false }) => {
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleSave = () => {
    onSave(selectedTags, notes);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="absolute z-40 w-80 bg-white rounded-lg shadow-lg p-4 border"
      style={{ 
        top: position.top,
        right: position.right,
      }}
    >
      {/* New Tag Input */}
      <div className="mb-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="New tag..."
          className="w-full px-3 py-1 border text-sm border-[#FF6B35]/40 rounded-lg text-[#FF6B35] placeholder-[#FF6B35] focus:outline-none focus:border-[#FF6B35] bg-[#FF6B35]/5"
        />
      </div>

      {/* Predefined Tags */}
      <div className="space-y-2 mb-4">
        {selectedTags.map((tag, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="px-2 py-1 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-sm border border-[#FF6B35]/20">
              {tag}
            </span>
            <button
              onClick={() => handleRemoveTag(tag)}
              className="text-gray-400 hover:text-red-500 ml-2"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Notes Field */}
      <div className="mb-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes (optional)..."
          rows={2}
          className="w-full px-3 py-2 border text-sm border-[#FF6B35]/40 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:border-[#FF6B35] bg-[#FF6B35]/5 resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={handleAddTag}
          className="flex-1 bg-[#FF6B35] text-white px-1 py-1 rounded-lg hover:bg-[#FF6B35]/80 transition-colors font-medium"
        >
          Add
        </button>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white px-1 py-1 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button 
          onClick={onClose}
          className="flex-1 bg-[#FF6B35]/10 text-[#FF6B35] px-1 py-1 rounded-lg hover:bg-[#FF6B35]/20 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const SpeakerCard: React.FC<SpeakerCardProps> = ({ 
  speaker, 
  isCompact = false, 
  onSaveSpeaker, 
  showSaveButton = true 
}) => {
  const [isTagCardVisible, setIsTagCardVisible] = useState(false);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

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
  const router = useRouter(); // Correctly declare router here

  const handleViewProfile = () => {
    router.push(`/speakers_profile/${speaker._id}`); // Redirect with speaker ID
  };


  // Ensure speaker prop is provided
  if (!speaker) {
    console.error('SpeakerCard: speaker prop is required');
    return null;
  }

  const handleBookmarkClick = () => {
    setIsTagCardVisible(!isTagCardVisible);
  };

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

  // Handle saving speaker with tags
  const handleSaveSpeaker = async (tags: string[], notes: string) => {
    if (!onSaveSpeaker) return;
    
    setIsSaving(true);
    try {
      await onSaveSpeaker(speaker._id, tags, notes);
      setIsTagCardVisible(false);
    } catch (error) {
      console.error('Error saving speaker:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isCompact) {
    // 2 column
    return (
      <>
        <div className="bg-white rounded-xl border border-[#FF6B35]/80 shadow-sm p-6 hover:shadow-md transition-shadow relative">
          {showSaveButton && (
            <div 
              className="absolute top-4 right-4 cursor-pointer"
              onClick={handleBookmarkClick}
            >
              <Bookmark className="w-5 h-5 text-[#FF6B35] fill-current hover:scale-110 transition-transform" />
            </div>
          )}

          <TagCard
            isVisible={isTagCardVisible}
            onClose={() => setIsTagCardVisible(false)}
            position={{ top: 40, right: 0 }}
            onSave={handleSaveSpeaker}
            isLoading={isSaving}
          />
          
          {/* Top Section */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full flex-shrink-0 relative border-2 border-orange-200">
              <div className="w-full h-full bg-gray-300 rounded-full"></div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Name, Subtitle, Rating */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-black mb-1">{speaker.name}</h3>
              <p className="text-[#FF6B35] text-sm font-medium mb-1">{speaker.title}</p>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900">{speaker.rating}</span>
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="mb-4">
            <p className="text-sm text-black mb-3 leading-relaxed">
              {speaker.bio || "Leading AI researcher with 15+ years of experience in deep learning and neural networks."}
            </p>

            {/* Location */}
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{speaker.location}</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-1 mb-4">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">${speaker.price.toLocaleString()} - $8,000</span>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {speaker.tags && speaker.tags.length > 0 && (
                <>
                  {speaker.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="border border-orange-300 text-orange-600 px-3 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {speaker.tags.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                      +{speaker.tags.length - 3} more
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={handleViewProfile}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-[#FF6B35] text-[#FF6B35] px-4 py-2.5 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              View Profile
            </button>
            <button 
              onClick={handleBookSpeakerClick}
              className="flex-1 bg-[#FF6B35] text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Book speaker
            </button>
          </div>
        </div>

        {/* Booking Modal Steps - INTERCHANGED: Step 2 is now Step 1, Step 1 is now Step 2 */}
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
          speakerName={speaker.name}
          speakerExpertise={speaker.areaOfExpertise || []}
        />
      </>
    );
  }

  // 3 column layout cards
  return (
    <>
      <div className="bg-white rounded-xl border border-[#FF6B35] shadow-sm p-4 hover:shadow-md transition-shadow relative h-90">
        {showSaveButton && (
          <div 
            className="absolute top-3 right-3 cursor-pointer"
            onClick={handleBookmarkClick}
          >
            <Bookmark className="w-5 h-5 text-[#FF6B35] fill-current hover:scale-110 transition-transform" />
          </div>
        )}

        {/* Tag Card */}
        <TagCard
          isVisible={isTagCardVisible}
          onClose={() => setIsTagCardVisible(false)}
          position={{ top: 40, right: 0 }}
          onSave={handleSaveSpeaker}
          isLoading={isSaving}
        />
        
        {/* Top Section */}
        <div className="flex items-start gap-3 mb-4">
          {/* Profile Picture */}
          <div className="w-12 h-12 rounded-full flex-shrink-0 relative">
            <div className="w-full h-full bg-gray-300 rounded-full"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-black mb-1">{speaker.name}</h3>
            <p className="text-[#FF6B35] text-xs font-medium mb-1">{speaker.title}</p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs font-medium text-gray-900">{speaker.rating}</span>
            </div>
          </div>
        </div>

        {/* Desc */}
        <p className="text-xs text-black mb-4 leading-relaxed">
          {speaker.bio || "Leading AI researcher with 15+ years of experience in deep learning and neural networks."}
        </p>

        {/* Location, Price */}
        <div className="mb-4 space-y-1">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">{speaker.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">${speaker.price.toLocaleString()} - $8,000</span>
          </div>
        </div>

        {/* Tags Sec */}
        <div className="mb-14">
          <div className="flex flex-wrap gap-1">
            {speaker.tags && speaker.tags.length > 0 && (
              <>
                {speaker.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="border border-orange-300 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
                {speaker.tags.length > 3 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    +{speaker.tags.length - 3} more
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 absolute bottom-4 left-4 right-4">
          <button
           className="flex-1 flex items-center justify-center gap-1 bg-white border border-[#FF6B35] text-[#FF6B35] px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors text-xs font-medium"
           onClick={handleViewProfile}
           >
            <Eye className="w-3 h-3" />
            View Profile
          </button>
          <button 
            onClick={handleBookSpeakerClick}
            className="flex-1 bg-[#FF6B35] text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
          >
            Book speaker
          </button>
        </div>
      </div>

      {/* Booking Modal Steps - INTERCHANGED: Step 2 is now Step 1, Step 1 is now Step 2 */}
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
        speakerName={speaker.name}
        speakerExpertise={speaker.areaOfExpertise || []}
      />
    </>
  );
};

export default SpeakerCard;