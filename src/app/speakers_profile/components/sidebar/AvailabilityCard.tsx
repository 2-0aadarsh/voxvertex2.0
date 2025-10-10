import React, { useState, useEffect } from 'react';
import { AvailabilityData } from '@/store/slices/speakerProfileSlice';

interface AvailabilityCardProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  availability?: AvailabilityData;
  isLoading?: boolean;
  error?: unknown;
}

const AvailabilityCard: React.FC<AvailabilityCardProps> = ({ 
  selectedDate, 
  setSelectedDate,
  availability,
  isLoading = false,
  error
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPrevMonth: true,
      date: new Date(year, month - 1, daysInPrevMonth - i)
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isPrevMonth: false,
      date: new Date(year, month, day)
    });
  }

  const remainingCells = 42 - calendarDays.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isPrevMonth: false,
      date: new Date(year, month + 1, day)
    });
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const handleDateClick = (dateObj: { date: Date; isCurrentMonth: boolean }) => {
    if (!dateObj.isCurrentMonth) {
      setCurrentDate(new Date(dateObj.date.getFullYear(), dateObj.date.getMonth(), 1));
    }
    setSelectedDate(dateObj.date);
  };

  // Check if a date is available
  const isDateAvailable = (date: Date): boolean => {
    if (!availability?.dates) return false;
    
    const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    return availability.dates.some(availableDate => {
      const availableDateObj = new Date(availableDate);
      return availableDateObj.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 text-white font-semibold" style={{ backgroundColor: '#FF6B35' }}>
        Availability
      </div>
      
      <div className="p-5">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF6B35]"></div>
            <span className="ml-3 text-gray-600 text-sm">Loading availability...</span>
          </div>
        )}

        

       

        {!isLoading && (
          <>
            <div className="flex items-center justify-between mb-5">
              <button 
                onClick={() => navigateMonth('prev')}
                className="text-gray-600 hover:text-gray-900 p-1"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-sm font-semibold text-gray-900">
                {monthNames[month]} {year}
              </div>
              
              <button 
                onClick={() => navigateMonth('next')}
                className="text-gray-600 hover:text-gray-900 p-1"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}

            <div className="grid grid-cols-7 gap-1 mb-5">
              {dayHeaders.map((day, index) => (
                <div key={`header-${index}`} className="text-center text-xs text-gray-500 font-medium py-2">
                  {day}
                </div>
              ))}
              
              {calendarDays.slice(0, 42).map((dateObj, index) => {
                const isSelected = isDateSelected(dateObj.date);
                const isTodayDate = isToday(dateObj.date);
                const isAvailable = isDateAvailable(dateObj.date);
                
                return (
                  <button
                    key={`day-${index}`}
                    onClick={() => handleDateClick(dateObj)}
                    disabled={!dateObj.isCurrentMonth || !isAvailable}
                    className={`aspect-square flex items-center justify-center text-xs rounded transition-colors ${
                      isSelected
                        ? 'text-white'
                        : !dateObj.isCurrentMonth
                        ? 'text-gray-300 cursor-not-allowed'
                        : isAvailable
                        ? 'text-gray-900 hover:bg-green-100 cursor-pointer'
                        : 'text-gray-400 cursor-not-allowed'
                    } ${
                      isTodayDate && !isSelected ? 'bg-blue-100 text-blue-600 font-semibold' : ''
                    } ${
                      isAvailable && dateObj.isCurrentMonth && !isSelected ? 'bg-green-50' : ''
                    }`}
                    style={isSelected ? { backgroundColor: '#FF6B35' } : {}}
                    title={
                      !dateObj.isCurrentMonth 
                        ? 'Not in current month' 
                        : !isAvailable 
                        ? 'Not available' 
                        : 'Available'
                    }
                  >
                    {dateObj.day}
                  </button>
                );
              })}
            </div>
        

        {!isLoading && (
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setSelectedDate(null)}
              className="text-xs text-gray-500 px-4 py-2 hover:text-gray-700"
            >
              Cancel
            </button>
            <button 
              className="text-xs text-white px-4 py-2 rounded hover:opacity-90"
              style={{ backgroundColor: '#FF6B35' }}
              disabled={!selectedDate}
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCard;