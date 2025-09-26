import React, { useState, useEffect } from 'react';
import { X, Plane, Building, Plus, Calendar } from 'lucide-react';

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
  const [speakerFeeSelected, setSpeakerFeeSelected] = useState(false);
  const [honorariumSelected, setHonorariumSelected] = useState(false);
  const [honorariumAmount, setHonorariumAmount] = useState('0');
  const [travelExpenses, setTravelExpenses] = useState(false);
  const [lodgingAccommodation, setLodgingAccommodation] = useState(false);
  const [additionalArrangements, setAdditionalArrangements] = useState(false);
  const [localTransportation, setLocalTransportation] = useState(false);
  const [meals, setMeals] = useState(false);
  const [additionalArrangementsText, setAdditionalArrangementsText] = useState('');
  
  // Date states
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  // Sync with formData when component mounts or when editing
  useEffect(() => {
    if (formData.offerAmount) setHonorariumAmount(formData.offerAmount.toString());
    if (formData.specialRequests) setAdditionalArrangementsText(formData.specialRequests);
  }, [formData]);

  // Generate the dynamic label based on selection
  const getAmountLabel = () => {
    if (speakerFeeSelected && honorariumSelected) {
      return 'Speaker and Honorarium Amount *';
    } else if (speakerFeeSelected) {
      return 'Speaker Amount *';
    } else if (honorariumSelected) {
      return 'Honorarium Amount *';
    } else {
      return 'Amount *';
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get minimum checkout date (day after checkin)
  const getMinCheckoutDate = () => {
    if (!checkInDate) return getMinDate();
    const checkinDate = new Date(checkInDate);
    checkinDate.setDate(checkinDate.getDate() + 1);
    return checkinDate.toISOString().split('T')[0];
  };

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
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900 text-center whitespace-nowrap">Date & Time</span>
              </div>

              <div className="w-16 h-px bg-[#FF6B35] mx-4"></div>

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

              <div className="w-16 h-px bg-gray-300 mx-4"></div>

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
                    speakerFeeSelected 
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSpeakerFeeSelected(!speakerFeeSelected)}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                      speakerFeeSelected 
                        ? 'border-[#FF6B35] bg-[#FF6B35]' 
                        : 'border-gray-300'
                    }`}>
                      {speakerFeeSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
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
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    honorariumSelected 
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setHonorariumSelected(!honorariumSelected)}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                      honorariumSelected 
                        ? 'border-[#FF6B35] bg-[#FF6B35]' 
                        : 'border-gray-300'
                    }`}>
                      {honorariumSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
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
            {(speakerFeeSelected || honorariumSelected) && (
              <div className="relative">
                <label className="block text-sm text-[#FF6B35] mb-2">
                  {getAmountLabel()}
                </label>
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
            )}
          </div>

          {/* Toggle Sections */}
          <div className="space-y-4 mb-6">
            {/* Travel Expenses */}
            <div className="border border-[#FF6B35] rounded-lg">
              <div className="p-4">
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

              {travelExpenses && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm appearance-none bg-white">
                        <option value="">Select travel Mode</option>
                        <option value="air">Air Travel</option>
                        <option value="train">Train</option>
                        <option value="car">Car Drive</option>
                        <option value="other">Other</option>
                      </select>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#FF6B35]">Travel Mode <span className="text-[#FF6B35]">*</span></label>
                    </div>
                    
                    <div className="relative">
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm appearance-none bg-white">
                        <option value="">Select arrangement</option>
                        <option value="arrange">We arrange and pay</option>
                        <option value="reimburse">Speaker books, we reimburse</option>
                      </select>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#FF6B35]">Arrangement</label>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0"
                      className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm bg-orange-50"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#FF6B35]">Amount <span className="text-[#FF6B35]">*</span></label>
                  </div>
                </div>
              )}
            </div>

            {/* Lodging & Accommodation */}
            <div className="border border-[#FF6B35] rounded-lg">
              <div className="p-4">
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

              {lodgingAccommodation && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm appearance-none bg-white">
                        <option value="">Select type</option>
                        <option value="hotel">Hotel</option>
                        <option value="corporate">Corporate Housing</option>
                        <option value="homestay">Home Stay</option>
                        <option value="other">Other</option>
                      </select>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#FF6B35]">Accommodation Type</label>
                    </div>
                    
                    <div className="relative">
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm appearance-none bg-white">
                        <option value="">Select arrangement</option>
                        <option value="arrange">We arrange and pay</option>
                        <option value="reimburse">Speaker books, we reimburse</option>
                      </select>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#FF6B35]">Arrangement</label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                      <div className="relative">
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          min={getMinDate()}
                          className="w-full px-3 py-2 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
                        />
                        
                      </div>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#FF6B35]">Check-in date</label>
                      {checkInDate && (
                        <div className="mt-1 text-xs text-gray-500">
                          {formatDateForDisplay(checkInDate)}
                        </div>
                      )}
                    </div>
                    
                    <div className="relative">
                      <div className="relative">
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          min={getMinCheckoutDate()}
                          className="w-full px-3 py-2 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
                        />
                        
                      </div>
                      <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#FF6B35]">Check Out Date</label>
                      {checkOutDate && (
                        <div className="mt-1 text-xs text-gray-500">
                          {formatDateForDisplay(checkOutDate)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0"
                      className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm bg-orange-50"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-[#FF6B35]">Amount <span className="text-[#FF6B35]">*</span></label>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Arrangements */}
            <div className="border border-[#FF6B35] rounded-lg">
              <div className="p-4">
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

              {additionalArrangements && (
                <div className="px-4 pb-4">
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