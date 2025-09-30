'use client';

import { MessageSquare } from 'lucide-react';
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
        currency: 'USD',
        topic: conversation.context?.topic || 'Speaking Engagement',
        message: `Proposing $${amount} for this engagement`,
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
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center">
        <MessageSquare className="w-5 h-5 text-[#FF6B35] mr-2" />
        <div>
          <span className="font-medium text-gray-900">Conversation & Booking Hub</span>
          {otherParticipant && (
            <p className="text-xs text-gray-600 mt-1">
              {status === 'Pending' ? 'Booking request from' : 
               status === 'Confirmed' ? 'Confirmed booking with' :
               status === 'Declined' ? 'Declined booking with' :
               'Chatting with'} {otherParticipant.user.firstName} {otherParticipant.user.lastName}
              {topic && ` - ${topic}`}
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          
          {canNegotiate() && (
            <button 
              onClick={() => setIsNegotiationModalOpen(true)}
              disabled={isCreatingNegotiation}
              className="cursor-pointer text-xs px-3 py-1 rounded-full bg-[#FF6B35] text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingNegotiation ? 'Negotiating...' : 'Negotiate'}
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
