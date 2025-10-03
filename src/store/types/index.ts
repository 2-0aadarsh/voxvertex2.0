// ============================================================================
// STORE TYPES - Production Ready Type Definitions
// ============================================================================

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
}

// User & Auth Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo?: string;
  role: 'speaker' | 'organizer' | 'participant';
  isEmailVerified: boolean;
  isProfileComplete: boolean;
  signupComplete: boolean;
  profileImage?: {
    data: Buffer;
    contentType: string;
  };
  profileImageUrl?: string;
  bio?: string;
  professionalTitle?: string;
  location?: string;
  areaOfExpertise?: string[];
  yearsOfExperience?: number;
  profile?: {
    id: string;
    isComplete: boolean;
  };
  roleSpecificData?: {
    workEmail?: string;
    industry?: string;
    activities?: string[];
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
      portfolio?: string;
    };
  };
  accountStatus?: 'active' | 'suspended' | 'deactivated';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  
  // Mongoose document properties
  _doc?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo?: string;
    role: 'speaker' | 'organizer' | 'participant';
    isEmailVerified: boolean;
    isProfileComplete: boolean;
    signupComplete: boolean;
    profileImage?: {
      data: Buffer;
      contentType: string;
    };
    profileImageUrl?: string;
    bio?: string;
    professionalTitle?: string;
    location?: string;
    areaOfExpertise?: string[];
    yearsOfExperience?: number;
    roleSpecificData?: {
      workEmail?: string;
      industry?: string;
      activities?: string[];
      socialLinks?: {
        linkedin?: string;
        twitter?: string;
        website?: string;
        portfolio?: string;
      };
    };
    accountStatus?: 'active' | 'suspended' | 'deactivated';
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
  };
  $__?: any;
  $isNew?: boolean;
}

export interface AuthState extends LoadingState {
  id: string | null;
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  role: 'speaker' | 'organizer' | 'participant' | null;
}

