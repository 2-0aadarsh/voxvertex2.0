"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Clock, Users, Video, Building } from "lucide-react";
import { useGetPublishedEventsQuery } from "@/store/slices/enhancedEventSlice";

// --- Helper Functions ---
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const isEventUpcoming = (startDate: string) => {
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(startDate) >= today;
};

const getMinPriceTicket = (ticketTypes: any[]) => {
  if (!ticketTypes || !ticketTypes.length) return null;
  const prices = ticketTypes.map(ticket => typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price)
    .filter(price => price > 0);
  return prices.length > 0 ? Math.min(...prices) : 0;
};

const getOrganizerDisplay = (o: any) =>
  !o
    ? "Unknown Organizer"
    : typeof o === "object"
      ? o.firstName && o.lastName
        ? `${o.firstName} ${o.lastName}`
        : o.name
          ? o.name
          : o.email || "Unknown Organizer"
      : o;

// ------------------------
const filters = {
  types: [
    { id: "all", label: "All Types" },
    { id: "vip", label: "VIP" },
    { id: "standard", label: "Standard" }
  ],
  categories: [
    { id: "all", label: "All Categories" },
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past Events" }
  ]
};

export default function ParticipantEvents() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("upcoming");
  const { data: eventsResponse, isLoading, error } = useGetPublishedEventsQuery({
    page: 1, limit: 50, sortBy: 'startDate', sortOrder: 'asc'
  });

  const upcomingEvents = eventsResponse?.data?.events?.filter(event => isEventUpcoming(event.startDate)) || [];
  const filteredEvents = upcomingEvents.filter((event: any) => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      || event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const minPrice = getMinPriceTicket(event.ticketTypes);
    const eventType = minPrice && minPrice >= 200 ? "vip" : "standard";
    const matchesType = selectedType === "all" || eventType === selectedType;
    const matchesCategory = selectedCategory === "all" || selectedCategory === "upcoming";
    return matchesSearch && matchesType && matchesCategory;
  });

  const getLocationIcon = (mode: string) => {
    switch (mode) {
      case "online": return <Video size={20} className="text-blue-500" />;
      case "offline": return <Building size={20} className="text-green-500" />;
      case "hybrid": return <MapPin size={20} className="text-purple-500" />;
      default: return <MapPin size={20} />;
    }
  };

  if (isLoading) return (
    <div className="min-h-screen w-full bg-[#fff5f5] flex items-center justify-center">
      <span className="text-lg text-gray-600">Loading events...</span>
    </div>
  );
  if (error) return (
    <div className="min-h-screen w-full bg-[#fff5f5] flex items-center justify-center">
      <span className="text-lg text-red-600">Error loading events. Please try again.</span>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#fff5f5] flex justify-center py-8">
      {/* 85% viewport width for white background container */}
      <div className="w-full max-w-[85vw] bg-white rounded-2xl shadow-sm flex flex-col p-6 lg:p-8 mx-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Upcoming Events ({filteredEvents.length} events)
          </h1>
          <p className="text-gray-600 text-lg">Discover and join amazing events</p>
        </div>

        {/* Search and Filters Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4 ">
          <div className="flex items-center flex-grow max-w-md">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-base"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-lg py-2.5 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 bg-white min-w-[120px] text-base"
            >
              {filters.types.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
            </select>
            
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg py-2.5 px-3 text-gray-700 focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px] text-base"
            >
              {filters.categories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}
            </select>
            
            <button className="p-2.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 14.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17v-2.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center col-span-3">
                <p className="text-gray-600 text-lg">No upcoming events found.</p>
              </div>
            ) : (
              filteredEvents.map((event: any) => {
                const minPrice = getMinPriceTicket(event.ticketTypes);
                const eventType = minPrice && minPrice >= 200 ? "vip" : "standard";
                
                return (
                  <div
                    key={event._id}
                    className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300 h-full"
                  >
                    {/* Event Image */}
                    <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                      <img 
                        src={event.imageUrl || "/default-event.jpg"} 
                        alt={event.eventName} 
                        className="w-full h-full object-cover"
                      />
                      {/* Price Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-4 py-2 rounded-full text-base font-semibold ${
                          eventType === "vip" 
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}>
                          {eventType} - ${minPrice || 0}
                        </span>
                      </div>
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-base font-semibold">
                          upcoming
                        </span>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Event Title & Description */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">
                        {event.eventName}
                      </h3>
                      <p className="text-gray-600 text-lg mb-4 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                      
                      {/* Organizer */}
                      <div className="text-lg text-gray-500 mb-4 font-medium">
                        {getOrganizerDisplay(event.organizer)}
                      </div>

                      {/* Event Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-lg text-gray-600">
                          <Calendar size={20} className="mr-3 text-gray-400 flex-shrink-0" />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center text-lg text-gray-600">
                          <Clock size={20} className="mr-3 text-gray-400 flex-shrink-0" />
                          <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                        </div>
                        <div className="flex items-center text-lg text-gray-600">
                          {getLocationIcon(event.eventMode)}
                          <span className="ml-3">
                            {event.eventMode === 'online' ? 'Online' : 
                             event.eventMode === 'hybrid' ? `Hybrid • ${event.location || 'TBA'}` : 
                             `Offline • ${event.location || 'TBA'}`}
                          </span>
                        </div>
                        <div className="flex items-center text-lg text-gray-600">
                          <Users size={20} className="mr-3 text-gray-400 flex-shrink-0" />
                          <span>{event.totalTicketsSold || 0}/{event.totalCapacity} registered</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {event.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="px-4 py-2 bg-gray-100 rounded-full text-base text-gray-700 border border-gray-200 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {event.tags.length > 3 && (
                            <span className="px-4 py-2 bg-gray-100 rounded-full text-base text-gray-700 border border-gray-200 font-medium">
                              +{event.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Button - Centered without icons */}
                      <div className="flex justify-center mt-auto">
                        <button 
                          onClick={() => router.push(`/participant/events/${event._id}`)}
                          className="text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-8 py-3 transition-colors w-full"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}