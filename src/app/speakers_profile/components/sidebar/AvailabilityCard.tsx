import React, { useState, useEffect } from 'react';

interface AvailabilityCardProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

const AvailabilityCard: React.FC<AvailabilityCardProps> = ({ 
  selectedDate, 
  setSelectedDate 
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

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="p-4 text-white font-semibold" style={{ backgroundColor: '#FF6B35' }}>
        Availability
      </div>
      
      <div className="p-5">
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

        <div className="grid grid-cols-7 gap-1 mb-5">
          {dayHeaders.map((day, index) => (
            <div key={`header-${index}`} className="text-center text-xs text-gray-500 font-medium py-2">
              {day}
            </div>
          ))}
          
          {calendarDays.slice(0, 42).map((dateObj, index) => {
            const isSelected = isDateSelected(dateObj.date);
            const isTodayDate = isToday(dateObj.date);
            
            return (
              <button
                key={`day-${index}`}
                onClick={() => handleDateClick(dateObj)}
                className={`aspect-square flex items-center justify-center text-xs rounded transition-colors ${
                  isSelected
                    ? 'text-white'
                    : dateObj.isCurrentMonth
                    ? 'text-gray-900 hover:bg-gray-100'
                    : 'text-gray-400 hover:bg-gray-50'
                } ${
                  isTodayDate && !isSelected ? 'bg-blue-100 text-blue-600 font-semibold' : ''
                }`}
                style={isSelected ? { backgroundColor: '#FF6B35' } : {}}
              >
                {dateObj.day}
              </button>
            );
          })}
        </div>

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
      </div>
    </div>
  );
};

export default AvailabilityCard;