// Core messaging types for the real-time messaging system

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'speaker' | 'organizer' | 'participant';
  profileImageUrl?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface Message {
  _id: string;
  content: string;
  messageType: MessageType;
  sender: User;
  conversation: string;
  status: MessageStatus;
  isEncrypted?: boolean;
  priority: MessagePriority;
  attachments?: Attachment[];
  readBy: ReadReceipt[];
  metadata?: MessageMetadata;
  adminAccess?: AdminAccess;
  createdAt: string;
  updatedAt: string;
  // Optimistic message properties
  isOptimistic?: boolean;
  tempId?: string;
}

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'file' 
  | 'system' 
  | 'event_invite' 
  | 'booking_request' 
  | 'booking_accepted' 
  | 'booking_declined' 
  | 'negotiation_proposal' 
  | 'negotiation_accepted' 
  | 'negotiation_declined' 
  | 'negotiation_cancelled';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Attachment {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface ReadReceipt {
  user: string;
  readAt: Date;
}

export interface MessageMetadata {
  eventId?: string;
  bookingId?: string;
  amount?: number;
  currency?: string;
  proposalType?: 'initial' | 'counter' | 'final' | 'accepted' | 'declined';
  negotiationId?: string;
  finalAgreement?: {
    amount: number;
    currency: string;
    acceptedBy: string;
  };
  reactions?: Reaction[];
  editHistory?: EditHistory[];
  replyTo?: string;
}

export interface Reaction {
  emoji: string;
  user: string;
  timestamp: Date;
}

export interface EditHistory {
  content: string;
  editedAt: Date;
  editedBy: string;
}

export interface AdminAccess {
  isFlagged: boolean;
  adminNotes: AdminNote[];
}

export interface AdminNote {
  adminId: string;
  note: string;
  createdAt: Date;
}

export interface Conversation {
  _id: string;
  participants: ConversationParticipant[];
  type: ConversationType;
  context?: ConversationContext;
  status: ConversationStatus;
  lastMessage?: LastMessage;
  settings?: ConversationSettings;
  adminAccess?: AdminAccess;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationType = 'direct' | 'group' | 'event_related' | 'booking_related';

export type ConversationStatus = 'active' | 'archived' | 'blocked' | 'deleted';

export interface ConversationParticipant {
  _id: string;
  user: User;
  role: 'speaker' | 'organizer' | 'participant';
  joinedAt: Date;
  lastReadAt: Date;
  isActive: boolean;
}

export interface ConversationContext {
  eventId?: string;
  bookingId?: string;
  topic?: string;
  bookingRequest?: boolean;
}

export interface LastMessage {
  content: string;
  sender: string;
  timestamp: Date;
  messageType: MessageType;
}

export interface ConversationSettings {
  allowFileSharing: boolean;
  allowImageSharing: boolean;
  maxFileSize: number;
  autoArchiveAfter: number;
}

export interface UserMessageStatus {
  _id: string;
  user: string;
  conversation: string;
  lastReadAt: Date;
  lastReadMessage?: string;
  unreadCount: number;
  status: 'active' | 'archived' | 'muted';
}

export interface TypingUser {
  userId: string;
  userName: string;
  conversationId: string;
  timestamp: string;
}

export interface Notification {
  _id: string;
  type: 'message' | 'booking_request' | 'negotiation' | 'system';
  title: string;
  content: string;
  user: string;
  conversationId?: string;
  messageId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  messageNotifications: boolean;
  bookingNotifications: boolean;
}

// Redux state interfaces
export interface MessagingState {
  // Connection status
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
  reconnectAttempts: number;
  lastPing: number;
  
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  conversationsLoading: boolean;
  conversationsError: string | null;
  
  // Messages - normalized by conversation ID
  messages: { [conversationId: string]: Message[] };
  messagesLoading: { [conversationId: string]: boolean };
  messagesError: { [conversationId: string]: string | null };
  
  // Typing indicators
  typingUsers: { [conversationId: string]: TypingUser[] };
  
  // Unread counts
  unreadCounts: { [conversationId: string]: number };
  totalUnreadCount: number;
  
  // Message status
  messageStatus: { [conversationId: string]: MessageStatus };
  
  // Notifications
  notifications: Notification[];
  notificationsSettings: NotificationSettings;
  
  // UI state
  showConversationList: boolean;
  selectedMessageId: string | null;
  replyToMessage: Message | null;
}

// API response interfaces
export interface ConversationsResponse {
  success: boolean;
  message: string;
  conversations: Conversation[];
  pagination?: {
    limit: number;
    skip: number;
    total: number;
  };
}

export interface MessagesResponse {
  success: boolean;
  message: string;
  messages: Message[];
  conversationId: string;
  pagination?: {
    limit: number;
    skip: number;
    total: number;
  };
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  attachments?: File[];
  replyTo?: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: {
    _id: string;
    content: string;
    messageType: MessageType;
    sender: User;
    conversation: string;
    status: MessageStatus;
    attachments: Attachment[];
    metadata?: MessageMetadata;
    createdAt: Date;
  };
}

// Socket event interfaces
export interface SocketMessageEvent {
  conversationId: string;
  message: Message;
  sender: User;
}

export interface SocketTypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface SocketReadReceiptEvent {
  conversationId: string;
  messageId: string;
  userId: string;
  readAt: Date;
}

export interface SocketConnectionEvent {
  status: 'connected' | 'disconnected' | 'reconnecting';
  userId?: string;
  timestamp: Date;
}

// Action payload interfaces
export interface OptimisticMessage {
  tempId: string;
  content: string;
  messageType: MessageType;
  sender: User;
  conversation: string;
  status: 'sending';
  createdAt: Date;
  isOptimistic: true;
}

export interface MessageWithOptimistic extends Message {
  isOptimistic?: boolean;
  tempId?: string;
}
