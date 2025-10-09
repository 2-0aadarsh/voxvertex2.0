"use client";

import React from "react";
import {
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import { SpeakerBooking } from "@/store/api/speakerBookingsApi";

interface OrganizerCardProps {
  booking: SpeakerBooking;
  onAccept?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  onMessage?: (conversationId: string) => void;
  isLoading?: boolean;
}

export default function OrganizerCard({
  booking,
  onAccept,
  onDecline,
  onViewDetails,
  onMessage,
  isLoading = false,
}: OrganizerCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200";
      case "declined":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-500";
      case "accepted":
        return "bg-green-500";
      case "declined":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm border-l-[6px] border-orange-300">
      {/* Header with profile */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
          {booking.organizer.profileImageUrl ? (
            <img
              src={booking.organizer.profileImageUrl}
              alt={`${booking.organizer.firstName} ${booking.organizer.lastName}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}
            />
          ) : null}
          <div
            className={`w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-lg ${
              booking.organizer.profileImageUrl ? "hidden" : "flex"
            }`}
          >
            {booking.organizer.firstName?.[0]}
            {booking.organizer.lastName?.[0]}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {booking.organizer.firstName} {booking.organizer.lastName}
          </h3>
          <p className="text-sm text-gray-500">
            {booking.organizer.companyName || "Organizer"}
          </p>
        </div>
      </div>

      {/* Event details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>{formatDate(booking.date)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium text-green-600">
            ₹
            {booking.compensationAndArrangements.primaryCompensation.speakerFeeAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
          {booking.eventType}
        </span>
      </div>

      {/* Timestamp */}
      <div className="flex items-center text-xs text-gray-500 mb-4">
        <Clock className="w-3 h-3 mr-1" />
        <span>{getTimeAgo(booking.createdAt)}</span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col space-y-2">
        {booking.status === "accepted" && (
          <button
            onClick={() => onMessage?.(booking.conversationId)}
            className="w-full bg-[#FF6B35] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#FF6B35]/90 transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <Calendar className="w-4 h-4" />
            <span>Attach to Events</span>
          </button>
        )}
      </div>
    </div>
  );
}
