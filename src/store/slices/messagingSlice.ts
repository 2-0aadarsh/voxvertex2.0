import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import { 
  MessagingState, 
  Conversation, 
  Message, 
  User,
  MessageType,
  TypingUser,
  Notification,
  SendMessageRequest,
  SocketMessageEvent,
  SocketTypingEvent,
  SocketReadReceiptEvent,
  SocketConnectionEvent,
  OptimisticMessage,
  MessageWithOptimistic
} from '../../app/messages/types/messagingTypes';

// Initial state
const initialState: MessagingState = {
  // Connection status
  connectionStatus: 'disconnected',
  reconnectAttempts: 0,
  lastPing: 0,
  
  // Conversations
  conversations: [],
  activeConversationId: null,
  conversationsLoading: false,
  conversationsError: null,
  
  // Messages - normalized by conversation ID
  messages: {},
  messagesLoading: {},
  messagesError: {},
  
  // Typing indicators
  typingUsers: {},
  
  // Unread counts
  unreadCounts: {},
  totalUnreadCount: 0,
  
  // Message status
  messageStatus: {},
  
  // Notifications
  notifications: [],
  notificationsSettings: {
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    messageNotifications: true,
    bookingNotifications: true,
  },
  
  // UI state
  showConversationList: true,
  selectedMessageId: null,
  replyToMessage: null,
};

