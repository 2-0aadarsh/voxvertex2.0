// disputeType.ts

// ---- Enums for fixed values ----
export enum DisputeStage {
  PeerToPeer = 'Peer to peer',
  Mediation = 'Mediation',
  Legal = 'Legal',
  Resolved = 'Resolved',
}

export enum DisputeStatus {
  Active = 'Active',
  Resolved = 'Resolved',
  Escalated = 'Escalated',
}

export enum UrgencyLevel {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

// ---- Reusable Interfaces ----
export interface PartyInvolved {
  name: string
  role: string
  email?: string
  phone?: string;
  userId: string 
}

export interface FileAttachment {
  file: File
  description?: string
}

// ---- Main Form Data ----
export interface DisputeFormData {
  // Core Details
  eventName: string
  eventId?: string
  respondentId: string[];
   eventDate?: string;
  disputeReason: string
  disputeTitle?: string 
  amount: number 
  category?: string
  description: string

  // Branding & Content
  evidence: FileAttachment | null
  attachments: FileAttachment[]

  // Parties Involved
  partiesInvolved: PartyInvolved[]

  // Additional Details
  preferredResolution?: string
  urgencyLevel: UrgencyLevel

  // Add-ons
  addons: {
    requestMediation: boolean
    escalateToLegal: boolean
    notifyAllParties: boolean
  }

  // --- New fields for Description & Evidence step ---
  detailedDescription?: string
  requestedResolution?: string
  supportingDocument?: File | null
  preferredContact?: 'Email Only' | 'Phone Only' | 'Both email and phone'
}
export type TimelineMessageType = 'message' | 'system'; 
export interface TimelineMessage {
  id: string;
  action?: string;
  author:string;
  message:string;
  performedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  details?: string;
  stage?: string;
  timestamp: string;
  type?: TimelineMessageType;
}
// ---- Dispute Record ----
export interface Dispute {
  _id: string
  dispute:Dispute
  disputeId: string; 
  title:string
  description: string;
  category:string
complainant: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  respondent: Array<{
    _id: string
    firstName: string
    lastName: string
    email: string
  }>
    messages: Array<{
    sender: string
    content: string
    timestamp: string
    messageType: string
    isInternal: boolean
    _id: string
    attachments: any[]
    readBy: any[]
  }>
  priority:string
  eventName: string
  disputeReason: string
  partiesInvolved: string      
  currentStage: DisputeStage
  resolution?: { compensation?: { amount: number } };
  status: DisputeStatus
  amount: number
  disputeAmount: number;
  disputeCurrency: string;
  dateFiled: Date
  managedBy?: string
  createdAt: string;
  timeline: TimelineMessage[] 
}
export interface DisputeDetail {
  _id: string;
  disputeId: string;
  title: string;
  description: string;
  complainant: PartyInvolved;
  respondent: PartyInvolved;
  currentStage: DisputeStage;
  status: DisputeStatus;
  disputeAmount: number;
  disputeCurrency: string;
  dateFiled: string;
  timeline: TimelineMessage[];
  messages: {
    id: string;
    sender: PartyInvolved;
    message: string;
    timestamp: string;
  }[];
}

// ---- Evidence Detail ----
export interface Evidence {
  type: string
  file: File
  description: string
}
