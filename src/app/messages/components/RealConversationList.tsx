'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectUnreadCount, useGetUserConversationsQuery } from '@/store/slices/messagingSlice';
import { Conversation as ConversationType } from '@/app/messages/types/messagingTypes';

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
  
  // Get current user ID from Redux store
  const currentUserId = useAppSelector((state) => state.auth.user?._id);

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
    // Get other participants (not current user) - ensure string comparison
    const otherParticipants = conversation.participants.filter(p => 
      p.user._id.toString() !== currentUserId?.toString()
    );
    
    // For direct conversations, just show the other person's name
    if (otherParticipants.length === 1) {
      return `${otherParticipants[0].user.firstName} ${otherParticipants[0].user.lastName}`;
    }
    
    // For group conversations (rare case)
    if (otherParticipants.length > 1) {
      return `${otherParticipants[0].user.firstName} and ${otherParticipants.length - 1} others`;
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
      return 'bg-[#FF6B35] text-white';
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
      <div className="w-80 h-full p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading conversations...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (conversationsError) {
    return (
      <div className="w-80 h-full p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-red-500 text-sm mb-2">Failed to load conversations</p>
                <p className="text-xs text-gray-500">
                  {'message' in conversationsError ? conversationsError.message : 'Unknown error'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="w-80 h-full p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No conversations yet</h3>
                <p className="text-xs text-gray-500">Start a conversation by booking a speaker</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <p className="text-xs text-gray-500 mt-1">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="overflow-y-auto flex-1" style={{ height: 'calc(100% - 88px)' }}>
          {conversations.map((conversation) => {
            const isSelected = selectedConversationId === conversation._id;
            const status = getConversationStatus(conversation);
            const unreadCount = allUnreadCounts[conversation._id] || 0;
            
            return (
              <div
                key={conversation._id}
                onClick={() => onSelectConversation(conversation._id)}
                className={`p-4 cursor-pointer transition-colors m-2 rounded-lg ${
                  isSelected 
                    ? 'bg-[#FF6B35] text-white shadow-md' 
                    : 'hover:bg-gray-50'
                }`}
                title={isSelected ? 'Click to close conversation' : 'Click to open conversation'}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    {/* Profile Image */}
                    <div className="w-12 h-12 rounded-full flex-shrink-0 mr-3 overflow-hidden bg-gray-200">
                      {(() => {
                        const otherParticipants = conversation.participants.filter(p => 
                          p.user._id.toString() !== currentUserId?.toString()
                        );
                        const otherParticipant = otherParticipants[0];
                        return otherParticipant?.user.profileImageUrl ? (
                          <img 
                            src={otherParticipant.user.profileImageUrl}
                            alt={`${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initials
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.nextElementSibling) {
                                (target.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null;
                      })()}
                      <div
                        className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm"
                        style={{ display: (() => {
                          const otherParticipants = conversation.participants.filter(p => 
                            p.user._id.toString() !== currentUserId?.toString()
                          );
                          const otherParticipant = otherParticipants[0];
                          return otherParticipant?.user.profileImageUrl ? 'none' : 'flex';
                        })() }}
                      >
                        {(() => {
                          const otherParticipants = conversation.participants.filter(p => 
                            p.user._id.toString() !== currentUserId?.toString()
                          );
                          const otherParticipant = otherParticipants[0];
                          return `${otherParticipant?.user.firstName?.[0] || ''}${otherParticipant?.user.lastName?.[0] || ''}`.toUpperCase();
                        })()}
                      </div>
                    </div>

                    {/* Conversation Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {getConversationTitle(conversation)}
                        </h3>
                        {unreadCount > 0 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isSelected ? 'bg-white text-[#FF6B35]' : 'bg-[#FF6B35] text-white'
                          }`}>
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-xs truncate ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                        {getConversationPreview(conversation)}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status, isSelected)}`}>
                          {getStatusText(status)}
                        </span>
                        {conversation.lastMessage && (
                          <span className={`text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                            {formatTimeAgo(conversation.lastMessage.timestamp)}
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
    </div>
  );
}

export default RealConversationList;