// Messaging API endpoints using RTK Query
export const messagingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user conversations
    getUserConversations: builder.query<{
      success: boolean;
      message: string;
      conversations: Conversation[];
      pagination: {
        limit: number;
        skip: number;
        total: number;
      };
    }, { limit?: number; skip?: number }>({
      query: ({ limit = 20, skip = 0 } = {}) => ({
        url: '/messaging/conversations',
        params: { limit, skip },
      }),
      providesTags: ['Conversation'],
    }),

    // Get conversation messages
    getConversationMessages: builder.query<{
      success: boolean;
      message: string;
      messages: Message[];
      conversationId: string;
      pagination: {
        limit: number;
        skip: number;
        total: number;
      };
    }, { conversationId: string; limit?: number; skip?: number }>({
      query: ({ conversationId, limit = 50, skip = 0 }) => ({
        url: `/messaging/conversations/${conversationId}/messages`,
        params: { limit, skip },
      }),
      providesTags: (result, error, { conversationId }) => [
        { type: 'Message', id: conversationId },
        'Conversation'
      ],
    }),

    // Send message
    sendMessage: builder.mutation<{
      success: boolean;
      message: Message;
    }, SendMessageRequest>({
      query: ({ conversationId, ...body }) => ({
        url: `/messaging/conversations/${conversationId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Message', id: conversationId },
        'Conversation'
      ],
    }),

    // Mark messages as read
    markMessagesAsRead: builder.mutation<{
      success: boolean;
      message: string;
    }, { conversationId: string; messageId?: string }>({
      query: ({ conversationId, messageId }) => ({
        url: `/messaging/conversations/${conversationId}/read`,
        method: 'PUT',
        body: { messageId },
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Conversation', id: conversationId }
      ],
    }),

    // Create or get conversation
    createOrGetConversation: builder.mutation<{
      success: boolean;
      message: string;
      conversation: Conversation;
    }, { participantId: string; type?: string; context?: any }>({
      query: (body) => ({
        url: '/messaging/conversations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversation'],
    }),

    // Get unread count
    getUnreadCount: builder.query<{
      success: boolean;
      message: string;
      unreadData: {
        totalUnread: number;
        conversationsWithUnread: number;
      };
    }, void>({
      query: () => '/messaging/unread-count',
      providesTags: ['Message'],
    }),
  }),
});

// Export API hooks
export const {
  useGetUserConversationsQuery,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useCreateOrGetConversationMutation,
  useGetUnreadCountQuery,
} = messagingApi;

// Async thunks that use the RTK Query hooks
export const fetchConversations = createAsyncThunk(
  'messaging/fetchConversations',
  async (params: { limit?: number; skip?: number } = {}, { dispatch }) => {
    const result = await dispatch(messagingApi.endpoints.getUserConversations.initiate(params));
    if (result.error) {
      throw new Error('Failed to fetch conversations');
    }
    return result.data;
  }
);

export const fetchMessages = createAsyncThunk(
  'messaging/fetchMessages',
  async (params: { conversationId: string; limit?: number; skip?: number }, { dispatch }) => {
    const result = await dispatch(messagingApi.endpoints.getConversationMessages.initiate(params));
    if (result.error) {
      throw new Error('Failed to fetch messages');
    }
    return result.data;
  }
);

export const sendMessage = createAsyncThunk(
  'messaging/sendMessage',
  async (messageData: SendMessageRequest, { dispatch }) => {
    const result = await dispatch(messagingApi.endpoints.sendMessage.initiate(messageData));
    if (result.error) {
      throw new Error('Failed to send message');
    }
    return { ...result.data.message, conversationId: messageData.conversationId };
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'messaging/markMessagesAsRead',
  async (params: { conversationId: string; messageId?: string }, { dispatch }) => {
    const result = await dispatch(messagingApi.endpoints.markMessagesAsRead.initiate(params));
    if (result.error) {
      throw new Error('Failed to mark messages as read');
    }
    return params;
  }
);

// Messaging slice
const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    // Connection management
    setConnectionStatus: (state, action: PayloadAction<MessagingState['connectionStatus']>) => {
      state.connectionStatus = action.payload;
    },
    
    setReconnectAttempts: (state, action: PayloadAction<number>) => {
      state.reconnectAttempts = action.payload;
    },
    
    updateLastPing: (state, action: PayloadAction<number>) => {
      state.lastPing = action.payload;
    },
    
    // Conversation management
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
    },
    
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const conversation = action.payload;
      console.log('🔄 Redux: updateConversation called with:', conversation._id);
      console.log('🔄 Redux: Current conversations count:', state.conversations.length);
      
      const existingIndex = state.conversations.findIndex(c => c._id === conversation._id);
      
      if (existingIndex >= 0) {
        console.log('🔄 Redux: Updating existing conversation at index:', existingIndex);
        state.conversations[existingIndex] = conversation;
      } else {
        console.log('🔄 Redux: Adding new conversation to beginning of list');
        state.conversations.unshift(conversation);
      }
      
      // Sort conversations by last message timestamp
      state.conversations.sort((a, b) => {
        const aTime = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const bTime = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return bTime - aTime;
      });
      
      console.log('🔄 Redux: Updated conversations count:', state.conversations.length);
      console.log('🔄 Redux: Conversations after update:', state.conversations.map(c => ({ id: c._id, title: c.context?.topic || 'No title' })));
    },
    
    removeConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(c => c._id !== action.payload);
      delete state.messages[action.payload];
      delete state.typingUsers[action.payload];
      delete state.unreadCounts[action.payload];
      
      if (state.activeConversationId === action.payload) {
        state.activeConversationId = null;
      }
    },
    
    // Message management
    addOptimisticMessage: (state, action: PayloadAction<OptimisticMessage & { conversationId: string }>) => {
      const { conversationId, ...message } = action.payload;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      state.messages[conversationId].unshift(message as unknown as MessageWithOptimistic);
    },
    
    confirmMessageSent: (state, action: PayloadAction<{ tempId: string; conversationId: string; message: Message }>) => {
      const { tempId, conversationId, message } = action.payload;
      const messages = state.messages[conversationId];
      
      if (messages) {
        const optimisticIndex = messages.findIndex(m => m.tempId === tempId);
        if (optimisticIndex >= 0) {
          messages[optimisticIndex] = { ...message, isOptimistic: false };
        }
      }
    },
    
    removeOptimisticMessage: (state, action: PayloadAction<{ tempId: string; conversationId: string }>) => {
      const { tempId, conversationId } = action.payload;
      const messages = state.messages[conversationId];
      
      if (messages) {
        state.messages[conversationId] = messages.filter(m => m.tempId !== tempId);
      }
    },
    
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      // Check if message already exists (prevent duplicates)
      const existingMessage = state.messages[conversationId].find(m => m._id === message._id);
      if (!existingMessage) {
        state.messages[conversationId].unshift(message);
        
        // Update conversation's last message
        const conversation = state.conversations.find(c => c._id === conversationId);
        if (conversation) {
          conversation.lastMessage = {
            content: message.content,
            sender: message.sender._id,
            timestamp: typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt,
            messageType: message.messageType,
          };
        }
        
        // Update unread count for other participants
        if (message.sender._id !== state.activeConversationId) {
          state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
        }
      }
    },
    
    updateMessage: (state, action: PayloadAction<{ conversationId: string; messageId: string; updates: Partial<Message> }>) => {
      const { conversationId, messageId, updates } = action.payload;
      const messages = state.messages[conversationId];
      
      if (messages) {
        const messageIndex = messages.findIndex(m => m._id === messageId);
        if (messageIndex >= 0) {
          messages[messageIndex] = { ...messages[messageIndex], ...updates };
        }
      }
    },
    
    // Typing indicators
    addTypingUser: (state, action: PayloadAction<TypingUser>) => {
      const { conversationId, userId } = action.payload;
      
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = [];
      }
      
      const existingIndex = state.typingUsers[conversationId].findIndex(u => u.userId === userId);
      if (existingIndex >= 0) {
        state.typingUsers[conversationId][existingIndex] = action.payload;
      } else {
        state.typingUsers[conversationId].push(action.payload);
      }
    },
    
    removeTypingUser: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;
      
      if (state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(u => u.userId !== userId);
      }
    },
    
    // Read receipts
    updateReadReceipt: (state, action: PayloadAction<{ conversationId: string; messageId: string; userId: string; readAt: Date }>) => {
      const { conversationId, messageId, userId, readAt } = action.payload;
      const messages = state.messages[conversationId];
      
      if (messages) {
        const message = messages.find(m => m._id === messageId);
        if (message) {
          const existingReceipt = message.readBy.find(r => r.user === userId);
          if (existingReceipt) {
            existingReceipt.readAt = readAt;
          } else {
            message.readBy.push({ user: userId, readAt });
          }
        }
      }
    },
    
    // Unread counts
    updateUnreadCount: (state, action: PayloadAction<{ conversationId: string; count: number }>) => {
      const { conversationId, count } = action.payload;
      state.unreadCounts[conversationId] = count;
      
      // Update total unread count
      state.totalUnreadCount = Object.values(state.unreadCounts).reduce((total, count) => total + count, 0);
    },
    
    clearUnreadCount: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      state.unreadCounts[conversationId] = 0;
      
      // Update total unread count
      state.totalUnreadCount = Object.values(state.unreadCounts).reduce((total, count) => total + count, 0);
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    
    updateNotificationSettings: (state, action: PayloadAction<Partial<MessagingState['notificationsSettings']>>) => {
      state.notificationsSettings = { ...state.notificationsSettings, ...action.payload };
    },
    
    // UI state
    toggleConversationList: (state) => {
      state.showConversationList = !state.showConversationList;
    },
    
    setSelectedMessage: (state, action: PayloadAction<string | null>) => {
      state.selectedMessageId = action.payload;
    },
    
    setReplyToMessage: (state, action: PayloadAction<Message | null>) => {
      state.replyToMessage = action.payload;
    },
    
    // Reset state
    resetMessagingState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        if (action.payload && action.payload.conversations) {
          state.conversations = action.payload.conversations;
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.conversationsError = action.error.message || 'Failed to fetch conversations';
      });
    
    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        state.messagesLoading[conversationId] = true;
        state.messagesError[conversationId] = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        const messages = action.payload?.messages;
        state.messagesLoading[conversationId] = false;
        if (messages) {
          state.messages[conversationId] = messages;
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        state.messagesLoading[conversationId] = false;
        state.messagesError[conversationId] = action.error.message || 'Failed to fetch messages';
      });
    
    // Send message
    builder
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const conversationId = message.conversation;
        
        // Remove optimistic message and add real message
        if (state.messages[conversationId]) {
          state.messages[conversationId] = state.messages[conversationId].filter(m => !m.isOptimistic);
          state.messages[conversationId].unshift(message);
        }
        
        // Update conversation's last message
        const conversation = state.conversations.find(c => c._id === conversationId);
        if (conversation) {
          conversation.lastMessage = {
            content: message.content,
            sender: message.sender._id,
            timestamp: typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt,
            messageType: message.messageType,
          };
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        // Remove optimistic message on failure
        // This will be handled by the component that initiated the send
        console.error('Failed to send message:', action.error.message);
      });
    
    // Mark messages as read
    builder
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        state.unreadCounts[conversationId] = 0;
        
        // Update total unread count
        state.totalUnreadCount = Object.values(state.unreadCounts).reduce((total, count) => total + count, 0);
      });
  },
});

// Export actions
export const {
  setConnectionStatus,
  setReconnectAttempts,
  updateLastPing,
  setActiveConversation,
  updateConversation,
  removeConversation,
  addOptimisticMessage,
  confirmMessageSent,
  removeOptimisticMessage,
  addMessage,
  updateMessage,
  addTypingUser,
  removeTypingUser,
  updateReadReceipt,
  updateUnreadCount,
  clearUnreadCount,
  addNotification,
  markNotificationAsRead,
  updateNotificationSettings,
  toggleConversationList,
  setSelectedMessage,
  setReplyToMessage,
  resetMessagingState,
} = messagingSlice.actions;

// Export reducer
export default messagingSlice.reducer;

// Selectors
export const selectMessagingState = (state: { messaging: MessagingState }) => state.messaging;

export const selectConversations = (state: { messaging: MessagingState }) => state.messaging.conversations;

export const selectActiveConversation = (state: { messaging: MessagingState }) => 
  state.messaging.conversations.find(c => c._id === state.messaging.activeConversationId);

export const selectMessages = (state: { messaging: MessagingState }, conversationId: string) => 
  state.messaging.messages[conversationId] || [];

export const selectTypingUsers = (state: { messaging: MessagingState }, conversationId: string) => 
  state.messaging.typingUsers[conversationId] || [];

export const selectUnreadCount = (state: { messaging: MessagingState }, conversationId: string) => 
  state.messaging.unreadCounts[conversationId] || 0;

export const selectTotalUnreadCount = (state: { messaging: MessagingState }) => 
  state.messaging.totalUnreadCount;

export const selectConnectionStatus = (state: { messaging: MessagingState }) => 
  state.messaging.connectionStatus;
