// Sample data for testing the home page sections
// This file can be used to populate the homeSlice with test data

import { Speaker, Blog, Advertisement } from '@/store/slices/homeSlice';

export const sampleFeaturedSpeakers: Speaker[] = [
  {
    id: '1',
    name: 'Dr. Anya Sharma',
    title: 'AI Ethicist',
    description: 'A leading voice in ethical AI development and its societal impact.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face'
  }
];

export const sampleTopSpeakers: Speaker[] = [
  {
    id: '1',
    name: 'Dr. Anya Sharma',
    title: 'AI Ethicist',
    bio: 'Leading ethical AI development',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    title: 'Tech CEO',
    bio: 'Transforming digital landscapes',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Sarah Chen',
    title: 'Data Scientist',
    bio: 'Turning data into insights',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'David Rodriguez',
    title: 'Design Director',
    bio: 'Creating meaningful experiences',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    title: 'Marketing Expert',
    bio: 'Building powerful brand stories',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face'
  }
];

export const sampleRecentBlogs: Blog[] = [
  {
    id: '1',
    title: '5 Essential Public Speaking Tips',
    description: 'Master the art of confident presentation',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=60&h=60&fit=crop'
  }
];

export const sampleAdvertisements: Advertisement[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80',
    title: 'Business Analytics Course',
    description: 'Learn data-driven decision making'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop&q=80',
    title: 'Digital Marketing Workshop',
    description: 'Boost your online presence'
  }
];

