export interface Event {
  id: number;
  title: string;
  description: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  eventUrl?: string;
  location?: string;
  date: string;
  time: string;
  duration: string;
  capacity: number;
  price: number;
  image: string;
}

export interface MenuItem {
  icon: any;
  label: string;
  active: boolean;
}

export interface BottomMenuItem {
  icon: any;
  label: string;
}