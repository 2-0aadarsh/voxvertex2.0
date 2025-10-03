export type EventStatus = 'Upcoming' | 'Completed' | 'Cancelled' | 'Postponed' | 'Postponed - Awaiting Action' | 'Declined';

export interface Event {
  id: number;
  title: string;
  organizer: string;
  date: string;
  amount: number;
  status: EventStatus;
  rating: number | null;
  settlement: number | null;
  message: string | null;
  accepted: boolean;
  newDate?: string;
}

export interface StatusConfig {
  bg: string;
  text: string;
  icon: React.ComponentType<any>;
}

export interface Ratings {
  organization: number;
  communication: number;
  engagement: number;
  timing: number;
}