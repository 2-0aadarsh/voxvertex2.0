import React, { useState, useEffect } from 'react';
import { X, Plane, Building, Plus } from 'lucide-react';

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

interface Step3Props {
  isVisible: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
}

const Step3: React.FC<Step3Props> = ({ isVisible, onClose, onNext, onPrevious, formData, updateFormData }) => {
  const [compensationType, setCompensationType] = useState('Speaker Fee');
  const [honorariumAmount, setHonorariumAmount] = useState('0');
  const [travelExpenses, setTravelExpenses] = useState(false);
  const [lodgingAccommodation, setLodgingAccommodation] = useState(false);
  const [additionalArrangements, setAdditionalArrangements] = useState(false);
  const [localTransportation, setLocalTransportation] = useState(false);
  const [meals, setMeals] = useState(false);
  const [additionalArrangementsText, setAdditionalArrangementsText] = useState('');

  // Sync with formData when component mounts or when editing
  useEffect(() => {
    if (formData.offerAmount) setHonorariumAmount(formData.offerAmount.toString());
    if (formData.specialRequests) setAdditionalArrangementsText(formData.specialRequests);
  }, [formData]);

  const handleNext = () => {
    // Convert offer amount to number
    const offerAmountNum = parseInt(honorariumAmount) || 0;

    // Save data to parent state
    updateFormData({
      offerAmount: offerAmountNum,
      specialRequests: additionalArrangementsText,
      currency: '$'
    });

    // Move to next step
    onNext();
  };

  const handlePrevious = () => {
    // Save current data before going back
    const offerAmountNum = parseInt(honorariumAmount) || 0;
    updateFormData({
      offerAmount: offerAmountNum,
      specialRequests: additionalArrangementsText,
      currency: '$'
    });
    
    onPrevious();
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

        {/* Progress Bar */}
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
              
              {/* Step 3 - Compensation & Arrangements (current) */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900 text-center whitespace-nowrap">Compensation & Arrangements</span>
              </div>
              
              {/* Line 3 - Gray since step 4 is not reached */}
              <div className="w-16 h-px bg-gray-300 mx-4"></div>
              
              {/* Step 4 - Review & Send (inactive) */}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Compensation & Arrangements</h3>
            <p className="text-gray-600 text-sm">Define the compensation and additional arrangements for your speaker.</p>
          </div>

          {/* Primary Compensation Section */}
          <div className="border border-[#FF6B35] rounded-lg p-6 mb-6">
            <h4 className="font-medium text-gray-900 mb-4">Primary Compensation</h4>
            <div className="mb-4">
              <label className="block text-sm text-[#FF6B35] mb-2">Compensation Type *</label>
              <div className="grid grid-cols-2 gap-4">
                {/* Speaker Fee */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    compensationType === 'Speaker Fee' 
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCompensationType('Speaker Fee')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      compensationType === 'Speaker Fee' 
                        ? 'border-[#FF6B35] bg-[#FF6B35]' 
                        : 'border-gray-300'
                    }`}>
                      {compensationType === 'Speaker Fee' && (
                        <div className="w-full h-full rounded-full bg-[#FF6B35]"></div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Speaker Fee</h5>
                      <p className="text-sm text-gray-500">Professional speaking fee</p>
                    </div>
                  </div>
                </div>

                {/* Honorarium */}
                <div 
                  className={`border border-[#FF6B35] rounded-lg p-4 cursor-pointer transition-all ${
                    compensationType === 'Honorarium' 
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCompensationType('Honorarium')}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      compensationType === 'Honorarium' 
                        ? 'border-[#FF6B35] bg-[#FF6B35]' 
                        : 'border-gray-300'
                    }`}>
                      {compensationType === 'Honorarium' && (
                        <div className="w-full h-full rounded-full bg-[#FF6B35]"></div>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">Honorarium</h5>
                      <p className="text-sm text-gray-500">Token of appreciation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Honorarium Amount */}
            <div className="relative">
              <label className="block text-sm text-[#FF6B35] mb-2">Honorarium Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="text"
                  value={honorariumAmount}
                  onChange={(e) => setHonorariumAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
                />
              </div>
            </div>
          </div>

          {/* Toggle Sections */}
          <div className="space-y-4 mb-6">
            {/* Travel Expenses */}
            <div className="border border-[#FF6B35] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Plane className="w-5 h-5 text-[#FF6B35] mr-3" />
                  <span className="font-medium text-gray-900">Travel Expenses</span>
                </div>
                <button
                  onClick={() => setTravelExpenses(!travelExpenses)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    travelExpenses ? 'bg-[#FF6B35]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    travelExpenses ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
            </div>

            {/* Lodging & Accommodation */}
            <div className="border border-[#FF6B35] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-[#FF6B35] mr-3" />
                  <span className="font-medium text-gray-900">Lodging & Accommodation</span>
                </div>
                <button
                  onClick={() => setLodgingAccommodation(!lodgingAccommodation)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    lodgingAccommodation ? 'bg-[#FF6B35]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    lodgingAccommodation ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
            </div>

            {/* Additional Arrangements */}
            <div className="border border-[#FF6B35] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Plus className="w-5 h-5 text-[#FF6B35] mr-3" />
                  <span className="font-medium text-gray-900">Additional Arrangements</span>
                </div>
                <button
                  onClick={() => setAdditionalArrangements(!additionalArrangements)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    additionalArrangements ? 'bg-[#FF6B35]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    additionalArrangements ? 'translate-x-6' : 'translate-x-0.5'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Additional Arrangements Expanded Section */}
          {additionalArrangements && (
            <div className="border border-[#FF6B35] rounded-lg p-6 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Additional Arrangements</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Local Transportation */}
                <div 
                  className={`border-1 border-[#FF6B35] rounded-lg p-4 cursor-pointer transition-all ${
                    localTransportation 
                      ? 'bg-[#FF6B35]/5' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setLocalTransportation(!localTransportation)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">Local Transportation</h5>
                      <p className="text-sm text-gray-500">Airport pickup, local transport</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${
                      localTransportation ? 'bg-[#FF6B35]' : 'border border-gray-300'
                    }`}></div>
                  </div>
                </div>

                {/* Meals */}
                <div 
                  className={`border-1 border-[#FF6B35] rounded-lg p-4 cursor-pointer transition-all ${
                    meals 
                      ? 'bg-[#FF6B35]/5' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setMeals(!meals)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">Meals</h5>
                      <p className="text-sm text-gray-500">Breakfast, lunch, dinner</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${
                      meals ? 'bg-[#FF6B35]' : 'border border-gray-300'
                    }`}></div>
                  </div>
                </div>
              </div>

              {/* Additional Arrangements Text */}
              <div>
                <label className="block text-sm text-[#FF6B35] mb-2">Additional Arrangements</label>
                <textarea
                  value={additionalArrangementsText}
                  onChange={(e) => setAdditionalArrangementsText(e.target.value)}
                  rows={3}
                  placeholder="Any other expenses or special arrangements..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* Bottom Section - Always visible */}
          <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-orange-50">
            <h4 className="font-medium text-gray-900 mb-4">Additional Arrangements</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Local Transportation */}
              <div className="border-1 border-[#FF6B35] rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">Local Transportation</h5>
                    <p className="text-sm text-gray-500">Airport pickup, local transport</p>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#FF6B35]"></div>
                </div>
              </div>

              {/* Meals */}
              <div className="border-1 border-[#FF6B35] rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">Meals</h5>
                    <p className="text-sm text-gray-500">Breakfast, lunch, dinner</p>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#FF6B35]"></div>
                </div>
              </div>
            </div>

            {/* Additional Arrangements Text */}
            <div>
              <label className="block text-sm text-[#FF6B35] mb-2">Additional Arrangements</label>
              <textarea
                value={additionalArrangementsText}
                onChange={(e) => setAdditionalArrangementsText(e.target.value)}
                rows={3}
                placeholder="Any other expenses or special arrangements..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm resize-none"
              />
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

export default Step3;