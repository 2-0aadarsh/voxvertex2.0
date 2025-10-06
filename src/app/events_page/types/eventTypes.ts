// ============================================================================
// ENHANCED EVENT TYPES - TypeScript Interface Definitions
// ============================================================================

export interface TicketType {
  name: string;
  price: string; // Changed to string to match existing components
  quantity: string; // Changed to string to match existing components
  features?: string[];
  discount?: {
    enabled: boolean;
    name: string;
    type: 'percentage' | 'fixed';
    value: string; // Changed to string to match existing components
    maxUses: string; // Changed to string to match existing components
    startDate: string;
    endDate: string;
    code: string;
    description: string;
  };
}

export interface ManualSpeaker {
  image: string;
  name: string;
  title: string;
  bio: string;
}

export interface PlatformSpeaker {
  speakerId: string;
  speakerName: string;
  speakerTitle: string;
  speakerBio: string;
  bookingId?: string;
}

export interface EventSpeakers {
  manualSpeakers: ManualSpeaker[];
  platformSpeakers: PlatformSpeaker[];
}

export interface EventAddons {
  featureOnHome: boolean;
  includeInNewsletter: boolean;
  socialMediaPromotion: boolean;
}

export interface EventFormData {
  // Step 1: Core Details
  eventName: string;
  startDate: string;
  endDate: string;
  eventMode: 'offline' | 'online' | 'hybrid';
  format: string;
  location: string;
  eventUrl: string;
  
  // Step 2: Branding & Content
  description: string;
  bannerImage: File | null;
  bannerImageUrl?: string; // For preview
  image: File | null; // Added for compatibility with existing components
  tags: string[];
  
  // Step 3: Ticketing
  ticketTypes: TicketType[];
  
  // Step 4: Speakers
  speakers: EventSpeakers;
  // Legacy speakers array for compatibility
  speakersArray?: Speaker[]; // For compatibility with existing components
  
  // Step 5: Addons
  addons: EventAddons;
  
  // Step 6: Final
  status: 'draft' | 'published' | 'cancelled';
}

// Legacy Speaker interface for compatibility
export interface Speaker {
  name: string;
  title: string;
  bio: string;
  image?: string;
}

export interface EnhancedEvent {
  _id: string;
  eventName: string;
  startDate: string;
  endDate: string;
  eventMode: 'offline' | 'online' | 'hybrid';
  format: string;
  location?: string;
  eventUrl?: string;
  description: string;
  bannerImage?: string;
  tags: string[];
  ticketTypes: TicketType[];
  speakers: EventSpeakers;
  addons: EventAddons;
  organizer: string;
  status: 'draft' | 'published' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  // Virtual fields (computed by backend)
  totalCapacity?: number;
  totalTicketsSold?: number;
  totalRevenue?: number;
  isUpcoming?: boolean;
  isPast?: boolean;
}

export interface EventFormState {
  currentStep: number;
  formData: EventFormData;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isDraft: boolean;
  lastSaved?: string;
}

export interface CreateEventRequest {
  eventName: string;
  startDate: string;
  endDate: string;
  eventMode: 'offline' | 'online' | 'hybrid';
  format: string;
  location?: string;
  eventUrl?: string;
  description: string;
  bannerImage?: string;
  tags: string[];
  ticketTypes: TicketType[];
  speakers: EventSpeakers;
  addons: EventAddons;
  status: 'draft' | 'published' | 'cancelled';
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  _id: string;
}

export interface EventValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export interface EventStats {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  upcomingEvents: number;
  pastEvents: number;
}

export interface EventListResponse {
  success: boolean;
  message: string;
  data: {
    events: EnhancedEvent[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalEvents: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

// Step validation interfaces
export interface StepValidation {
  step1: EventValidation;
  step2: EventValidation;
  step3: EventValidation;
  step4: EventValidation;
  step5: EventValidation;
  step6: EventValidation;
}

// Form step types
export type EventStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface StepProps {
  formData: EventFormData;
  onFormDataUpdate: (data: Partial<EventFormData>) => void;
  onStepChange?: (step: EventStep) => void;
  isLoading?: boolean;
  error?: string | null;
}

// File upload types
export interface FileUploadResponse {
  success: boolean;
  message: string;
  data?: {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
  };
  error?: string;
}

// Event creation response
export interface EventCreationResponse {
  success: boolean;
  message: string;
  data?: EnhancedEvent;
  error?: string;
}