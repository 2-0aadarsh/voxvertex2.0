export interface Message {
  id: string;
  sender: 'event_organizer' | 'dr_jane_doe';
  content: string;
  timestamp: string;
  type?: 'normal' | 'proposal';
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  status: 'negotiating' | 'confirmed' | 'pending';
}

export interface User {
  name: string;
  email: string;
  role: string;
}