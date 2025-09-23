'use client';
import React, { useState } from 'react';
import Header from './components/Header';
import FiltersSidebar from './components/FiltersSidebar';
import SpeakerCard from './components/SpeakerCard';
import { 
  Search, 
  Filter
} from 'lucide-react';

interface Speaker {
  id: number;
  name: string;
  title: string;
  rating: number;
  bookings: number;
  location: string;
  price: number;
  tags: string[];
  specialization: string;
  avatar?: string;
}

const mockSpeakers: Speaker[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Innovation & Digital Transformation Expert",
    rating: 4.9,
    bookings: 42,
    location: "San Francisco, CA",
    price: 3500,
    tags: ["Innovation", "Leadership"],
    specialization: "Digital Transformation"
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "AI & Machine Learning Specialist",
    rating: 4.8,
    bookings: 38,
    location: "Seattle, WA",
    price: 4200,
    tags: ["AI", "Technology"],
    specialization: "Artificial Intelligence"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    title: "Healthcare Innovation Leader",
    rating: 4.9,
    bookings: 35,
    location: "Boston, MA",
    price: 3800,
    tags: ["Healthcare", "Innovation"],
    specialization: "Medical Technology"
  },
  {
    id: 4,
    name: "David Park",
    title: "Cybersecurity Expert",
    rating: 4.7,
    bookings: 29,
    location: "Austin, TX",
    price: 3200,
    tags: ["Cybersecurity", "Technology"],
    specialization: "Information Security"
  },
  {
    id: 5,
    name: "Lisa Wang",
    title: "Fintech Innovation Strategist",
    rating: 4.8,
    bookings: 31,
    location: "New York, NY",
    price: 3600,
    tags: ["Fintech", "Strategy"],
    specialization: "Financial Technology"
  },
  {
    id: 6,
    name: "James Thompson",
    title: "EdTech & Learning Experience Designer",
    rating: 4.9,
    bookings: 26,
    location: "Denver, CO",
    price: 3400,
    tags: ["EdTech", "Design"],
    specialization: "Educational Technology"
  }
];

const SpeakerMarketplace: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div 
          className="rounded-lg p-6 mb-6 bg-cover bg-center relative"
          style={{ backgroundImage: 'url(/ai.png)' }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {showFilters ? 'Search Results for "Artificial Intelligence"' : 'Speaker Marketplace'}
              </h1>
              <p className="text-gray-600">
                {showFilters 
                  ? `Showing 1-${mockSpeakers.length} of ${mockSpeakers.length} speakers`
                  : 'Discover and book expert speakers for your events'
                }
              </p>
            </div>
            <div className="bg-[#FF6B35] text-white px-4 py-2 rounded-full font-medium">
              {showFilters ? (
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-white focus:outline-none"
                >
                  <option value="relevance" className="text-gray-900">Relevance</option>
                  <option value="price-low" className="text-gray-900">Price: Low to High</option>
                  <option value="price-high" className="text-gray-900">Price: High to Low</option>
                  <option value="rating" className="text-gray-900">Rating</option>
                </select>
              ) : (
                `${mockSpeakers.length} speakers found`
              )}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left side - Filters button and count */}
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleFilters}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-[#FF6B35] text-white hover:bg-orange-600' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <span className="text-gray-600 font-medium">
                {mockSpeakers.length} speakers found
              </span>
            </div>

            {/* Right side - Relevance dropdown */}
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="experience">Experience</option>
                <option value="reviews">Most Reviews</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex gap-8 ${showFilters ? '' : 'justify-center'}`}>
          {/* Filters Sidebar - Only show when showFilters is true */}
          {showFilters && <FiltersSidebar />}
          
          {/* Speaker Grid */}
          <div className="flex-1">
            <div className={`grid gap-4 ${showFilters ? 'grid-cols-2' : 'grid-cols-3 max-w-6xl mx-auto'}`}>
              {mockSpeakers.map((speaker) => (
                <SpeakerCard 
                  key={speaker.id} 
                  speaker={speaker} 
                  isCompact={showFilters}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakerMarketplace;