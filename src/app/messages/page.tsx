'use client';

import React, { Suspense, useState } from 'react';
import { useAuth } from '@/store/hooks';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';
import dynamic from 'next/dynamic';
import { Sidebar } from './components/Sidebar';
import { ConversationList } from './components/ConversationList';
import { MessageComponent } from './components/Message';
import { ChatInput } from './components/ChatInput';
import { ChatHeader } from './components/ChatHeader';
import { Message as MessageType, Conversation, User } from './types';

// Dynamic import for Navbar
const Navbar = dynamic(() => import('@/components/Navbar'), {
  loading: () => <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>,
  ssr: false
});

const currentUser: User = {
  name: 'John Doe',
  email: 'john@gmail.com',
  role: 'Senior Product Manager'
};

const conversations: Conversation[] = [
  {
    id: '1',
    title: 'Jane Doe - Innovate 2025',
    lastMessage: 'The fee of $7,000 has been confirmed',
    timestamp: '2m ago',
    status: 'negotiating'
  }
];

const initialMessages: MessageType[] = [
  {
    id: '1',
    sender: 'event_organizer',
    content: 'Hi Dr. Jane! We would love to have you speak at our Annual Tech Summit 2025. Are you available on March 15th?',
    timestamp: '4:20:37 PM'
  },
  {
    id: '2',
    sender: 'dr_jane_doe',
    content: 'Hello! Yes, I am available on March 15th. I would be delighted to speak at your event. What topic would you like me to focus on?',
    timestamp: '4:30:37 PM'
  },
  {
    id: '3',
    sender: 'event_organizer',
    content: 'Hi Dr. Jane! We would love to have you speak at our Annual Tech Summit 2025. Are you available on March 15th?',
    timestamp: '4:20:37 PM'
  },
  {
    id: '4',
    sender: 'dr_jane_doe',
    content: 'Hello! Yes, I am available on March 15th. I would be delighted to speak at your event. What topic would you like me to focus on?',
    timestamp: '4:30:37 PM'
  },
  {
    id: '5',
    sender: 'event_organizer',
    content: 'Proposal message content',
    timestamp: '4:20:37 PM',
    type: 'proposal'
  }
];

export default function MessagesPage() {
  // Authentication hooks
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  const [selectedConversation, setSelectedConversation] = useState('1');
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: any) => {
    if (!profileImage) return null;
    
    // Handle string URLs
    if (typeof profileImage === 'string') {
      if (profileImage.startsWith('http')) return profileImage;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`;
    }
    
    // Handle object with data and contentType (Buffer)
    if (typeof profileImage === 'object' && profileImage.data && profileImage.contentType) {
      const dataUrl = `data:${profileImage.contentType};base64,${profileImage.data.toString('base64')}`;
      return dataUrl;
    }
    
    // Handle object with url property
    if (typeof profileImage === 'object' && profileImage.url) {
      if (profileImage.url.startsWith('http')) return profileImage.url;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage.url}`;
    }
    
    return null;
  };

  const handleSendMessage = (content: string) => {
    const newMessage: MessageType = {
      id: Date.now().toString(),
      sender: 'event_organizer',
      content,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>}>
        <Navbar 
          user={user || undefined}
          currentUserData={currentUserData}
          isAuthenticated={isAuthenticated}
          forceHomepageStyle={true}
          getProfileImageUrl={getProfileImageUrl}
        />
      </Suspense>
      <div className="flex h-[calc(100vh-64px)]">
        <Sidebar currentUser={currentUser} />
        
        <div className="flex-1 flex flex-col ml-[20%]">
          <div className="bg-orange-50 border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600 mt-1">All your conversations and negotiations in one place.</p>
          </div>
          <div className="flex-1 flex">
            <ConversationList 
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={setSelectedConversation}
            />
            
            <div className="flex-1 flex flex-col">
              <ChatHeader />

              <div className="flex-1 p-6 overflow-y-auto bg-orange-50">
                {messages.map((message) => (
                  <MessageComponent key={message.id} message={message} />
                ))}
              </div>
              
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}