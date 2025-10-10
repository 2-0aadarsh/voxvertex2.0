import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import {
  setConnectionStatus,
  setReconnectAttempts,
  updateLastPing,
  addMessage,
  updateMessage,
  addTypingUser,
  removeTypingUser,
  updateReadReceipt,
  updateConversation,
  addNotification,
} from '@/store/slices/messagingSlice';
import {
  updateNegotiation,
  setActiveNegotiation,
} from '@/store/slices/negotiationSlice';
import {
  SocketMessageEvent,
  SocketTypingEvent,
  SocketReadReceiptEvent,
  SocketConnectionEvent,
  Message,
  Conversation,
  Notification,
} from '@/app/messages/types/messagingTypes';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private connectionTimeout: NodeJS.Timeout | null = null;

  // Connection management
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('🔌 Socket already connected');
        resolve();
        return;
      }

      if (this.isConnecting) {
        console.log('🔌 Socket connection already in progress - waiting for completion');
        // Wait for current connection to complete instead of rejecting
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve();
          } else if (!this.isConnecting) {
            // Connection failed, try again
            this.connect(token).then(resolve).catch(reject);
          } else {
            // Still connecting, wait a bit more
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;
      store.dispatch(setConnectionStatus('connecting'));

      console.log('🔌 Connecting to Socket.IO server...');

      // Create socket connection
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'https://voxvertex20-production.up.railway.app';
      console.log('🔌 Socket connecting to:', socketUrl);
      console.log('🔌 Token provided:', token ? 'Yes' : 'No');
      
      this.socket = io(socketUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      });

      // Connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (!this.socket?.connected) {
          console.error('❌ Socket connection timeout');
          this.handleConnectionError('Connection timeout');
          reject(new Error('Connection timeout'));
        }
      }, 10000);

      // Connection successful
      this.socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        console.log('✅ Socket ID:', this.socket?.id);
        console.log('✅ Socket transport:', this.socket?.io.engine.transport.name);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        store.dispatch(setConnectionStatus('connected'));
        store.dispatch(setReconnectAttempts(0));
        store.dispatch(updateLastPing(Date.now()));

        // Join user's personal room
        this.joinUserRoom();

        resolve();
      });

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        this.handleConnectionError(error.message);
        reject(error);
      });

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        store.dispatch(setConnectionStatus('disconnected'));
        this.handleDisconnection(reason);
      });

      // Reconnection
      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
        this.reconnectAttempts = 0;
        store.dispatch(setConnectionStatus('connected'));
        store.dispatch(setReconnectAttempts(0));
        this.joinUserRoom();
      });

      // Reconnection attempt
      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Socket reconnection attempt ${attemptNumber}`);
        this.reconnectAttempts = attemptNumber;
        store.dispatch(setConnectionStatus('reconnecting'));
        store.dispatch(setReconnectAttempts(attemptNumber));
      });

      // Reconnection failed
      this.socket.on('reconnect_failed', () => {
        console.error('❌ Socket reconnection failed');
        store.dispatch(setConnectionStatus('disconnected'));
        this.reconnectAttempts = this.maxReconnectAttempts;
        store.dispatch(setReconnectAttempts(this.maxReconnectAttempts));
      });

      // Set up event listeners
      this.setupEventListeners();
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    store.dispatch(setConnectionStatus('disconnected'));
  }

  private handleConnectionError(error: string): void {
    this.isConnecting = false;
    store.dispatch(setConnectionStatus('disconnected'));
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    console.error('❌ Socket connection failed:', error);
  }

  private handleDisconnection(reason: string): void {
    // Only attempt reconnection for certain disconnect reasons
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, don't reconnect automatically
      console.log('🔌 Server initiated disconnect');
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`🔄 Attempting to reconnect (attempt ${this.reconnectAttempts + 1})`);
      this.reconnectAttempts++;
      store.dispatch(setReconnectAttempts(this.reconnectAttempts));
    } else {
      console.error('❌ Max reconnection attempts reached');
      store.dispatch(setConnectionStatus('disconnected'));
    }
  }

  private joinUserRoom(): void {
    if (this.socket?.connected) {
      console.log('🏠 Joining user room...');
      this.socket.emit('join_user_room');
      
      // Also join personal room for targeted broadcasts
      const userId = store.getState().auth.user?._id;
      if (userId) {
        console.log(`🏠 Joining personal room for user: ${userId}`);
        this.socket.emit('join_personal_room', { userId });
        console.log(`🏠 Personal room join event emitted for user: ${userId}`);
      } else {
        console.log('🏠 No user ID found, skipping personal room join');
      }
    } else {
      console.log('🏠 Socket not connected, skipping user room join');
    }
  }

  // Message events
  joinConversationRoom(conversationId: string): void {
    if (this.socket?.connected) {
      console.log(`💬 Joining conversation room: ${conversationId}`);
      this.socket.emit('join_conversation', { conversationId });
      console.log(`💬 Join conversation event emitted for: ${conversationId}`);
    } else {
      console.log(`💬 Socket not connected, cannot join conversation: ${conversationId}`);
    }
  }

  leaveConversationRoom(conversationId: string): void {
    if (this.socket?.connected) {
      console.log(`💬 Leaving conversation room: ${conversationId}`);
      this.socket.emit('leave_conversation', { conversationId });
      console.log(`💬 Leave conversation event emitted for: ${conversationId}`);
    } else {
      console.log(`💬 Socket not connected, cannot leave conversation: ${conversationId}`);
    }
  }

  sendMessage(conversationId: string, content: string, messageType: string = 'text', replyTo?: string): void {
    if (this.socket?.connected) {
      console.log(`📤 Sending message to conversation: ${conversationId}`);
      this.socket.emit('send_message', {
        conversationId,
        content,
        messageType,
        replyTo,
      });
    }
  }

  startTyping(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  markMessagesAsRead(conversationId: string, messageId?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', { conversationId, messageId });
    }
  }

  reactToMessage(messageId: string, emoji: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message_reaction', { messageId, emoji });
    }
  }

  editMessage(messageId: string, newContent: string): void {
    if (this.socket?.connected) {
      this.socket.emit('edit_message', { messageId, newContent });
    }
  }

  deleteMessage(messageId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('delete_message', { messageId });
    }
  }

  // Event listeners setup
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Message events
    this.socket.on('message_received', (data: SocketMessageEvent) => {
      console.log('📨 Message received:', data);
      store.dispatch(addMessage({
        conversationId: data.conversationId,
        message: data.message,
      }));

      // Create notification for new message
      if (data.sender._id !== store.getState().auth.user?._id) {
        const notification: Notification = {
          _id: `notification_${Date.now()}`,
          type: 'message',
          title: `New message from ${data.sender.firstName} ${data.sender.lastName}`,
          content: data.message.content,
          user: store.getState().auth.user?._id || '',
          conversationId: data.conversationId,
          messageId: data.message._id,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        store.dispatch(addNotification(notification));
      }
    });

    // Handle new_message event from backend (matches backend emit)
    this.socket.on('new_message', (data: { message: Message; conversationId: string; timestamp: Date }) => {
      console.log('📨 New message event received:', data);
      console.log('📨 Message type:', data.message?.messageType);
      console.log('📨 Message content preview:', data.message?.content?.substring(0, 100) + '...');
      console.log('📨 Conversation ID:', data.conversationId);
      console.log('📨 Sender ID:', data.message?.sender?._id);
      console.log('📨 Current user ID:', store.getState().auth.user?._id);
      
      console.log('📨 Dispatching addMessage...');
      store.dispatch(addMessage({
        conversationId: data.conversationId,
        message: data.message,
      }));
      console.log('📨 addMessage dispatched successfully');

      // Create notification for new message (if not from current user)
      if (data.message.sender._id !== store.getState().auth.user?._id) {
        const notification: Notification = {
          _id: `notification_${Date.now()}`,
          type: 'message',
          title: `New message from ${data.message.sender.firstName} ${data.message.sender.lastName}`,
          content: data.message.content,
          user: store.getState().auth.user?._id || '',
          conversationId: data.conversationId,
          messageId: data.message._id,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        console.log('📨 Dispatching addNotification...');
        store.dispatch(addNotification(notification));
        console.log('📨 addNotification dispatched successfully');
      } else {
        console.log('📨 Message from current user, skipping notification');
      }
    });

    this.socket.on('message_sent', (data: { messageId: string; conversationId: string }) => {
      console.log('📤 Message sent confirmation:', data);
      // Update message status to 'sent'
      store.dispatch(updateMessage({
        conversationId: data.conversationId,
        messageId: data.messageId,
        updates: { status: 'sent' },
      }));
    });

    this.socket.on('message_updated', (data: { messageId: string; conversationId: string; updates: Partial<Message> }) => {
      console.log('📝 Message updated:', data);
      store.dispatch(updateMessage({
        conversationId: data.conversationId,
        messageId: data.messageId,
        updates: data.updates,
      }));
    });

    // Typing events
    this.socket.on('user_typing', (data: SocketTypingEvent) => {
      console.log('⌨️ User typing:', data);
      if (data.userId !== store.getState().auth.user?._id) {
        store.dispatch(addTypingUser({
          userId: data.userId,
          userName: data.userName,
          conversationId: data.conversationId,
          timestamp: new Date().toISOString(),
        }));
      }
    });

    this.socket.on('user_stopped_typing', (data: { userId: string; conversationId: string }) => {
      console.log('⌨️ User stopped typing:', data);
      store.dispatch(removeTypingUser({
        conversationId: data.conversationId,
        userId: data.userId,
      }));
    });

    // Read receipt events
    this.socket.on('message_read', (data: SocketReadReceiptEvent) => {
      console.log('👁️ Message read:', data);
      store.dispatch(updateReadReceipt({
        conversationId: data.conversationId,
        messageId: data.messageId,
        userId: data.userId,
        readAt: data.readAt,
      }));
    });

    // Conversation events
    this.socket.on('conversation_updated', (data: { conversation: Conversation }) => {
      console.log('💬 Conversation updated:', data);
      store.dispatch(updateConversation(data.conversation));
    });

    this.socket.on('conversation_created', (data: { conversation: Conversation; timestamp: Date }) => {
      console.log('💬 Conversation created event received:', data);
      console.log('💬 Conversation data:', JSON.stringify(data.conversation, null, 2));
      console.log('💬 Dispatching updateConversation to Redux store...');
      store.dispatch(updateConversation(data.conversation));
      console.log('💬 Conversation added to Redux store successfully');
    });

    // Connection events
    this.socket.on('connection_status', (data: SocketConnectionEvent) => {
      console.log('🔌 Connection status update:', data);
      store.dispatch(setConnectionStatus(data.status));
      store.dispatch(updateLastPing(data.timestamp.getTime()));
    });

    // Pong handler for ping/pong
    this.socket.on('pong', (data: { timestamp: Date | string }) => {
      console.log('🏓 Pong received:', data);
      // Handle both Date objects and timestamp strings
      const timestamp = data.timestamp instanceof Date ? data.timestamp.getTime() : new Date(data.timestamp).getTime();
      store.dispatch(updateLastPing(timestamp));
    });

    // Error events
    this.socket.on('error', (error: { message: string; code?: string }) => {
      console.error('❌ Socket error:', error);
      
      const notification: Notification = {
        _id: `error_${Date.now()}`,
        type: 'system',
        title: 'Connection Error',
        content: error.message,
        user: store.getState().auth.user?._id || '',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notification));
    });

    // Notification events
    this.socket.on('notification', (notification: Notification) => {
      console.log('🔔 Notification received:', notification);
      store.dispatch(addNotification(notification));
    });

    // Booking status change events
    this.socket.on('booking_status_changed', (data: { 
      type: string; 
      booking: any; 
      conversation: any; 
      message: any; 
      timestamp: Date 
    }) => {
      console.log('📋 Booking status changed event received:', data);
      console.log('📋 Event type:', data.type);
      console.log('📋 Booking ID:', data.booking?.bookingId);
      console.log('📋 Conversation ID:', data.conversation?._id);
      console.log('📋 Message ID:', data.message?._id);
      
      // Update conversation in Redux store
      console.log('📋 Dispatching updateConversation...');
      store.dispatch(updateConversation(data.conversation));
      console.log('📋 updateConversation dispatched successfully');
      
      // Add the new message to the conversation
      console.log('📋 Dispatching addMessage...');
      store.dispatch(addMessage({
        conversationId: data.conversation._id,
        message: data.message,
      }));
      console.log('📋 addMessage dispatched successfully');

      // Create notification for booking status change
      const notification: Notification = {
        _id: `booking_${data.type}_${Date.now()}`,
        type: 'booking_request',
        title: `Booking ${data.type}`,
        content: `Booking ${data.booking.bookingId} has been ${data.type}`,
        user: store.getState().auth.user?._id || '',
        conversationId: data.conversation._id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      console.log('📋 Dispatching addNotification...');
      store.dispatch(addNotification(notification));
      console.log('📋 addNotification dispatched successfully');

      // Show notification
      console.log(`📬 Booking ${data.type} processed successfully:`, data.booking.bookingId);
    });

    // Negotiation events
    this.socket.on('negotiation_created', (data: { 
      negotiation: any; 
      message: any; 
      timestamp: Date 
    }) => {
      console.log('💰 Negotiation created event received:', data);
      console.log('💰 Negotiation ID:', data.negotiation?._id);
      console.log('💰 Conversation ID:', data.negotiation?.conversation);
      console.log('💰 Message ID:', data.message?._id);
      console.log('💰 Message type:', data.message?.messageType);
      console.log('💰 Message content:', data.message?.content);
      
      // Update negotiation in Redux store
      store.dispatch(updateNegotiation(data.negotiation));
      
      // Add negotiation message to conversation
      store.dispatch(addMessage({
        conversationId: data.negotiation.conversation,
        message: data.message,
      }));
      
      // Create notification for negotiation
      const notification: Notification = {
        _id: `negotiation_created_${Date.now()}`,
        type: 'negotiation',
        title: 'New Negotiation Proposal',
        content: `New negotiation proposal: ₹${data.negotiation.currentProposal.amount}`,
        user: store.getState().auth.user?._id || '',
        conversationId: data.negotiation.conversation,
        messageId: data.message._id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notification));
      
      console.log('💰 Negotiation created event processed successfully');
    });

    this.socket.on('negotiation_proposal', (data: { 
      negotiation: any; 
      message: any; 
      timestamp: Date 
    }) => {
      console.log('💰 Negotiation proposal event received:', data);
      console.log('💰 Proposal amount:', data.negotiation?.currentProposal?.amount);
      console.log('💰 Conversation ID:', data.negotiation?.conversation);
      console.log('💰 Message ID:', data.message?._id);
      console.log('💰 Message type:', data.message?.messageType);
      console.log('💰 Message content:', data.message?.content);
      
      // Update negotiation in Redux store
      store.dispatch(updateNegotiation(data.negotiation));
      
      // Add proposal message to conversation
      store.dispatch(addMessage({
        conversationId: data.negotiation.conversation,
        message: data.message,
      }));
      
      // Create notification for proposal
      const notification: Notification = {
        _id: `negotiation_proposal_${Date.now()}`,
        type: 'negotiation',
        title: 'New Counter Proposal',
        content: `Counter proposal: ₹${data.negotiation.currentProposal.amount}`,
        user: store.getState().auth.user?._id || '',
        conversationId: data.negotiation.conversation,
        messageId: data.message._id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notification));
      
      console.log('💰 Negotiation proposal event processed successfully');
    });

    this.socket.on('negotiation_accepted', (data: { 
      negotiation: any; 
      message: any; 
      timestamp: Date 
    }) => {
      console.log('✅ Negotiation accepted event received:', data);
      
      // Update negotiation in Redux store
      store.dispatch(updateNegotiation(data.negotiation));
      
      // Add acceptance message to conversation
      store.dispatch(addMessage({
        conversationId: data.negotiation.conversation,
        message: data.message,
      }));
      
      // Create notification for acceptance
      const notification: Notification = {
        _id: `negotiation_accepted_${Date.now()}`,
        type: 'negotiation',
        title: 'Negotiation Accepted',
        content: `Negotiation accepted: $${data.negotiation.finalAgreement.amount}`,
        user: store.getState().auth.user?._id || '',
        conversationId: data.negotiation.conversation,
        messageId: data.message._id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notification));
    });

    this.socket.on('negotiation_declined', (data: { 
      negotiation: any; 
      message: any; 
      timestamp: Date 
    }) => {
      console.log('❌ Negotiation declined event received:', data);
      
      // Update negotiation in Redux store
      store.dispatch(updateNegotiation(data.negotiation));
      
      // Add decline message to conversation
      store.dispatch(addMessage({
        conversationId: data.negotiation.conversation,
        message: data.message,
      }));
      
      // Create notification for decline
      const notification: Notification = {
        _id: `negotiation_declined_${Date.now()}`,
        type: 'negotiation',
        title: 'Negotiation Declined',
        content: 'Negotiation proposal was declined',
        user: store.getState().auth.user?._id || '',
        conversationId: data.negotiation.conversation,
        messageId: data.message._id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notification));
    });

    this.socket.on('negotiation_cancelled', (data: { 
      negotiation: any; 
      message: any; 
      timestamp: Date 
    }) => {
      console.log('🚫 Negotiation cancelled event received:', data);
      
      // Update negotiation in Redux store
      store.dispatch(updateNegotiation(data.negotiation));
      
      // Add cancellation message to conversation
      store.dispatch(addMessage({
        conversationId: data.negotiation.conversation,
        message: data.message,
      }));
      
      // Create notification for cancellation
      const notification: Notification = {
        _id: `negotiation_cancelled_${Date.now()}`,
        type: 'negotiation',
        title: 'Negotiation Cancelled',
        content: 'Negotiation was cancelled',
        user: store.getState().auth.user?._id || '',
        conversationId: data.negotiation.conversation,
        messageId: data.message._id,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.dispatch(addNotification(notification));
    });
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): string {
    return store.getState().messaging.connectionStatus;
  }

  // Ping server to check connection
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
      store.dispatch(updateLastPing(Date.now()));
    }
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

