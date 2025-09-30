'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/store/hooks';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import RealConversationList from './components/RealConversationList';
import { ChatHeader } from './components/ChatHeader';
import RealTimeMessageList from '@/components/RealTimeMessageList';
import RealTimeMessageInput from '@/components/RealTimeMessageInput';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useSocket } from '@/hooks/useSocket';
import { setActiveConversation } from '@/store/slices/messagingSlice';
import { useGetUserConversationsQuery } from '@/store/slices/messagingSlice';

// Dynamic import for Navbar
const Navbar = dynamic(() => import('@/components/Navbar'), {
  loading: () => <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>,
  ssr: false
});


export default function MessagesPage() {
  // Authentication hooks
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Redux hooks
  const dispatch = useAppDispatch();
  const activeConversationId = useAppSelector((state) => state.messaging.activeConversationId);

  // RTK Query hooks
  const { 
    data: conversationsData, 
    isLoading: conversationsLoading
  } = useGetUserConversationsQuery({ limit: 20, skip: 0 });

  // Socket hooks
  const { joinConversation, leaveConversation } = useSocket();

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: unknown) => {
    if (!profileImage) return null;
    
    // Handle string URLs
    if (typeof profileImage === 'string') {
      if (profileImage.startsWith('http')) return profileImage;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`;
    }
    
    // Handle object with data and contentType (Buffer)
    if (typeof profileImage === 'object' && profileImage !== null) {
      const obj = profileImage as Record<string, unknown>;
      if ('data' in obj && 'contentType' in obj) {
        const dataUrl = `data:${obj.contentType};base64,${obj.data}`;
        return dataUrl;
      }
      
      // Handle object with url property
      if ('url' in obj && typeof obj.url === 'string') {
        if (obj.url.startsWith('http')) return obj.url;
        return `https://res.cloudinary.com/demo/image/fetch/${obj.url}`;
      }
    }
    
    return null;
  };

  // Get conversations from RTK Query data
  const conversations = conversationsData?.conversations || [];
  
  // Get the active conversation data
  const activeConversation = activeConversationId 
    ? conversations.find(conv => conv._id === activeConversationId)
    : null;

  // Handle conversation selection with toggle functionality
  const handleSelectConversation = (conversationId: string) => {
    // If clicking on the same conversation, close it (toggle off)
    if (activeConversationId === conversationId) {
      // Leave current conversation room
      leaveConversation(conversationId);
      // Clear active conversation
      dispatch(setActiveConversation(null));
      return;
    }

    // If clicking on a different conversation, switch to it
    // Leave previous conversation room
    if (activeConversationId && activeConversationId !== conversationId) {
      leaveConversation(activeConversationId);
    }

    // Set active conversation
    dispatch(setActiveConversation(conversationId));

    // Join new conversation room
    joinConversation(conversationId);
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
        <Sidebar userRole="newuser" />
        
        <div className="flex-1 flex flex-col ml-[20%]">
          <div className="bg-orange-50 border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600 mt-1">All your conversations and negotiations in one place.</p>
          </div>
          <div className="flex-1 flex">
            {/* Real Conversation List */}
            <RealConversationList 
              selectedConversationId={activeConversationId || undefined}
              onSelectConversation={handleSelectConversation}
            />
            
            <div className="flex-1 flex flex-col">
              <ChatHeader conversation={activeConversation} />

              {/* Always use real-time components */}
              {activeConversationId ? (
                <>
                  <RealTimeMessageList 
                    conversationId={activeConversationId}
                    className="flex-1"
                    autoScroll={true}
                  />
                  <RealTimeMessageInput 
                    conversationId={activeConversationId}
                    placeholder="Type your message..."
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-orange-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-sm text-gray-500">
                      {conversationsLoading ? 'Loading conversations...' : 
                       conversations.length === 0 ? 'No conversations yet. Book a speaker to start chatting!' :
                       'Choose a conversation from the list to start messaging'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}