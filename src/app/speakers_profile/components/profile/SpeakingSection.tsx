import React from 'react';
import { Star, Calendar, MapPin, Users } from 'lucide-react';
import { SpeakingEngagement } from '../../types';


const Events: React.FC = () => {
  const speakingEngagements = [
    {
      event: 'Tech Summit 2024',
      topic: 'Future of AI in Product Management',
      date: 'March 15, 2024',
      location: 'San Francisco, CA',
      attendees: '500 Attendees',
      rating: 4.9
    },
    {
      event: 'Healthcare Innovation Conference',
      topic: 'AI Ethics in Healthcare Technology',
      date: 'February 20, 2024',
      location: 'Boston, MA',
      attendees: '800 Attendees',
      rating: 4.8
    },
    {
      event: 'Global Product Summit',
      topic: 'Building AI-Powered Healthcare Products',
      date: 'January 10, 2024',
      location: 'New York, NY',
      attendees: '1200 Attendees',
      rating: 4.9
    },
    {
      event: 'Women in Tech Conference',
      topic: 'Leading Innovation in Male-Dominated Fields',
      date: 'December 5, 2023',
      location: 'Seattle, WA',
      attendees: '600 Attendees',
      rating: 5.0
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-900">Speaking Engagements</h2>
        
        <div className="space-y-4">
          {speakingEngagements.map((engagement, index) => (
            <div 
              key={index} 
              className="relative p-5 rounded-lg"
              style={{ backgroundColor: '#FFE2D8' }}
            >
              <div 
                className="absolute top-5 right-5 px-2 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-1"
                style={{ backgroundColor: '#FF6B35' }}
              >
                <Star className="h-3 w-3" />
                <span>{engagement.rating}</span>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{engagement.event}</h3>
              <p className="text-xs font-medium mb-3" style={{ color: '#FF6B35' }}>
                {engagement.topic}
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{engagement.date}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{engagement.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{engagement.attendees}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;