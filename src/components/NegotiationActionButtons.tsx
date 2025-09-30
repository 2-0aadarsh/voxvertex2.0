'use client';

import React, { useState } from 'react';
import { useAcceptProposalMutation, useDeclineProposalMutation, useProposeAmountMutation } from '@/store/slices/negotiationSlice';
import { Check, X, DollarSign } from 'lucide-react';
import NegotiationModal from './NegotiationModal';

interface NegotiationActionButtonsProps {
  negotiationId: string;
  messageType: 'negotiation_proposal';
  currentAmount: number;
  onMessageSent?: () => void;
  disabled?: boolean;
  proposalStatus?: 'pending' | 'accepted' | 'declined' | 'countered';
}

export const NegotiationActionButtons: React.FC<NegotiationActionButtonsProps> = ({
  negotiationId,
  messageType,
  currentAmount,
  onMessageSent,
  disabled = false,
  proposalStatus = 'pending',
}) => {
  const [acceptProposal, { isLoading: isAccepting }] = useAcceptProposalMutation();
  const [declineProposal, { isLoading: isDeclining }] = useDeclineProposalMutation();
  const [proposeAmount, { isLoading: isProposing }] = useProposeAmountMutation();
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const handleAccept = async () => {
    try {
      console.log('✅ Accepting negotiation proposal:', negotiationId);
      const result = await acceptProposal({
        negotiationId,
        message: `I accept your proposal of $${currentAmount}. Let's move forward with this amount.`,
      }).unwrap();
      console.log('✅ Proposal accepted:', result);
      
      console.log('✅ Proposal accepted successfully!');
      onMessageSent?.();
    } catch (error: unknown) {
      console.error('❌ Error accepting proposal:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message || 'Failed to accept proposal'
        : 'Failed to accept proposal';
      console.error(errorMessage);
    }
  };

  const handleDecline = async () => {
    try {
      console.log('❌ Declining negotiation proposal:', negotiationId);
      const result = await declineProposal({
        negotiationId,
        message: declineReason || 'I cannot accept this proposal at this time.',
      }).unwrap();
      console.log('❌ Proposal declined:', result);
      
      setShowDeclineModal(false);
      setDeclineReason('');
      console.log('✅ Proposal declined successfully!');
      onMessageSent?.();
    } catch (error: unknown) {
      console.error('❌ Error declining proposal:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message || 'Failed to decline proposal'
        : 'Failed to decline proposal';
      console.error(errorMessage);
    }
  };

  const handleCounterProposal = async (amount: number) => {
    try {
      console.log('💰 Making counter-proposal:', amount);
      const result = await proposeAmount({
        negotiationId,
        amount,
        currency: 'USD',
        message: `Counter-proposal: I propose $${amount} for this engagement.`,
      }).unwrap();
      console.log('✅ Counter-proposal sent:', result);
      
      setShowNegotiationModal(false);
      console.log('✅ Counter-proposal sent successfully!');
      onMessageSent?.();
    } catch (error: unknown) {
      console.error('❌ Error sending counter-proposal:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error as { data?: { message?: string } }).data?.message || 'Failed to send counter-proposal'
        : 'Failed to send counter-proposal';
      console.error(errorMessage);
    }
  };

  const handleShowDeclineModal = () => {
    setShowDeclineModal(true);
  };

  const handleCancelDecline = () => {
    setShowDeclineModal(false);
    setDeclineReason('');
  };

  if (messageType !== 'negotiation_proposal') {
    return null;
  }

  // Only show buttons for pending proposals that haven't been responded to
  if (proposalStatus !== 'pending') {
    return null;
  }

  // Only show buttons for the recipient of the proposal (not the proposer)
  return (
    <>
      <div className="flex gap-3 mt-4">
        {/* Accept Button */}
        <button
          onClick={handleAccept}
          disabled={disabled || isAccepting || isDeclining || isProposing}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isAccepting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isAccepting ? 'Accepting...' : 'Accept'}
        </button>

        {/* Counter-Proposal Button */}
        <button
          onClick={() => setShowNegotiationModal(true)}
          disabled={disabled || isAccepting || isDeclining || isProposing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProposing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <DollarSign className="w-4 h-4" />
          )}
          {isProposing ? 'Proposing...' : 'Counter'}
        </button>

        {/* Decline Button */}
        <button
          onClick={handleShowDeclineModal}
          disabled={disabled || isAccepting || isDeclining || isProposing}
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
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Decline Proposal</h3>
            
            <div className="mb-4">
              <label htmlFor="declineReason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for declining (optional)
              </label>
              <textarea
                id="declineReason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Amount is outside my budget, not available for this type of engagement..."
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
                {isDeclining ? 'Declining...' : 'Decline Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Counter-Proposal Modal */}
      <NegotiationModal
        isOpen={showNegotiationModal}
        onClose={() => setShowNegotiationModal(false)}
        onSubmit={handleCounterProposal}
        currentAmount={currentAmount}
        isLoading={isProposing}
        title="Counter-Proposal"
      />
    </>
  );
};

export default NegotiationActionButtons;
