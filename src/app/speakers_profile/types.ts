// Speaker Profile Types

export interface Speaker {
  id: string;
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  location: string;
  yearsExperience: number;
  isVerified: boolean;
  tags: string[];
  rating: number;
  reviewCount: number;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  isCurrentRole?: boolean;
}

export interface SpeakingEngagement {
  id: string;
  event: string;
  topic: string;
  date: string;
  location: string;
  attendees: string;
  rating: number;
  eventType?: 'keynote' | 'workshop' | 'panel' | 'conference';
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
  degreeType?: 'bachelor' | 'master' | 'doctorate' | 'certificate';
}

export interface Award {
  id: string;
  title: string;
  category: string;
  period: string;
  description: string;
  organization?: string;
}

export interface Video {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  uploadDate?: string;
}

export interface PricingOption {
  id: string;
  service: string;
  price: string;
  duration?: string;
  description?: string;
}

export interface Availability {
  date: Date;
  isAvailable: boolean;
  timeSlots?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

// Component Props Types
export interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
}

export interface AvailabilityCardProps {
  selectedMonth: string;
  selectedDate: number | null;
  setSelectedDate: (date: number | null) => void;
  availableDates?: number[];
  bookedDates?: number[];
}

export interface SpeakerProfileProps {
  speaker?: Speaker;
  experiences?: Experience[];
  speakingEngagements?: SpeakingEngagement[];
  education?: Education[];
  awards?: Award[];
  videos?: Video[];
  pricingOptions?: PricingOption[];
  availability?: Availability[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface SpeakerListResponse {
  speakers: Speaker[];
  total: number;
  page: number;
  limit: number;
}

export interface BookingRequest {
  speakerId: string;
  eventDate: string;
  eventType: 'keynote' | 'workshop' | 'consultation';
  duration: number;
  location: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    organization?: string;
  };
  specialRequirements?: string;
}

// Form Types
export interface SearchFilters {
  query?: string;
  location?: string;
  expertise?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message: string;
  eventDate?: string;
  eventType?: string;
}

// Utility Types
export type TabType = 'Experience' | 'Speaking' | 'Education' | 'Awards' | 'Videos';

export type SortOrder = 'asc' | 'desc';

export type SortBy = 'name' | 'rating' | 'experience' | 'price' | 'location';

export interface SortOptions {
  sortBy: SortBy;
  sortOrder: SortOrder;
}

// Calendar Types
export interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isAvailable: boolean;
  isBooked: boolean;
  isToday: boolean;
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

// Event Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'speaking' | 'consultation' | 'workshop';
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string;
}

// Theme Types (for styling consistency)
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export const defaultTheme: ThemeColors = {
  primary: '#FF6B35',
  secondary: '#FFE2D8',
  accent: '#0066CC',
  background: '#F9FAFB',
  text: '#1F2937',
  border: '#E5E7EB'
};

// Constants
export const TABS: TabType[] = ['Experience', 'Speaking', 'Education', 'Awards', 'Videos'];

export const PRICING_TYPES = {
  KEYNOTE: 'keynote',
  WORKSHOP: 'workshop', 
  CONSULTATION: 'consultation'
} as const;

export const EVENT_TYPES = {
  CONFERENCE: 'conference',
  CORPORATE: 'corporate',
  WEBINAR: 'webinar',
  WORKSHOP: 'workshop',
  PANEL: 'panel'
} as const;