'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectUnreadCount, useGetUserConversationsQuery } from '@/store/slices/messagingSlice';
import { Conversation as ConversationType } from '@/app/messages/types/messagingTypes';
import { MessageSquare, Clock, User } from 'lucide-react';

interface RealConversationListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

export function RealConversationList({ 
  selectedConversationId,
  onSelectConversation 
}: RealConversationListProps) {
  // Use RTK Query directly in the component
  const { 
    data: conversationsData, 
    isLoading: conversationsLoading, 
    error: conversationsError 
  } = useGetUserConversationsQuery({ limit: 20, skip: 0 });
  
  const conversations = conversationsData?.conversations || [];

  // Get unread counts for all conversations at the top level
  const allUnreadCounts = useAppSelector((state) => state.messaging.unreadCounts);
  
  // No longer needed - using backend's otherParticipants field instead
  // const currentUserId = useAppSelector((state) => state.auth.user?._id);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getConversationTitle = (conversation: ConversationType) => {
    // Use pre-filtered otherParticipants from backend
    const otherParticipants = conversation.otherParticipants || [];
    
    // For direct conversations, just show the other person's name
    if (otherParticipants.length === 1) {
      return `${otherParticipants[0].firstName} ${otherParticipants[0].lastName}`;
    }
    
    // For group conversations (rare case)
    if (otherParticipants.length > 1) {
      return `${otherParticipants[0].firstName} and ${otherParticipants.length - 1} others`;
    }
    
    return 'Conversation';
  };

  const getConversationPreview = (conversation: ConversationType) => {
    if (conversation.context?.bookingRequest) {
      return 'Booking request conversation';
    }
    
    if (conversation.context?.topic) {
      return conversation.context.topic;
    }
    
    if (conversation.lastMessage && conversation.lastMessage.content) {
      return conversation.lastMessage.content.length > 50 
        ? `${conversation.lastMessage.content.substring(0, 50)}...`
        : conversation.lastMessage.content;
    }
    
    return 'No messages yet';
  };

  const getConversationStatus = (conversation: ConversationType) => {
    if (conversation.context?.bookingRequest) {
      return 'booking';
    }
    
    if (conversation.lastMessage?.messageType === 'booking_request') {
      return 'booking_request';
    }
    
    if (conversation.lastMessage?.messageType === 'negotiation_proposal') {
      return 'negotiating';
    }
    
    return 'active';
  };

  const getStatusColor = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-orange-500 text-white';
    }
    
    switch (status) {
      case 'booking_request':
        return 'bg-blue-100 text-blue-800';
      case 'booking':
        return 'bg-purple-100 text-purple-800';
      case 'negotiating':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'booking_request':
        return 'Booking Request';
      case 'booking':
        return 'Booking';
      case 'negotiating':
        return 'Negotiating';
      case 'confirmed':
        return 'Confirmed';
      default:
        return 'Active';
    }
  };

  // Loading state
  if (conversationsLoading) {
    return (
      <div className="h-full bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Conversations</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (conversationsError) {
    return (
      <div className="h-full bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Conversations</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-red-600 font-medium mb-1">Failed to load conversations</p>
            <p className="text-sm text-gray-500">
              {'message' in conversationsError ? conversationsError.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="h-full bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Conversations</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500">Start a conversation by booking a speaker</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Conversations</h2>
            <p className="text-sm text-gray-500 mt-1">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const isSelected = selectedConversationId === conversation._id;
          const status = getConversationStatus(conversation);
          const unreadCount = allUnreadCounts[conversation._id] || 0;
          
          return (
            <div
              key={conversation._id}
              onClick={() => onSelectConversation(conversation._id)}
              className={`border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                      {(() => {
                        // Use pre-filtered otherParticipants from backend
                        const otherParticipants = conversation.otherParticipants || [];
                        const otherParticipant = otherParticipants[0];
                        
                        if (otherParticipant?.profileImageUrl) {
                          return (
                            <img 
                              src={otherParticipant.profileImageUrl}
                              alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          );
                        }
                        
                        return (
                          <span className="text-white font-semibold text-sm">
                            {`${otherParticipant?.firstName?.[0] || ''}${otherParticipant?.lastName?.[0] || ''}`.toUpperCase()}
                          </span>
                        );
                      })()}
                      
                      {/* Online Status Indicator */}
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-medium truncate ${isSelected ? 'text-orange-700' : 'text-gray-900'}`}>
                        {getConversationTitle(conversation)}
                      </h3>
                      {conversation.lastMessage && (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs whitespace-nowrap">
                            {formatTimeAgo(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className={`text-sm truncate mb-2 ${isSelected ? 'text-orange-600' : 'text-gray-600'}`}>
                      {getConversationPreview(conversation)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status, isSelected)}`}>
                        {getStatusText(status)}
                      </span>
                      
                      {unreadCount > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full min-w-6 text-center ${
                          isSelected ? 'bg-orange-500 text-white' : 'bg-orange-500 text-white'
                        }`}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RealConversationList;