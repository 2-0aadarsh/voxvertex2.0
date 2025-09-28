//last long msg
'use client';

import { Message } from '../types';

interface MessageProps {
  message: Message;
}
export function MessageComponent({ message }: MessageProps) {
  const isEventOrganizer = message.sender === 'event_organizer';
  
  if (message.type === 'proposal') {
    return (
      <div className="mb-4">
        <div className="flex justify-end">
          <div className="bg-[#FF6B35] text-white p-4 rounded-lg max-w-md">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 bg-gray-300 bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                <span className="text-xs">EO</span>
              </div>
              <span className="text-sm font-medium">Event Organizer</span>
            </div>
            
            <div className="space-y-3 text-sm">
              <p>Dear Dr. Jane Doe,</p>
              <p>I hope this message finds you well. I am reaching out to invite you to speak at our upcoming event based on your exceptional expertise in AI and Healthcare.</p>
              
              <div className="bg-[#FF6B35]  p-3 rounded">
                <p className="font-semibold mb-2">📋 SPEAKING OPPORTUNITY DETAILS:</p>
                <ul className="space-y-1 text-xs">
                  <li>📅 Event: [Event name will be filled from your details]</li>
                  <li>📍 Location: [Location will be filled from your details]</li>
                  <li>👥 Audience: [Expected attendees will be filled from your details]</li>
                  <li>⏰ Duration: [Session duration will be filled from your details]</li>
                  <li>💰 Compensation: [Compensation details will be filled from your details]</li>
                </ul>
              </div>
              
              <div className="bg-[#FF6B35] p-3 rounded">
                <p className="font-semibold mb-2">🎁 WHAT WE OFFER:</p>
                <ul className="space-y-1 text-xs list-disc list-inside">
                  <li>Professional speaking fee/honorarium as outlined</li>
                  <li>Travel and accommodation arrangements (if applicable)</li>
                  <li>Professional event production and support</li>
                  <li>Networking opportunities with industry leaders</li>
                  <li>Post-event content and marketing materials</li>
                </ul>
              </div>
              
              <p>We believe your insights would provide tremendous value to our audience, and we would be honored to have you as our speaker.</p>
              
              <p>Please review the detailed proposal below and let me know if you would like to:</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <span className="text-green-300 mr-2">✅</span>
                  <span>ACCEPT - Confirm your participation</span>
                </div>
                <div className="flex items-center">
                  <span className="text-red-300 mr-2">❌</span>
                  <span>DECLINE - Politely decline this opportunity</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-300 mr-2">🤝</span>
                  <span>NEGOTIATE - Discuss modifications to the proposal</span>
                </div>
              </div>
              
              <p>Looking forward to your response!</p>
              <p>Best regards,<br />[Your name will be added automatically]</p>
            </div>
            
            <div className="text-xs opacity-75 mt-3">
              {message.timestamp}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4 justify-center">
          <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
            Accept
          </button>
          <button className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
            Negotiate
          </button>
          <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
            Decline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isEventOrganizer ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md p-3 rounded-lg ${
        isEventOrganizer 
          ? 'bg-[#FF6B35] text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="flex items-center mb-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
            isEventOrganizer 
              ? 'bg-gray-300 bg-opacity-20' 
              : 'bg-gray-300'
          }`}>
            <span className="text-xs">
              {isEventOrganizer ? 'EO' : 'JD'}
            </span>
          </div>
          <span className="text-sm font-medium">
            {isEventOrganizer ? 'Event Organizer' : 'Dr. Jane Doe'}
          </span>
        </div>
        
        <p className="text-sm">{message.content}</p>
        
        <div className={`text-xs mt-2 ${isEventOrganizer ? 'opacity-75' : 'opacity-60'}`}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}
