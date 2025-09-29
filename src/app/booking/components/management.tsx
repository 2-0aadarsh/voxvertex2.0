'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './parts/Sidebar';

import SpeakerCard from './parts/SpeakerCard';
import { Plus, Search } from 'lucide-react';

interface Speaker {
  id: string;
  name: string;
  expertise: string;
  date: string;
  price: number;
  image: string;
  status: 'In Progress' | 'Confirmed' | 'Declined';
  tags: string[];
  timeAgo: string;
}

export default function SpeakerManagementPage({ onTabChange, activeTab }: { onTabChange?: (tab: string) => void; activeTab?: string }) {
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
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b886?w=150&h=150&fit=crop&crop=face',
      status: 'In Progress',
      tags: ['Conference & Summits', 'Workshops'],
      timeAgo: '3 hours ago'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'In Progress',
      tags: ['Conference & Summits', 'Workshops'],
      timeAgo: '5 hours ago'
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'Confirmed',
      tags: ['Conference & Summits', 'Workshops'],
      timeAgo: '3 hours ago'
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'Confirmed',
      tags: ['Conference & Summits', 'Workshops'],
      timeAgo: '3 hours ago'
    },
    {
      id: '5',
      name: 'Sarah Johnson',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      status: 'Declined',
      tags: ['Conference & Summits', 'Workshops'],
      timeAgo: '3 hours ago'
    },
    {
      id: '6',
      name: 'Sarah Johnson',
      expertise: 'Artificial Intelligence & Machine Learning',
      date: 'May 10, 2024',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      status: 'Declined',
      tags: ['Conference & Summits', 'Workshops'],
      timeAgo: '3 hours ago'
    }
  ];

  const getStatusConfig = (status: Speaker['status']) => {
    switch (status) {
      case 'In Progress':
        return { 
          bgColor: 'bg-[#42A4FF]/10', 
          borderColor: 'border-[#42A4FF]',
          textColor: 'text-[#42A4FF]',
          badgeColor: 'bg-[#FF6B35]'
        };
      case 'Confirmed':
        return { 
          bgColor: 'bg-[#15823B]/10', 
          borderColor: 'border-[#15823B]',
          textColor: 'text-[#15823B]',
          badgeColor: 'bg-[#FF6B35]'
        };
      case 'Declined':
        return { 
          bgColor: 'bg-[#DC2626]/10', 
          borderColor: 'border-[#DC2626]',
          textColor: 'text-[#DC2626]',
          badgeColor: 'bg-[#FF6B35]'
        };
      default:
        return { 
          bgColor: 'bg-gray-100', 
          borderColor: 'border-gray-300',
          textColor: 'text-gray-600',
          badgeColor: 'bg-gray-400'
        };
    }
  };

  const filteredSpeakers = speakers.filter(speaker => {
    const matchesSearch = speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         speaker.expertise.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const groupedSpeakers = {
    'In Progress': filteredSpeakers.filter(s => s.status === 'In Progress'),
    'Confirmed': filteredSpeakers.filter(s => s.status === 'Confirmed'),
    'Declined': filteredSpeakers.filter(s => s.status === 'Declined')
  };

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      
      <div className="ml-64">
        
        {/* Orange Header Card */}
        <div className="p-6">
          <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md mb-6">
            <h1 className="text-2xl font-bold text-black mb-2">Speaker Management</h1>
            <p className="text-white">Manage your speakers, bookings, and payments in one place</p>
          </div>

          {/* Navigation Tabs - Full Width */}
          <div className="bg-gray-50 p-1 rounded-lg mb-6 flex">
            <button 
              onClick={() => onTabChange?.('Speaker Database')}
              className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
            >
              Speaker Database
            </button>
            <button className="flex-1 text-white bg-[#FF6B35] py-3 px-4 rounded-md font-medium">
              Speaker Management
            </button>
            <button 
              onClick={() => onTabChange?.('Documents')}
              className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
            >
              Documents
            </button>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)]">
            {/* Header with Add Speaker Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Speaker Management</h2>
                <p className="text-gray-600 text-sm">Manage your speaker relationships and bookings</p>
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

            {/* Kanban Board */}
            <div className="grid grid-cols-3 gap-6 h-full">
              {Object.entries(groupedSpeakers).map(([status, speakers]) => {
                const statusConfig = getStatusConfig(status as Speaker['status']);
                return (
                  <div key={status} className="flex flex-col h-full">
                    {/* Column Header */}
                    <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-1 rounded-t-md p-4`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${statusConfig.textColor}`}>{status}</h3>
                        <span className={`${statusConfig.badgeColor} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                          {speakers.length}
                        </span>
                      </div>
                    </div>
                    
                    {/* Speaker Cards - Stretch to bottom */}
                    <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-1 border-t-0 rounded-b-xl p-4 space-y-4 flex-1`}>
                      {speakers.map((speaker, index) => (
                        <SpeakerCard 
                          key={speaker.id} 
                          speaker={speaker}
                          showAttachButton={status === 'Confirmed'}
                          isMiddleTop={status === 'Confirmed' && index === 0}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}