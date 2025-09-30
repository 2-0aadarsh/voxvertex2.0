'use client';

import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { 
  selectMessages, 
  selectTypingUsers,
  fetchMessages,
  markMessagesAsRead,
} from '@/store/slices/messagingSlice';
import { useSocket } from '@/hooks/useSocket';
import { Message as MessageType } from '@/app/messages/types/messagingTypes';
import TypingIndicator from './TypingIndicator';
import RealMessage from '@/app/messages/components/RealMessage';

interface RealTimeMessageListProps {
  conversationId: string;
  className?: string;
  autoScroll?: boolean;
  showTypingIndicator?: boolean;
}

export const RealTimeMessageList: React.FC<RealTimeMessageListProps> = ({
  conversationId,
  className = '',
  autoScroll = true,
  showTypingIndicator = true,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { markAsRead } = useSocket();
  
  const messages = useAppSelector((state) => selectMessages(state, conversationId));
  const messagesLoading = useAppSelector((state) => state.messaging.messagesLoading[conversationId]);
  const messagesError = useAppSelector((state) => state.messaging.messagesError[conversationId]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId && !messages.length && !messagesLoading) {
      dispatch(fetchMessages({ conversationId }));
    }
  }, [conversationId, messages.length, messagesLoading, dispatch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      const shouldScroll = !hasScrolledRef.current || isNearBottom();
      
      if (shouldScroll) {
        scrollToBottom();
        hasScrolledRef.current = true;
      }
    }
  }, [messages, autoScroll]);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const lastMessage = messages[0]; // Messages are sorted newest first
      if (lastMessage && lastMessage.sender._id !== user?._id) {
        markAsRead(conversationId, lastMessage._id);
        dispatch(markMessagesAsRead({ conversationId, messageId: lastMessage._id }));
      }
    }
  }, [conversationId, messages, user?._id, markAsRead, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isNearBottom = () => {
    if (!containerRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 100; // pixels from bottom
    
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      hasScrolledRef.current = isAtBottom;
    }
  };

  // Show loading state
  if (messagesLoading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (messagesError) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load messages</p>
          <p className="text-sm text-gray-500">{messagesError}</p>
          <button
            onClick={() => dispatch(fetchMessages({ conversationId }))}
            className="mt-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!messages.length) {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
          <p className="text-sm text-gray-500">Start the conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${className}`}>
      {/* Messages Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Render messages in reverse order (oldest first) */}
        {messages.slice().reverse().map((message: MessageType) => (
          <RealMessage
            key={message.isOptimistic ? message.tempId : message._id}
            message={message}
            conversationId={conversationId}
          />
        ))}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {showTypingIndicator && (
        <TypingIndicator
          conversationId={conversationId}
          currentUserId={user?._id}
        />
      )}

      {/* Scroll to Bottom Button */}
      {!hasScrolledRef.current && (
        <div className="absolute bottom-20 right-4">
          <button
            onClick={scrollToBottom}
            className="p-2 bg-[#FF6B35] text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors"
            title="Scroll to bottom"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default RealTimeMessageList;
