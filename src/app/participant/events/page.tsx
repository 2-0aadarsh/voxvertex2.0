"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Clock, Users, Video, Building,ChevronDown 
 } from "lucide-react";
import { useGetUpcomingEventsQuery, useGetPublishedEventsQuery } from "@/store/slices/enhancedEventSlice";

// --- Helper Functions ---
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const isEventUpcoming = (startDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(startDate) >= today;
};

const isEventPast = (endDate: string) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return new Date(endDate) < today;
};

const getMinPriceTicket = (ticketTypes: any[]) => {
  if (!ticketTypes || !ticketTypes.length) return null;
  const prices = ticketTypes
    .map((ticket) =>
      typeof ticket.price === "string" ? parseFloat(ticket.price) : ticket.price
    )
    .filter((price) => price > 0);
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
    { id: "standard", label: "Standard" },
  ],
  categories: [
    { id: "all", label: "All Categories" },
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past Events" },
  ],
};

export default function ParticipantEvents() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("upcoming");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const {
    data: eventsResponse,
    isLoading,
    error,
  } = useGetPublishedEventsQuery({
    page: 1,
    limit: 50,
    sortBy: "startDate",
    sortOrder: "asc",
  });

  const allEvents = eventsResponse?.data?.events || [];
  const upcomingEvents = allEvents.filter((event) =>
    isEventUpcoming(event.startDate)
  );
  const pastEvents = allEvents.filter((event) => isEventPast(event.endDate));

  const currentEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  const filteredEvents = currentEvents.filter((event: any) => {
    const matchesSearch =
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const minPrice = getMinPriceTicket(event.ticketTypes);
    const eventType = minPrice && minPrice >= 200 ? "vip" : "standard";
    const matchesType = selectedType === "all" || eventType === selectedType;
    return matchesSearch && matchesType;
  });

  const getLocationIcon = (mode: string) => {
    switch (mode) {
      case "online":
        return <Video size={20} className="text-blue-500" />;
      case "offline":
        return <Building size={20} className="text-green-500" />;
      case "hybrid":
        return <MapPin size={20} className="text-purple-500" />;
      default:
        return <MapPin size={20} />;
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen w-full bg-[#fff5f5] flex items-center justify-center">
        <span className="text-lg text-gray-600">Loading events...</span>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen w-full bg-[#fff5f5] flex items-center justify-center">
        <span className="text-lg text-red-600">
          Error loading events. Please try again.
        </span>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#fff5f5] flex justify-center py-8">
      {/* 85% viewport width for white background container */}
      <div className="w-full max-w-[85vw] bg-white rounded-2xl shadow-sm flex flex-col p-6 lg:p-8 mx-4">
        {/* Title + Subtitle */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600">Manage all your events in one place</p>
        </div>

        {/* Search Bar with simple category/type placeholders */}
        <div className="mb-6 w-full border border-gray-200 rounded-xl p-3 flex items-center gap-3">
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-md focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-md">
            <span>All Categories</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
          <button className="flex items-center gap-2 text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-md">
            <span>All Types</span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Events Tabs */}
        <div className="bg-[#fbf2ef] rounded-lg mb-6 flex w-full p-1 gap-2">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${
              activeTab === "upcoming"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-700"
            }`}
          >
            <Calendar size={16} />
            <span>Upcoming ({upcomingEvents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium ${
              activeTab === "past"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-700"
            }`}
          >
            <Clock size={16} />
            <span>Past Events ({pastEvents.length})</span>
          </button>
        </div>

        {/* Events Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-10 text-center col-span-3">
                <div className="flex flex-col items-center gap-3">
                  <Calendar size={36} className="text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {activeTab === "upcoming"
                      ? "No upcoming events found"
                      : "No past events found"}
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === "upcoming"
                      ? "You don't have any upcoming events"
                      : "You don't have any past events"}
                  </p>
                </div>
              </div>
            ) : (
              filteredEvents.map((event: any) => {
                const minPrice = getMinPriceTicket(event.ticketTypes);
                const eventType =
                  minPrice && minPrice >= 200 ? "vip" : "standard";

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
                        <span
                          className={`px-4 py-2 rounded-full text-base font-semibold ${
                            eventType === "vip"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {eventType} - ${minPrice || 0}
                        </span>
                      </div>
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-4 py-2 rounded-full text-base font-semibold ${
                            activeTab === "upcoming"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {activeTab === "upcoming" ? "upcoming" : "past"}
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
                          <Calendar
                            size={20}
                            className="mr-3 text-gray-400 flex-shrink-0"
                          />
                          <span>{formatDate(event.startDate)}</span>
                        </div>
                        <div className="flex items-center text-lg text-gray-600">
                          <Clock
                            size={20}
                            className="mr-3 text-gray-400 flex-shrink-0"
                          />
                          <span>
                            {formatTime(event.startDate)} -{" "}
                            {formatTime(event.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center text-lg text-gray-600">
                          {getLocationIcon(event.eventMode)}
                          <span className="ml-3">
                            {event.eventMode === "online"
                              ? "Online"
                              : event.eventMode === "hybrid"
                              ? `Hybrid • ${event.location || "TBA"}`
                              : `Offline • ${event.location || "TBA"}`}
                          </span>
                        </div>
                        <div className="flex items-center text-lg text-gray-600">
                          <Users
                            size={20}
                            className="mr-3 text-gray-400 flex-shrink-0"
                          />
                          <span>
                            {event.totalTicketsSold || 0}/{event.totalCapacity}{" "}
                            registered
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                          {event.tags
                            .slice(0, 3)
                            .map((tag: string, idx: number) => (
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
                          onClick={() =>
                            router.push(`/participant/events/${event._id}`)
                          }
                          className={`text-lg font-semibold text-white rounded-lg px-8 py-3 transition-colors w-full ${
                            activeTab === "upcoming"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-gray-600 hover:bg-gray-700"
                          }`}
                        >
                          {activeTab === "upcoming"
                            ? "View Details"
                            : "View Event"}
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
