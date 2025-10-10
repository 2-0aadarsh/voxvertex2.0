'use client';

import React from 'react';
import { Message as MessageType } from '../types/messagingTypes';
import { useAuth } from '@/store/hooks';
import BookingActionButtons from '@/components/BookingActionButtons';
import NegotiationActionButtons from '@/components/NegotiationActionButtons';

interface RealMessageProps {
  message: MessageType;
  conversationId?: string;
}

export function RealMessage({ message, conversationId }: RealMessageProps) {
  const { user } = useAuth();
  const isCurrentUser = message.sender._id === user?._id;
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getMessageTypeDisplay = (messageType: string) => {
    switch (messageType) {
      case 'booking_request':
        return 'Booking Request';
      case 'negotiation_proposal':
        return 'Negotiation Proposal';
      case 'negotiation_response':
        return 'Negotiation Response';
      case 'confirmation':
        return 'Confirmation';
      case 'text':
      default:
        return 'Message';
    }
  };


  // Handle booking request messages with special styling
  if (message.messageType === 'booking_request') {
    return (
      <div className="mb-6">
        <div className="flex justify-end">
          <div className="bg-[#FF6B35] text-black p-4 rounded-lg max-w-md shadow-lg">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                {message.sender.profileImageUrl ? (
                  <img 
                    src={message.sender.profileImageUrl} 
                    alt={message.sender.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white bg-opacity-20 flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {message.sender.firstName?.[0]}{message.sender.lastName?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <span className="text-sm font-medium">
                  {message.sender.firstName} {message.sender.lastName}
                </span>
                <div className="flex items-center mt-1">
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    {getMessageTypeDisplay(message.messageType)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="bg-white bg-opacity-10 p-3 rounded">
                <p className="font-semibold mb-2 text-black">📋 BOOKING REQUEST:</p>
                <div className="space-y-2 text-xs text-black">
                  <p><strong>Event:</strong> {message.metadata?.eventId ? 'Event Details' : 'Custom Event'}</p>
                  <p><strong>Booking ID:</strong> {message.metadata?.bookingId || 'N/A'}</p>
                  <p><strong>Amount:</strong> {message.metadata?.amount ? `₹${message.metadata.amount}` : 'To be discussed'}</p>
                  <p><strong>Currency:</strong> {message.metadata?.currency || 'INR'}</p>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-10 p-3 rounded">
                <p className="font-semibold mb-2 text-black">💬 MESSAGE:</p>
                <p className="text-black">{message.content}</p>
              </div>
              
            </div>
            
            <div className="text-xs opacity-75 mt-3 flex justify-between items-center text-white">
              <span>{formatTime(message.createdAt)}</span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-white">
                {message.status === 'sent' ? '✓' : message.status === 'sending' ? '⏳' : '✗'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action buttons for booking requests - only show for speakers */}
        {!isCurrentUser && user?.role === 'speaker' && (
          <div className="flex justify-end mt-2">
            <BookingActionButtons
              bookingId={message.metadata?.bookingId || ''}
              messageType={message.messageType}
              conversationId={conversationId}
              currentAmount={message.metadata?.amount}
              onMessageSent={() => {
                // Optional callback when message is sent
                console.log('Booking action completed');
              }}
            />
          </div>
        )}
      </div>
    );
  }

  // Handle negotiation messages
  if (message.messageType === 'negotiation_proposal' || message.messageType === 'negotiation_accepted' || message.messageType === 'negotiation_declined') {
    return (
      <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-md p-4 rounded-lg shadow-sm ${
          isCurrentUser 
            ? 'bg-[#FF6B35] text-white' 
            : 'bg-yellow-50 border border-yellow-200 text-gray-900'
        }`}>
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
              {message.sender.profileImageUrl ? (
                <img 
                  src={message.sender.profileImageUrl} 
                  alt={message.sender.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${
                  isCurrentUser ? 'bg-white bg-opacity-20' : 'bg-yellow-200'
                }`}>
                  <span className="text-sm font-bold">
                    {message.sender.firstName?.[0]}{message.sender.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <span className="text-sm font-medium">
                {message.sender.firstName} {message.sender.lastName}
              </span>
              <div className="flex items-center mt-1 text-black ">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isCurrentUser ? 'bg-white bg-opacity-20' : 'bg-yellow-200'
                }`}>
                  {getMessageTypeDisplay(message.messageType)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-sm mb-3">
            {message.content}
          </div>
          
          {message.metadata?.amount && (
            <div className={`p-3 rounded text-xs text-black ${
              isCurrentUser ? 'bg-white bg-opacity-10' : 'bg-yellow-100'
            }`}>
              <p className="font-semibold mb-2">💼 PROPOSAL DETAILS:</p>
              <div className="space-y-1">
                <p><strong>Amount:</strong> ₹{message.metadata.amount} {message.metadata.currency || 'INR'}</p>
                {message.metadata.proposalType && (
                  <p><strong>Type:</strong> {message.metadata.proposalType}</p>
                )}
              </div>
            </div>
          )}

          {/* Action buttons for negotiation proposals - only show for pending proposals */}
          {!isCurrentUser && 
           message.metadata?.negotiationId && 
           message.messageType === 'negotiation_proposal' &&
           (message.metadata.proposalType === 'initial' || message.metadata.proposalType === 'counter') && (
            <div className="flex justify-end mt-2">
              <NegotiationActionButtons
                negotiationId={message.metadata.negotiationId}
                messageType="negotiation_proposal"
                currentAmount={message.metadata.amount || 0}
                proposalStatus="pending"
                onMessageSent={() => {
                  console.log('Negotiation action completed');
                }}
              />
            </div>
          )}
          
          <div className={`text-xs mt-3 flex justify-between items-center ${
            isCurrentUser ? 'opacity-75' : 'opacity-60'
          }`}>
            <span>{formatTime(message.createdAt)}</span>
            <span className="bg-white text-black  bg-opacity-20 px-2 py-1 rounded">
              {message.status === 'sent' ? '✓' : message.status === 'sending' ? '⏳' : '✗'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Regular text messages
  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md p-3 rounded-lg shadow-sm ${
        isCurrentUser 
          ? 'bg-[#FF6B35] text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
            {message.sender.profileImageUrl ? (
              <img 
                src={message.sender.profileImageUrl} 
                alt={message.sender.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${
                isCurrentUser ? 'bg-white bg-opacity-20' : 'bg-gray-300'
              }`}>
                <span className="text-xs font-bold">
                  {message.sender.firstName?.[0]}{message.sender.lastName?.[0]}
                </span>
              </div>
            )}
          </div>
          <span className="text-sm font-medium">
            {message.sender.firstName} {message.sender.lastName}
          </span>
        </div>
        
        <p className="text-sm mb-2">{message.content}</p>
        
        <div className={`text-xs flex justify-between items-center ${
          isCurrentUser ? 'opacity-75' : 'opacity-60'
        }`}>
          <span>{formatTime(message.createdAt)}</span>
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
            {message.status === 'sent' ? '✓' : message.status === 'sending' ? '⏳' : '✗'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default RealMessage;

