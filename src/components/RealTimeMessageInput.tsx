'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useSocket, useTypingIndicator } from '@/hooks/useSocket';
import {
  addOptimisticMessage,
  removeOptimisticMessage,
  confirmMessageSent,
} from '@/store/slices/messagingSlice';
import { useSendMessageMutation } from '@/store/slices/messagingSlice';
import { MessageType } from '@/app/messages/types/messagingTypes';
import { Send, Paperclip, Smile } from 'lucide-react';

interface RealTimeMessageInputProps {
  conversationId: string;
  onMessageSent?: (message: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const RealTimeMessageInput: React.FC<RealTimeMessageInputProps> = ({
  conversationId,
  onMessageSent,
  placeholder = "Type your message...",
  disabled = false,
}) => {
  const dispatch = useAppDispatch();
  const { handleTypingStart, handleTypingStop } = useTypingIndicator(conversationId);
  const { user } = useAppSelector((state) => state.auth);
  const [sendMessageMutation, { isLoading: isSendingMessage }] = useSendMessageMutation();
  
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending || disabled) return;

    const messageContent = message.trim();
    setMessage('');
    setIsSending(true);

    // Create optimistic message
    const tempId = `temp_${Date.now()}`;
    const now = new Date();
    const optimisticMessage = {
      tempId,
      content: messageContent,
      messageType: 'text' as MessageType,
      sender: {
        _id: user?._id || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        role: user?.role || 'organizer',
        profileImageUrl: user?.profileImageUrl,
      },
      conversation: conversationId,
      status: 'sending' as const,
      isEncrypted: false,
      priority: 'normal' as const,
      attachments: [],
      readBy: [],
      createdAt: now.toISOString(), // Convert to string for serialization
      updatedAt: now.toISOString(), // Convert to string for serialization
      isOptimistic: true,
    };

    // Add optimistic message to store
    dispatch(addOptimisticMessage({
      ...optimisticMessage,
      conversationId,
    }));

    try {
      // Send message via HTTP API (RTK Query)
      const result = await sendMessageMutation({
        conversationId,
        content: messageContent,
        messageType: 'text',
        attachments: []
      }).unwrap();

      // Remove optimistic message and add real message
      dispatch(removeOptimisticMessage({ tempId, conversationId }));
      setIsSending(false);
      onMessageSent?.(result.message);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove optimistic message on error
      dispatch(removeOptimisticMessage({ tempId, conversationId }));
      setIsSending(false);
    }

    // Stop typing
    handleTypingStop();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim()) {
      handleTypingStart();
    } else {
      handleTypingStop();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputBlur = () => {
    handleTypingStop();
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        {/* Attachment Button */}
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          disabled={disabled || isSending}
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {/* Emoji Button */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            disabled={disabled || isSending}
            title="Add emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || isSending || isSendingMessage || disabled}
          className={`p-3 rounded-lg transition-colors flex items-center justify-center ${
            message.trim() && !isSending && !isSendingMessage && !disabled
              ? 'bg-[#FF6B35] text-white hover:bg-orange-600'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={isSending || isSendingMessage ? 'Sending...' : 'Send message'}
        >
          {(isSending || isSendingMessage) ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Typing Indicator */}
      {(isSending || isSendingMessage) && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2" />
          Sending message...
        </div>
      )}
    </div>
  );
};

export default RealTimeMessageInput;

