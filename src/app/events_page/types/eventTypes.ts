export interface TicketDiscount {
  enabled: boolean
  name: string
  type: 'percentage' | 'fixed'
  value: string
  maxUses: string
  startDate: string
  endDate: string
  code: string
  description: string
}

export interface TicketType {
  name: string
  price: string
  quantity: string
  features: string[]
  discount: TicketDiscount
}

export interface EventFormData {
  // Core Details
  eventName: string
  startDate: string
  endDate: string
  eventMode: 'offline' | 'online' | 'hybrid'
  format: string
  location: string
  eventUrl: string
  
  // Branding & Content
  description: string
  image: File | null
  tags: string[]
  
  // Ticketing - Updated to use enhanced TicketType
  ticketTypes: TicketType[]
  
  // Speakers
  speakers: Array<{
    name: string
    title: string
    bio: string
  }>
  
  // Add-ons
  addons: {
    featureOnHome: boolean
    includeInNewsletter: boolean
    socialMediaPromotion: boolean
  }
}

export interface Speaker {
  name: string
  title: string
  bio: string
  image?: string
}