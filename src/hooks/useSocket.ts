import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/store/hooks';
import socketService from '@/services/socketService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setConnectionStatus,
  setReconnectAttempts,
  updateLastPing,
} from '@/store/slices/messagingSlice';

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, token } = useAuth();
  const connectionStatus = useAppSelector((state) => state.messaging.connectionStatus);
  const reconnectAttempts = useAppSelector((state) => state.messaging.reconnectAttempts);
  const lastPing = useAppSelector((state) => state.messaging.lastPing);
  
  const isConnectingRef = useRef(false);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to get token from cookies
  const getTokenFromCookies = useCallback(() => {
    if (typeof document === 'undefined') return null;
    
    console.log('🍪 All cookies:', document.cookie);
    
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('accessToken=')
    );
    
    console.log('🍪 Looking for accessToken cookie...');
    console.log('🍪 Found accessToken cookie:', !!accessTokenCookie);
    
    if (accessTokenCookie) {
      const token = accessTokenCookie.split('=')[1];
      console.log('🍪 Access token from cookie:', token ? token.substring(0, 20) + '...' : 'null');
      return token;
    }
    
    console.log('🍪 No accessToken cookie found in document.cookie');
    console.log('🍪 This might be because the cookie is HttpOnly');
    return null;
  }, []);

  // Connect to socket when user is authenticated
  useEffect(() => {
    const cookieToken = getTokenFromCookies();
    const reduxToken = token;
    const finalToken = reduxToken || cookieToken;
    
    console.log('🔌 useSocket: Connection check:', {
      isAuthenticated,
      hasReduxToken: !!reduxToken,
      hasCookieToken: !!cookieToken,
      hasFinalToken: !!finalToken,
      isConnected: socketService.isConnected(),
      isConnecting: isConnectingRef.current,
      userId: user?._id
    });

    if (isAuthenticated && finalToken && !socketService.isConnected() && !isConnectingRef.current) {
      isConnectingRef.current = true;
      
      console.log('🔌 useSocket: Attempting to connect with token:', finalToken.substring(0, 20) + '...');
      
      socketService.connect(finalToken)
        .then(() => {
          console.log('✅ useSocket: Connected successfully');
          isConnectingRef.current = false;
          
          // Start ping interval
          startPingInterval();
        })
        .catch((error) => {
          console.error('❌ useSocket: Connection failed:', error);
          isConnectingRef.current = false;
        });
    } else if (!isAuthenticated || !finalToken) {
      console.log('🔌 useSocket: Not connecting - missing auth:', {
        isAuthenticated,
        hasReduxToken: !!reduxToken,
        hasCookieToken: !!cookieToken,
        hasFinalToken: !!finalToken
      });
    }

    // Cleanup on unmount or when user logs out
    return () => {
      if (!isAuthenticated) {
        console.log('🔌 useSocket: Disconnecting due to logout');
        socketService.disconnect();
        stopPingInterval();
        isConnectingRef.current = false;
      }
    };
  }, [isAuthenticated, token, getTokenFromCookies, user?._id]);

  // Start ping interval to maintain connection
  const startPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    pingIntervalRef.current = setInterval(() => {
      if (socketService.isConnected()) {
        socketService.ping();
      } else if (isAuthenticated) {
        // Try to reconnect if disconnected
        const cookieToken = getTokenFromCookies();
        const reduxToken = token;
        const finalToken = reduxToken || cookieToken;
        
        if (finalToken) {
          console.log('🔄 useSocket: Attempting to reconnect...');
          socketService.connect(finalToken).catch(console.error);
        }
      }
    }, 30000); // Ping every 30 seconds
  }, [isAuthenticated, token, getTokenFromCookies]);

  // Stop ping interval
  const stopPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // Cleanup ping interval on unmount
  useEffect(() => {
    return () => {
      stopPingInterval();
    };
  }, [stopPingInterval]);

  // Socket methods
  const joinConversation = useCallback((conversationId: string) => {
    if (socketService.isConnected()) {
      socketService.joinConversationRoom(conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketService.isConnected()) {
      socketService.leaveConversationRoom(conversationId);
    }
  }, []);

  const sendMessage = useCallback((
    conversationId: string, 
    content: string, 
    messageType: string = 'text',
    replyTo?: string
  ) => {
    if (socketService.isConnected()) {
      socketService.sendMessage(conversationId, content, messageType, replyTo);
    }
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    if (socketService.isConnected()) {
      socketService.startTyping(conversationId);
    }
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    if (socketService.isConnected()) {
      socketService.stopTyping(conversationId);
    }
  }, []);

  const markAsRead = useCallback((conversationId: string, messageId?: string) => {
    if (socketService.isConnected()) {
      socketService.markMessagesAsRead(conversationId, messageId);
    }
  }, []);

  const reactToMessage = useCallback((messageId: string, emoji: string) => {
    if (socketService.isConnected()) {
      socketService.reactToMessage(messageId, emoji);
    }
  }, []);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (socketService.isConnected()) {
      socketService.editMessage(messageId, newContent);
    }
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    if (socketService.isConnected()) {
      socketService.deleteMessage(messageId);
    }
  }, []);

  // Connection management
  const connect = useCallback(async () => {
    const cookieToken = getTokenFromCookies();
    const reduxToken = token;
    const finalToken = reduxToken || cookieToken;
    
    if (finalToken && !socketService.isConnected() && !isConnectingRef.current) {
      isConnectingRef.current = true;
      try {
        await socketService.connect(finalToken);
        startPingInterval();
      } catch (error) {
        console.error('Failed to connect:', error);
      } finally {
        isConnectingRef.current = false;
      }
    }
  }, [token, getTokenFromCookies, startPingInterval]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    stopPingInterval();
    isConnectingRef.current = false;
  }, [stopPingInterval]);

  return {
    // Connection status
    isConnected: socketService.isConnected(),
    connectionStatus,
    reconnectAttempts,
    lastPing,
    
    // Connection methods
    connect,
    disconnect,
    
    // Message methods
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    reactToMessage,
    editMessage,
    deleteMessage,
    
    // Utility
    getSocket: socketService.getSocket.bind(socketService),
  };
};

// Hook for typing indicators with debouncing
export const useTypingIndicator = (conversationId: string) => {
  const { startTyping, stopTyping } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleTypingStart = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping(conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        stopTyping(conversationId);
      }
    }, 3000);
  }, [conversationId, startTyping, stopTyping]);

  const handleTypingStop = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      stopTyping(conversationId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [conversationId, stopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleTypingStop();
    };
  }, [handleTypingStop]);

  return {
    handleTypingStart,
    handleTypingStop,
  };
};

