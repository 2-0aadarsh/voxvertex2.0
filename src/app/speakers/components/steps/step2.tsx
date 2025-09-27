import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetSpeakerAvailabilityForBookingQuery } from '@/store/slices/bookingSlice';

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

interface Step2Props {
  isVisible: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious?: () => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  speakerId?: string;
}

const Step2: React.FC<Step2Props> = ({ isVisible, onClose, onNext, formData, updateFormData, speakerId }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Debug logging
  console.log('🔍 Step2 Debug:', {
    speakerId,
    isVisible,
    skipCondition: !speakerId || !isVisible,
    willSkip: !speakerId || !isVisible
  });

  // Fetch speaker availability
  const {
    data: availabilityData,
    isLoading: isLoadingAvailability,
    error: availabilityError,
  } = useGetSpeakerAvailabilityForBookingQuery(
    { speakerId: speakerId || '' },
    { skip: !speakerId || !isVisible }
  );

  // Sync with formData when component mounts or when editing
  useEffect(() => {
    if (formData.date) setSelectedDate(formData.date);
    if (formData.startTime) setStartTime(formData.startTime);
    if (formData.endTime) setEndTime(formData.endTime);
  }, [formData]);

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    
    const diffInMs = endTime.getTime() - startTime.getTime();
    return Math.max(0, Math.floor(diffInMs / (1000 * 60))); // Convert to minutes
  };

  const handleNext = () => {
    // Validation
    if (!selectedDate) {
      alert('Please select an available date');
      return;
    }
    if (!startTime) {
      alert('Please select a start time');
      return;
    }
    if (!endTime) {
      alert('Please select an end time');
      return;
    }
    if (startTime >= endTime) {
      alert('End time must be after start time');
      return;
    }

    const duration = calculateDuration(startTime, endTime);
    
    // Save data to parent state
    updateFormData({
      date: selectedDate,
      startTime,
      endTime,
      duration
    });

    // Move to next step
    onNext();
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Check if a date is available
  const isDateAvailable = (day: number): boolean => {
    if (!availabilityData?.data?.dates) return false;
    
    const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(dateString);
    
    return availabilityData.data.dates.some(availableDate => {
      const availableDateObj = new Date(availableDate);
      return availableDateObj.toDateString() === date.toDateString();
    });
  };

  const handleDateSelect = (day: number) => {
    if (day && isDateAvailable(day)) {
      const dateString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setSelectedDate(dateString);
    }
  };

  if (!isVisible) return null;

  const days = getDaysInMonth(currentMonth);
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
              {/* Step 1 - Date & Time (current) */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="mt-2 text-sm font-medium text-gray-900 text-center whitespace-nowrap">Date & Time</span>
              </div>
              
              {/* Line 1 */}
              <div className="w-16 h-px bg-gray-300 mx-4"></div>
              
              {/* Step 2 - Event Details */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="mt-2 text-sm text-gray-500 text-center whitespace-nowrap">Event Details</span>
              </div>
              
              {/* Line 2 */}
              <div className="w-16 h-px bg-gray-300 mx-4"></div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="mt-2 text-sm text-gray-500 text-center whitespace-nowrap">Compensation & Arrangements</span>
              </div>
              
              {/* Line 3 */}
              <div className="w-16 h-px bg-gray-300 mx-4"></div>
              
              {/* Step 4 */}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Date & Time</h3>
            <p className="text-gray-600 text-sm">Choose when you need them</p>
          </div>

          {/* Speaker Availability Status
          {speakerId && (
            <div className="mb-6">
              {isLoadingAvailability ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF6B35]"></div>
                  <span className="ml-3 text-gray-600 text-sm">Loading speaker availability...</span>
                </div>
              ) : availabilityError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">
                    Unable to load speaker availability. Please try again.
                  </p>
                </div>
              ) : availabilityData?.data ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm">
                    ✅ Speaker has {availabilityData.data.count} available date(s)
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-700 text-sm">
                    ⚠️ This speaker hasn&apos;t set their availability yet.
                  </p>
                </div>
              )}
            </div>
          )} */}

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Select Date */}
            <div className="relative">
              <label className="block text-xs font-medium text-[#FF6B35] mb-2">
                Select Date *
              </label>
              
              {/* Calendar - Made smaller and centered */}
              <div className="flex justify-center">
                <div className="border border-gray-300 rounded-lg p-4 bg-white w-80">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h3 className="text-sm font-medium text-gray-900">
                      {formatMonth(currentMonth)}
                    </h3>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map((day, index) => (
                      <div key={index} className="text-center text-xs font-medium text-gray-500 p-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      const isAvailable = day ? isDateAvailable(day) : false;
                      const isSelected = day && selectedDate.endsWith(String(day).padStart(2, '0'));
                      
                      return (
                        <button
                          key={index}
                          onClick={() => day !== null && handleDateSelect(day)}
                          disabled={!day || !isAvailable}
                          className={`
                            text-center text-sm p-2 rounded transition-colors
                            ${!day ? 'invisible' : ''}
                            ${isSelected
                              ? 'bg-[#FF6B35] text-white' 
                              : isAvailable
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                                : 'text-gray-400 cursor-not-allowed'
                            }
                          `}
                          title={day && !isAvailable ? 'Not available' : ''}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Footer */}
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button className="px-4 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                      Cancel
                    </button>
                    <button className="px-4 py-1 text-sm bg-[#FF6B35] text-white rounded hover:bg-[#FF6B35]/80">
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferred Time Slot */}
            <div>
              <label className="block text-xs font-medium text-[#FF6B35] mb-4">
                Preferred Time Slot
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div className="relative">
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-1 pt-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-xs text-gray-900 appearance-none bg-white"
                  >
                    <option value="">Choose Time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </select>
                  <label className="absolute left-3 top-[-6] text-xs font-medium text-[#FF6B35] bg-white">
                    Start Time *
                  </label>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* End Time */}
                <div className="relative">
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-1 pt-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-xs text-gray-900 appearance-none bg-white"
                  >
                    <option value="">Choose Time</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                  </select>
                  <label className="absolute left-3 top-[-6] text-xs font-medium text-[#FF6B35] bg-white">
                    End Time *
                  </label>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Only Cancel and Next since this is now step 1 */}
        <div className="flex justify-center items-center gap-4 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
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

export default Step2;