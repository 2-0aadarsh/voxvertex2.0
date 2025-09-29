//app\booking\components\database.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './parts/Sidebar';
import Header from './parts/Header';
import BookingSpeakerCard from './parts/card1';
import { Plus, Search } from 'lucide-react';

interface Speaker {
  id: string;
  name: string;
  title: string;
  expertise: string;
  date: string;
  rating: number;
  bookings: number;
  location: string;
  price: number;
  image: string;
  status: 'In Progress' | 'Confirmed' | 'Declined';
  tags: string[];
  specialization: string;
  description: string;
  timeAgo: string;
  avatar?: string;
}

export default function SpeakerDatabasePage({ onTabChange, activeTab }: { onTabChange?: (tab: string) => void; activeTab?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('All Tags');
  const router = useRouter();

  const handleAddSpeaker = () => {
    // Navigate to add speaker page
    console.log('Navigate to add speaker page');
  };

  // Sample speakers data
  const speakers: Speaker[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Expert Speaker',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      rating: 4.9,
      bookings: 25,
      location: 'San Francisco, CA',
      price: 3000,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b886?w=150&h=150&fit=crop&crop=face',
      status: 'Confirmed',
      tags: ['Conferences & Summits', 'Seminars'],
      specialization: 'AI & Machine Learning',
      description: 'Leading AI researcher with 15+ years of experience in deep learning and neural networks.',
      timeAgo: '3 hours ago'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      title: 'Expert Speaker',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      rating: 4.9,
      bookings: 25,
      location: 'San Francisco, CA',
      price: 3000,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'Confirmed',
      tags: ['Conferences & Summits', 'Seminars'],
      specialization: 'AI & Machine Learning',
      description: 'Leading AI researcher with 15+ years of experience in deep learning and neural networks.',
      timeAgo: '5 hours ago'
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      title: 'Expert Speaker',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      rating: 4.9,
      bookings: 25,
      location: 'San Francisco, CA',
      price: 3000,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'Confirmed',
      tags: ['Conferences & Summits', 'Seminars'],
      specialization: 'AI & Machine Learning',
      description: 'Leading AI researcher with 15+ years of experience in deep learning and neural networks.',
      timeAgo: '3 hours ago'
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      title: 'Expert Speaker',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      rating: 4.9,
      bookings: 25,
      location: 'San Francisco, CA',
      price: 3000,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'Confirmed',
      tags: ['Conferences & Summits', 'Seminars'],
      specialization: 'AI & Machine Learning',
      description: 'Leading AI researcher with 15+ years of experience in deep learning and neural networks.',
      timeAgo: '3 hours ago'
    },
    {
      id: '5',
      name: 'Sarah Johnson',
      title: 'Expert Speaker',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      rating: 4.9,
      bookings: 25,
      location: 'San Francisco, CA',
      price: 3000,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      status: 'Confirmed',
      tags: ['Conferences & Summits', 'Seminars'],
      specialization: 'AI & Machine Learning',
      description: 'Leading AI researcher with 15+ years of experience in deep learning and neural networks.',
      timeAgo: '3 hours ago'
    },
    {
      id: '6',
      name: 'Sarah Johnson',
      title: 'Expert Speaker',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      rating: 4.9,
      bookings: 25,
      location: 'San Francisco, CA',
      price: 3000,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      status: 'Confirmed',
      tags: ['Conferences & Summits', 'Seminars'],
      specialization: 'AI & Machine Learning',
      description: 'Leading AI researcher with 15+ years of experience in deep learning and neural networks.',
      timeAgo: '3 hours ago'
    }
  ];

  const filteredSpeakers = speakers.filter(speaker => {
    const matchesSearch = speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         speaker.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)]">
      {/* Header with Add Speaker Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Speaker Database</h2>
          <p className="text-gray-600 text-sm">Manage your speaker network and build your expertise base</p>
        </div>
        <button 
          onClick={handleAddSpeaker}
          className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#FF6B35]/90 font-medium"
        >
          <Plus size={16} />
          <span>Add Speaker</span>
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center space-x-10 mb-6">
        <div className="relative flex-1 max-w-3xl">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search speaker by name, expertise, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#FF6B35] bg-[#FF6B35]/15 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
          />
        </div>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-7 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
        >
          <option>All Tags</option>
          <option>Conference & Summits</option>
          <option>Workshops</option>
        </select>
      </div>

      {/* Speaker Cards Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredSpeakers.map((speaker) => (
          <BookingSpeakerCard 
            key={speaker.id} 
            speaker={speaker}
          />
        ))}
      </div>
    </div>
  );
}