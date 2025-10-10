import React from 'react';
import { Calendar, Star, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Event } from '../types';
import StatusBadge from './StatusBadge';

interface EventCardProps {
  event: Event;
  onOpenFeedback: (event: Event) => void;
  onOpenSettlement: (event: Event) => void;
  onOpenNegotiate: (event: Event) => void;
  onCancelEvent: (event: Event) => void;
}

export default function EventCard({
  event,
  onOpenFeedback,
  onOpenSettlement,
  onOpenNegotiate,
  onCancelEvent
}: EventCardProps) {
  return (
    <div className="bg-white border border-[#FF6B35] rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{event.title}</h3>
      
      <div className="space-y-3 mb-6">
        <p className="text-gray-600 text-sm">Organizer: {event.organizer}</p>
        
        <div className="flex items-center text-sm gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{event.date}</span>
        </div>
        
        {event.settlement ? (
          <div>
            <p className="text-[#FF6B35] text-md font-medium">
              $ {event.amount.toLocaleString()} <span className="text-base text-gray-600 font-normal">(Settlement: ${event.settlement.toLocaleString()})</span>
            </p>
          </div>
        ) : (
          <p className="text-[#FF6B35] text-md font-medium">$ {event.amount.toLocaleString()}</p>
        )}
        
        {event.status === 'Completed' && event.rating ? (
          <div className="flex items-center justify-between">
            <StatusBadge status={event.status} />
            <div className="flex items-center gap-1 text-[#FF6B35]">
              <Star className="w-5 h-5 fill-current" />
              <span className="">{event.rating}/5</span>
            </div>
          </div>
        ) : (
          <StatusBadge status={event.status} />
        )}
        
        {event.message && (
          <div className="bg-yellow-50 text-yellow-800 px-3 py-2 rounded text-sm">
            {event.message}
          </div>
        )}
      </div>

      {event.status === 'Upcoming' && (
        <div className="space-y-3">
          <button 
            onClick={() => onOpenFeedback(event)}
            className="w-full bg-[#FF6B35] hover:bg-[#e1501b] text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            Complete & Review
          </button>
          
          <button 
            onClick={() => onCancelEvent(event)}
            className="w-full bg-white hover:bg-orange-50 text-[#FF6B35] border border-[#FF6B35] font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <XCircle className="w-5 h-5" />
            Cancel Event
          </button>
        </div>
      )}

      {event.status === 'Completed' && (
        <div className="flex items-center gap-2 text-green-600 justify-center py-3">
          <span className="text-lg">✓</span>
          <span className="font-medium">{event.message}</span>
        </div>
      )}

      {event.status === 'Cancelled' && !event.settlement && (
        <div className="space-y-3">
          <button 
            onClick={() => onOpenSettlement(event)}
            className="w-full bg-[#FF6B35] hover:bg-[#e1501b] text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Propose Settlement
          </button>
        </div>
      )}

      {event.status === 'Cancelled' && event.settlement && (
        <div className="space-y-3">
          <p className="text-[#FF6B35] font-medium text-center">Settlement: ${event.settlement?.toLocaleString()}</p>
          
          <button 
            onClick={() => onOpenFeedback(event)}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-[#FF6B35]/50 font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Star className="w-5 h-5" />
            Add Rating
          </button>
        </div>
      )}

      {event.status === 'Postponed' && (
        <div className="space-y-3">
          {event.accepted && (
            <p className="text-green-600 font-medium text-center flex items-center justify-center gap-1">
              <span>✓</span> Accepted
            </p>
          )}
          
          <button 
            onClick={() => onOpenFeedback(event)}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-[#FF6B35]/50 font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Star className="w-5 h-5" />
            Add Rating
          </button>
        </div>
      )}

      {event.status === 'Postponed - Awaiting Action' && (
        <div>
          <button 
            onClick={() => onOpenNegotiate(event)}
            className="w-full bg-[#FF6B35] hover:bg-[#e1501b] text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Respond Now
          </button>
        </div>
      )}

      {event.status === 'Declined' && (
        <div className="space-y-3">
          <p className="text-red-600 font-medium text-center flex items-center justify-center gap-1">
            <span>✗</span> Declined
          </p>
          
          <button 
            onClick={() => onOpenNegotiate(event)}
            className="w-full bg-white  text-yellow-600 border border-yellow-600 font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            Negotiate
          </button>
          
          <button 
            onClick={() => onOpenFeedback(event)}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-[#FF6B35]/50 font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Star className="w-5 h-5" />
            Add Rating
          </button>
        </div>
      )}
    </div>
  );
}