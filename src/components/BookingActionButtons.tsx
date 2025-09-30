'use client';

import React, { useState } from 'react';
import { useAcceptBookingMutation, useDeclineBookingMutation } from '@/store/slices/bookingSlice';
import { useCreateNegotiationMutation } from '@/store/slices/negotiationSlice';
import { useAuth } from '@/store/hooks';
import { Check, X, MessageSquare, DollarSign } from 'lucide-react';
import NegotiationModal from './NegotiationModal';

interface BookingActionButtonsProps {
  bookingId: string;
  messageType: 'booking_request';
  onMessageSent?: () => void;
  disabled?: boolean;
  conversationId?: string;
  currentAmount?: number;
}

export const BookingActionButtons: React.FC<BookingActionButtonsProps> = ({
  bookingId,
  messageType,
  onMessageSent,
  disabled = false,
  conversationId,
  currentAmount,
}) => {
  const { user } = useAuth();
  const [acceptBooking, { isLoading: isAccepting }] = useAcceptBookingMutation();
  const [declineBooking, { isLoading: isDeclining }] = useDeclineBookingMutation();
  const [createNegotiation, { isLoading: isCreatingNegotiation }] = useCreateNegotiationMutation();
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const handleAccept = async () => {
    try {
      console.log('✅ Accepting booking:', bookingId);
      const result = await acceptBooking(bookingId).unwrap();
      console.log('✅ Booking accepted:', result);
      onMessageSent?.();
    } catch (error) {
      console.error('❌ Error accepting booking:', error);
    }
  };

  const handleDecline = async () => {
    try {
      console.log('❌ Declining booking:', bookingId);
      const result = await declineBooking({ 
        bookingId, 
        reason: declineReason || undefined 
      }).unwrap();
      console.log('❌ Booking declined:', result);
      setShowDeclineModal(false);
      setDeclineReason('');
      onMessageSent?.();
    } catch (error) {
      console.error('❌ Error declining booking:', error);
    }
  };

  const handleShowDeclineModal = () => {
    setShowDeclineModal(true);
  };

  const handleCancelDecline = () => {
    setShowDeclineModal(false);
    setDeclineReason('');
  };

  const handleNegotiate = async (amount: number) => {
    if (!conversationId) {
      console.error('No conversation selected');
      return;
    }

    try {
      console.log('💰 Creating negotiation with amount:', amount);
      
      const result = await createNegotiation({
        conversationId: conversationId,
        amount: amount,
        currency: 'USD',
        topic: 'Speaking Engagement',
        message: `Counter-proposal: $${amount}`,
      }).unwrap();

      console.log('✅ Negotiation created successfully:', result);
      
      // Close modal
      setShowNegotiationModal(false);
      
      // Show success message
      console.log('✅ Negotiation proposal sent successfully!');
      
      // Callback
      onMessageSent?.();
      
    } catch (error: unknown) {
      console.error('❌ Error creating negotiation:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as any).data?.message || 'Failed to send negotiation proposal'
        : 'Failed to send negotiation proposal';
      console.error(errorMessage);
    }
  };

  if (messageType !== 'booking_request') {
    return null;
  }

  // Only show buttons for speakers (who can accept/decline/negotiate booking requests)
  if (user?.role !== 'speaker') {
    return null;
  }

  return (
    <>
      <div className="flex gap-3 mt-4">
        {/* Accept Button */}
        <button
          onClick={handleAccept}
          disabled={disabled || isAccepting || isDeclining || isCreatingNegotiation}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isAccepting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isAccepting ? 'Accepting...' : 'Accept'}
        </button>

        {/* Negotiate Button */}
        <button
          onClick={() => setShowNegotiationModal(true)}
          disabled={disabled || isAccepting || isDeclining || isCreatingNegotiation}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isCreatingNegotiation ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <DollarSign className="w-4 h-4" />
          )}
          {isCreatingNegotiation ? 'Negotiating...' : 'Negotiate'}
        </button>

        {/* Decline Button */}
        <button
          onClick={handleShowDeclineModal}
          disabled={disabled || isAccepting || isDeclining || isCreatingNegotiation}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isDeclining ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
          {isDeclining ? 'Declining...' : 'Decline'}
        </button>
      </div>

      {/* Decline Reason Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Decline Booking</h3>
            
            <div className="mb-4">
              <label htmlFor="declineReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for declining (optional)
              </label>
              <textarea
                id="declineReason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Scheduling conflict, not available for this type of event..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDecline}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={isDeclining}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isDeclining ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {isDeclining ? 'Declining...' : 'Decline Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Negotiation Modal */}
      <NegotiationModal
        isOpen={showNegotiationModal}
        onClose={() => setShowNegotiationModal(false)}
        onSubmit={handleNegotiate}
        currentAmount={currentAmount}
        isLoading={isCreatingNegotiation}
      />
    </>
  );
};

export default BookingActionButtons;


