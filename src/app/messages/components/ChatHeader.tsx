'use client';

import { MessageSquare, Users, Clock } from 'lucide-react';
import { Conversation } from '../types/messagingTypes';
import { useAuth } from '@/store/hooks';
import { useState } from 'react';
import NegotiationModal from '@/components/NegotiationModal';
import { useCreateNegotiationMutation, useGetNegotiationByConversationQuery } from '@/store/slices/negotiationSlice';
import { useAppSelector } from '@/store/hooks';

interface ChatHeaderProps {
  conversation: Conversation | null;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const { user } = useAuth();
  const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);
  
  // Negotiation API hooks
  const [createNegotiation, { isLoading: isCreatingNegotiation }] = useCreateNegotiationMutation();
  const { data: negotiationData } = useGetNegotiationByConversationQuery(
    conversation?._id || '',
    { skip: !conversation?._id }
  );
  
  // Redux selectors
  const activeNegotiation = useAppSelector(state => state.negotiation.activeNegotiation);

  // Get the other participant (not the current user)
  const getOtherParticipant = () => {
    if (!conversation || !user) return null;
    
    const otherParticipant = conversation.participants.find(
      participant => participant.user._id !== user._id
    );
    
    return otherParticipant;
  };

  // Get conversation status/type
  const getConversationStatus = () => {
    if (!conversation) return 'Active';
    
    // Check if there are any booking requests in the conversation
    const hasBookingRequest = conversation.lastMessage?.messageType === 'booking_request';
    const hasBookingAccepted = conversation.lastMessage?.messageType === 'booking_accepted';
    const hasBookingDeclined = conversation.lastMessage?.messageType === 'booking_declined';
    
    if (hasBookingRequest) return 'Pending';
    if (hasBookingAccepted) return 'Confirmed';
    if (hasBookingDeclined) return 'Declined';
    
    return 'Active';
  };

  // Get conversation topic/context
  const getConversationTopic = () => {
    if (!conversation) return '';
    
    // Use conversation context if available
    if (conversation.context?.topic) {
      return conversation.context.topic;
    }
    
    // Fallback to last message content preview
    if (conversation.lastMessage?.content) {
      const preview = conversation.lastMessage.content.substring(0, 50);
      return preview.length < conversation.lastMessage.content.length ? `${preview}...` : preview;
    }
    
    return 'Direct conversation';
  };

  const otherParticipant = getOtherParticipant();
  const status = getConversationStatus();
  const topic = getConversationTopic();

  // Get current booking amount from conversation metadata
  const getCurrentAmount = () => {
    // For now, we'll get this from the negotiation data or return undefined
    // The LastMessage type doesn't include metadata, so we'll handle this differently
    return undefined;
  };

  // Check if negotiation is already active
  const isNegotiationActive = () => {
    return activeNegotiation?.status === 'active' || negotiationData?.negotiation?.status === 'active';
  };

  // Check if user can negotiate (only speakers can start negotiations from booking requests)
  const canNegotiate = () => {
    if (!conversation || !user) return false;
    
    // Debug logging
    console.log('🔍 ChatHeader Debug:');
    console.log('  - User role:', user.role);
    console.log('  - Other participant role:', otherParticipant?.user.role);
    console.log('  - Last message type:', conversation.lastMessage?.messageType);
    console.log('  - Last message content preview:', conversation.lastMessage?.content?.substring(0, 50));
    console.log('  - Is negotiation active:', isNegotiationActive());
    
    // Check if there's a pending booking request and user is a speaker
    const hasBookingRequest = conversation.lastMessage?.messageType === 'booking_request';
    const isSpeaker = user.role?.toLowerCase() === 'speaker'; // Case insensitive
    const isOtherParticipantSpeaker = otherParticipant?.user.role?.toLowerCase() === 'speaker'; // Case insensitive
    
    // Additional checks for different scenarios
    const hasAnyBookingMessage = conversation.lastMessage?.messageType?.includes('booking');
    const isOrganizer = user.role?.toLowerCase() === 'organizer';
    
    console.log('  - Has any booking message:', hasAnyBookingMessage);
    console.log('  - Is organizer:', isOrganizer);
    
    console.log('  - Has booking request:', hasBookingRequest);
    console.log('  - Is speaker:', isSpeaker);
    console.log('  - Is other participant speaker:', isOtherParticipantSpeaker);
    
    // Speakers can negotiate on booking requests, organizers can respond to negotiations
    // Also allow negotiation if there's any booking-related message and user is speaker
    const canNegotiateResult = 
      (hasBookingRequest && isSpeaker) || 
      (hasAnyBookingMessage && isSpeaker) ||
      (isNegotiationActive() && !isOtherParticipantSpeaker);
    
    console.log('  - Can negotiate result:', canNegotiateResult);
    
    // TEMPORARY: Always show negotiate button for debugging
    // TODO: Remove this after debugging
    const debugOverride = true;
    console.log('  - Debug override enabled:', debugOverride);
    
    return debugOverride || canNegotiateResult;
  };

  // Handle negotiation submission
  const handleNegotiationSubmit = async (amount: number) => {
    if (!conversation?._id) {
      console.error('No conversation selected');
      return;
    }

    try {
      console.log('💰 Creating negotiation with amount:', amount);
      console.log('💰 Conversation ID:', conversation._id);
      
      const result = await createNegotiation({
        conversationId: conversation._id,
        amount: amount,
        currency: 'INR',
        topic: conversation.context?.topic || 'Speaking Engagement',
        message: `Proposing ₹${amount} for this engagement`,
        eventId: conversation.context?.eventId,
      }).unwrap();

      console.log('✅ Negotiation created successfully:', result);
      
      // Close modal
      setIsNegotiationModalOpen(false);
      
      // Show success message
      console.log('✅ Negotiation proposal sent successfully!');
      
    } catch (error: unknown) {
      console.error('❌ Error creating negotiation:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message || 'Failed to send negotiation proposal'
        : 'Failed to send negotiation proposal';
      console.error(errorMessage);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-orange-600" />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Conversation & Booking Hub
            </h2>
            {otherParticipant && (
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {status === 'Pending' ? 'Booking request from' : 
                     status === 'Confirmed' ? 'Confirmed booking with' :
                     status === 'Declined' ? 'Declined booking with' :
                     'Chatting with'} {otherParticipant.user.firstName} {otherParticipant.user.lastName}
                  </span>
                </div>
                
                {topic && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500 truncate max-w-xs">
                      {topic}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {canNegotiate() && (
            <button 
              onClick={() => setIsNegotiationModalOpen(true)}
              disabled={isCreatingNegotiation}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>{isCreatingNegotiation ? 'Negotiating...' : 'Start Negotiation'}</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Negotiation Modal */}
      <NegotiationModal
        isOpen={isNegotiationModalOpen}
        onClose={() => setIsNegotiationModalOpen(false)}
        onSubmit={handleNegotiationSubmit}
        currentAmount={getCurrentAmount()}
        isLoading={isCreatingNegotiation}
      />
    </div>
  );
}