// Profile Types
export interface Profile {
  _id: string;
  user: string;
  bio?: string;
  professionalTitle?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    portfolio?: string;
  };
  skills: string[];
  domains: string[];
  stats: {
    connections: number;
    projects: number;
    experience: string;
  };
  contacts: {
    phone?: string;
    email: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProfileState extends LoadingState {
  profile: Profile | null;
}

// Posts Types
export interface Post {
  _id: string;
  user: string;
  title?: string;
  caption: string;
  content?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }[];
  tags: string[];
  category?: string;
  visibility: 'public' | 'private' | 'connections';
  status: 'draft' | 'published' | 'archived';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

// Comment Types
export interface Comment {
  _id: string;
  user: string;
  userName: string;
  userProfileImage?: {
    data: Buffer;
    contentType: string;
  };
  userProfileImageUrl?: string;
  content: string;
  likes: Array<{
    user: string;
    likedAt: Date;
  }>;
  likesCount: number;
  replies: Array<{
    user: string;
    userName: string;
    content: string;
    createdAt: Date;
  }>;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface PostsState extends LoadingState {
  posts: Post[];
  currentPost: Post | null;
  filters: {
    category?: string;
    tags?: string[];
    visibility?: string;
    status?: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Feed Types
export interface FeedPost {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    professionalTitle?: string;
    profileImage?: {
      data: Buffer;
      contentType: string;
    };
    profileImageUrl?: string;
  };
  userName: string;
  userProfileImage?: {
    data: Buffer;
    contentType: string;
  };
  userProfileImageUrl?: string;
  userProfessionalTitle?: string;
  title?: string;
  caption: string;
  media?: {
    type: 'image' | 'video' | 'document';
    url: string;
    filename?: string;
    size?: number;
    duration?: string;
    thumbnail?: string;
  }[];
  category: string;
  tags: string[];
  likes: {
    user: string;
    userName: string;
    likedAt: string;
  }[];
  comments: {
    _id: string;
    user: string;
    userName: string;
    userProfileImage?: {
      data: Buffer;
      contentType: string;
    };
    userProfileImageUrl?: string;
    content: string;
    likes: {
      user: string;
      likedAt: string;
    }[];
    likesCount: number;
    replies: {
      user: string;
      userName: string;
      content: string;
      createdAt: string;
    }[];
    isEdited: boolean;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
  }[];
  shares: {
    user: string;
    userName: string;
    sharedAt: string;
    shareNote?: string;
  }[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  visibility: 'public' | 'connections' | 'private';
  allowComments: boolean;
  allowShares: boolean;
  status: 'active' | 'hidden' | 'removed' | 'under-review';
  analytics: {
    impressions: number;
    clicks: number;
    engagement: number;
    reach: number;
  };
  isEdited: boolean;
  editedAt?: string;
  editHistory: {
    editedAt: string;
    previousContent: {
      title?: string;
      caption?: string;
    };
    reason?: string;
  }[];
  scheduledFor?: string;
  isScheduled: boolean;
  isPinned: boolean;
  pinnedAt?: string;
  isLiked: boolean; // Server-side computed field
  createdAt: string;
  updatedAt: string;
}

export interface FeedState extends LoadingState {
  posts: FeedPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  userAuthenticated: boolean;
}

// Work Experience Types
export interface WorkExperience {
  _id: string;
  user: string;
  title: string;
  company: string;
  location?: string;
  employmentType?: string;
  startDate: string;
  endDate?: string;
  isCurrentlyWorking: boolean;
  description?: string;
  skills: string[];
  achievements?: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkExperienceState extends LoadingState {
  experiences: WorkExperience[];
  currentExperience: WorkExperience | null;
}

// Education Types
export interface Education {
  _id: string;
  user: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrentlyStudying: boolean;
  grade?: string;
  description?: string;
  achievements: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface EducationState extends LoadingState {
  educations: Education[];
  currentEducation: Education | null;
}

// Awards & Certifications Types
export interface Award {
  _id: string;
  user: string;
  title: string;
  issuer: string;
  dateIssued: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  type: 'award' | 'certification' | 'achievement';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AwardsState extends LoadingState {
  awards: Award[];
  currentAward: Award | null;
}

// Featured Videos Types
export interface FeaturedVideo {
  _id: string;
  user: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  category?: string;
  tags: string[];
  visibility: 'public' | 'private';
  viewCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideosState extends LoadingState {
  videos: FeaturedVideo[];
  currentVideo: FeaturedVideo | null;
}

// Calendar Types (for Speakers)
export interface CalendarEvent {
  _id: string;
  user: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'available' | 'booked' | 'blocked';
  status: 'pending' | 'confirmed' | 'cancelled';
  client?: {
    name: string;
    email: string;
    phone?: string;
  };
  location?: string;
  meetingUrl?: string;
  rate?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarState extends LoadingState {
  events: CalendarEvent[];
  selectedDate: string | null;
  currentEvent: CalendarEvent | null;
  view: 'month' | 'week' | 'day';
  filters: {
    type?: string;
    status?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

// Speaker Types
export interface Speaker {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobileNo?: string;
  profileImageUrl?: string;
  bio?: string;
  professionalTitle?: string;
  location?: string;
  areaOfExpertise?: string[];
  yearsOfExperience?: number;
  roleSpecificData?: {
    industry?: string;
    activities?: string[];
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
      portfolio?: string;
    };
  };
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
  // Availability information (when fetched with filters)
  availability?: {
    dates: string[];
    eventTypes: any[];
    modes: string[];
    timeSlots: any[];
  };
  // Rating and booking information (for marketplace display)
  rating?: number;
  totalBookings?: number;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

// Enhanced Speaker interface for processed data
export interface ProcessedSpeaker {
  id: string;
  name: string;
  title: string;
  rating: number;
  bookings: number;
  location: string;
  price: number;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  tags: string[];
  specializations: string[];
  specialization: string;
  avatar?: string;
  bio?: string;
  yearsOfExperience: number;
  isProfileComplete: boolean;
  
  // Additional details for enhanced display
  firstName: string;
  lastName: string;
  email: string;
  mobileNo?: string;
  industry?: string;
  activities: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    portfolio?: string;
  };
  createdAt: string;
  availability?: {
    dates: string[];
    eventTypes: any[];
    modes: string[];
    timeSlots: any[];
  };
  
  // Raw speaker data for detailed view
  rawData: Speaker;
}

export interface SpeakerFilters {
  searchQuery: string;
  location: string;
  expertise: string[];
  topics: string[];
  yearsOfExperience: number;
  availabilityDate: string;
  eventTypes: string[];
  deliveryModes: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

export interface SpeakersState extends LoadingState {
  speakers: Speaker[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  filters: SpeakerFilters;
  lastFetchTime: number;
  searchSuggestions: Speaker[];
  availableEventTypes: any[];
}

// Availability Types (for Speakers)
export interface TimeSlot {
  slot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
}

export interface EventType {
  category: 'Corporate & Professional Events' | 'Educational & Training Formats' | 'Specialized & Niche Events';
  events: {
    name: string;
    price: number;
    currency: string;
  }[];
}

export interface Availability {
  _id: string;
  userId: string;
  date: string; // Single date per document
  eventTypes: EventType[];
  modes: ('Online' | 'Offline' | 'Hybrid')[];
  timeSlots: TimeSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityState extends LoadingState {
  availabilities: Availability[];
  currentAvailability: Availability | null;
}

// Root State Type
export interface RootState {
  auth: AuthState;
  profile: ProfileState;
  posts: PostsState;
  feed: FeedState;
  workExperience: WorkExperienceState;
  education: EducationState;
  awards: AwardsState;
  videos: VideosState;
  calendar: CalendarState;
  availability: AvailabilityState;
  speakers: SpeakersState;
}

// API Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  bio?: string;
  professionalTitle?: string;
  location?: string;
  website?: string;
  socialLinks?: Profile['socialLinks'];
  skills?: string[];
  domains?: string[];
}

export interface CreatePostRequest {
  title?: string;
  caption: string;
  content?: string;
  tags?: string[];
  category?: string;
  visibility?: Post['visibility'];
}

export interface CreateWorkExperienceRequest {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
  skills?: string[];
  achievements?: string[];
}

export interface CreateEducationRequest {
  degree: string;
  institution: string;
  field: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  grade?: string;
  description?: string;
  achievements?: string[];
}

export interface CreateAwardRequest {
  title: string;
  issuer: string;
  dateIssued: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  type: Award['type'];
}

export interface CreateVideoRequest {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  visibility?: FeaturedVideo['visibility'];
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: CalendarEvent['type'];
  location?: string;
  rate?: number;
  currency?: string;
}

export interface CreateAvailabilityRequest {
  dates: string[]; // Array of dates to create separate documents for
  eventTypes: EventType[];
  modes: ('Online' | 'Offline' | 'Hybrid')[];
  timeSlots: TimeSlot[];
}

// Booking Types
export type BookingStep = 1 | 2 | 3 | 4;

export interface BookingValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface PrimaryCompensation {
  speakerFee: {
    enabled: boolean;
    amount: number;
  };
  honorarium: {
    enabled: boolean;
    amount: number;
  };
}

export interface TravelExpenses {
  enabled: boolean;
  mode: string; // 'air' | 'train' | 'car' | 'other'
  arrangement: string; // 'arrange' | 'reimburse'
  amount: number;
}

export interface LodgingAccommodation {
  enabled: boolean;
  type: string; // 'hotel' | 'corporate' | 'homestay' | 'other'
  arrangement: string; // 'arrange' | 'reimburse'
  checkInDate: string;
  checkOutDate: string;
  amount: number;
}

export interface AdditionalArrangements {
  enabled: boolean;
  localTransportation: boolean;
  meals: boolean;
  specialRequests: string;
}

export interface CompensationDetails {
  primaryCompensation: PrimaryCompensation;
  travelExpenses: TravelExpenses;
  lodgingAccommodation: LodgingAccommodation;
  additionalArrangements: AdditionalArrangements;
}

export interface BookingFormData {
  // Step 1: Date & Time
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  
  // Step 2: Event Details
  eventName: string;
  eventType: string;
  location: string;
  attendees: number;
  description: string;
  
  // Step 3: Compensation & Arrangements
  compensation: CompensationDetails;
  
  // Step 4: Review & Send
  personalMessage: string;
  currency: string;
}

export interface CurrentBooking {
  speakerId: string;
  speakerName: string;
  bookingId: string | null;
  status: 'draft' | 'submitted' | 'pending' | 'accepted' | 'declined' | 'cancelled';
}

export interface SpeakerAvailability {
  speakerId: string;
  dates: string[];
  eventTypes: {
    category: string;
    events: {
      name: string;
      price: number;
      currency: string;
    }[];
  }[];
  modes: string[];
  timeSlots: {
    slot: string;
    startTime: string;
    endTime: string;
  }[];
  count: number;
}

export interface BookingHistoryItem {
  _id: string;
  bookingId: string;
  speakerId: string;
  speakerName: string;
  eventName: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'draft' | 'submitted' | 'pending' | 'accepted' | 'declined' | 'cancelled';
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingState extends LoadingState {
  // Current booking session
  currentBooking: CurrentBooking | null;
  isBookingModalOpen: boolean;
  currentStep: BookingStep;
  
  // Form data for the booking flow
  formData: BookingFormData;
  
  // Validation state for each step
  validation: {
    step1: BookingValidation;
    step2: BookingValidation;
    step3: BookingValidation;
    step4: BookingValidation;
  };
  
  // Speaker availability data
  speakerAvailability: SpeakerAvailability | null;
  
  // Booking history
  bookingHistory: BookingHistoryItem[];
  
  // Available options
  availableEventTypes: string[];
  availableTimeSlots: string[];
}
