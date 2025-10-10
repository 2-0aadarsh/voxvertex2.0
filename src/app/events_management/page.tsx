'use client';
import React, { useState } from 'react';
import { Event, EventStatus, Ratings } from './types';
import FilterBar from './components/FilterBar';
import EventCard from './components/EventCard';
import FeedbackModal from './components/FeedbackModal';
import SettlementModal from './components/SettlementModal';
import NegotiateModal from './components/NegotiateModal';

export default function EventManagement() {
  const [activeFilter, setActiveFilter] = useState<string>('All Events');
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showSettlementModal, setShowSettlementModal] = useState<boolean>(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [ratings, setRatings] = useState<Ratings>({
    organization: 0,
    communication: 0,
    engagement: 0,
    timing: 0
  });
  const [workAgain, setWorkAgain] = useState<string>('');
  const [additionalComments, setAdditionalComments] = useState<string>('');
  const [settlementAmount, setSettlementAmount] = useState<string>('0.00');
  const [settlementReason, setSettlementReason] = useState<string>('');
  const [postponeResponse, setPostponeResponse] = useState<string>('');
  const [proposedDate, setProposedDate] = useState<string>('');
  const [proposedTime, setProposedTime] = useState<string>('');
  const [declineReason, setDeclineReason] = useState<string>('');
  
  const filters: string[] = ['All Events', 'Upcoming', 'Completed', 'Cancelled', 'Postponed'];
  
  const [mockEvents, setMockEvents] = useState<Event[]>([
    {
      id: 1,
      title: 'AI in Healthcare Summit',
      organizer: 'John Smith',
      date: '12/15/2024',
      amount: 5000,
      status: 'Upcoming',
      rating: null,
      settlement: null,
      message: null,
      accepted: false
    },
    {
      id: 2,
      title: 'Digital Transformation Workshop',
      organizer: 'Lisa Johnson',
      date: '11/28/2024',
      amount: 3500,
      status: 'Completed',
      rating: 5,
      settlement: null,
      message: 'Event completed & reviewed',
      accepted: false
    },
    {
      id: 3,
      title: 'Cybersecurity Best Practices',
      organizer: 'John Smith',
      date: '12/20/2024',
      amount: 4000,
      status: 'Cancelled',
      rating: null,
      settlement: 1500,
      message: null,
      accepted: false
    },
    {
      id: 4,
      title: 'Cloud Architecture Masterclass',
      organizer: 'David Brown',
      date: '12/10/2024',
      amount: 6000,
      status: 'Postponed',
      rating: null,
      settlement: null,
      message: 'Moved to 12/10/2024',
      accepted: true
    },
    {
      id: 5,
      title: 'Future Leaders Gala',
      organizer: 'Global Connect',
      date: '11/5/2024',
      amount: 150000,
      status: 'Postponed - Awaiting Action',
      rating: null,
      settlement: null,
      message: 'Date change pending',
      accepted: false
    }
  ]);

  const filteredEvents = activeFilter === 'All Events' 
    ? mockEvents 
    : mockEvents.filter(event => {
        if (activeFilter === 'Postponed') {
          return event.status.includes('Postponed');
        }
        return event.status === activeFilter;
      });

  const handleOpenFeedback = (event: Event) => {
    setSelectedEvent(event);
    setShowFeedbackModal(true);
    setRatings({
      organization: 0,
      communication: 0,
      engagement: 0,
      timing: 0
    });
    setWorkAgain('');
    setAdditionalComments('');
  };

  const handleCloseFeedback = () => {
    setShowFeedbackModal(false);
    setSelectedEvent(null);
  };

  const handleOpenSettlement = (event: Event) => {
    setSelectedEvent(event);
    setShowSettlementModal(true);
    setSettlementAmount('0.00');
    setSettlementReason('');
  };

  const handleCloseSettlement = () => {
    setShowSettlementModal(false);
    setSelectedEvent(null);
  };

  const handleOpenNegotiate = (event: Event) => {
    setSelectedEvent(event);
    setShowNegotiateModal(true);
    setPostponeResponse('');
    setProposedDate('');
    setProposedTime('');
    setDeclineReason('');
  };

  const handleCloseNegotiate = () => {
    setShowNegotiateModal(false);
    setSelectedEvent(null);
    setPostponeResponse('');
    setProposedDate('');
    setProposedTime('');
    setDeclineReason('');
  };

  const handleCancelEvent = (event: Event) => {
    setMockEvents(prev => prev.map(e => 
      e.id === event.id 
        ? { ...e, status: 'Cancelled' as EventStatus }
        : e
    ));
  };

  const handleRatingClick = (category: string, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmitFeedback = () => {
    if (selectedEvent) {
      const totalRating = Object.values(ratings).reduce((sum, val) => sum + val, 0);
      const avgRating = Math.round(totalRating / 4);
      
      setMockEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? { 
              ...event, 
              status: 'Completed' as EventStatus,
              rating: avgRating,
              message: 'Event completed & reviewed'
            }
          : event
      ));
      
      handleCloseFeedback();
    }
  };

  const handleSubmitSettlement = () => {
    if (selectedEvent && settlementAmount && settlementReason) {
      const settlementValue = parseFloat(settlementAmount);
      
      setMockEvents(prev => prev.map(event => 
        event.id === selectedEvent.id 
          ? { 
              ...event, 
              settlement: settlementValue
            }
          : event
      ));
      
      handleCloseSettlement();
    }
  };

  const handleSubmitNegotiate = () => {
    if (selectedEvent) {
      if (postponeResponse === 'accept' && proposedDate && proposedTime) {
        setMockEvents(prev => prev.map(event => 
          event.id === selectedEvent.id 
            ? { 
                ...event, 
                status: 'Postponed' as EventStatus,
                accepted: true,
                newDate: proposedDate,
                message: `Moved to ${new Date(proposedDate).toLocaleDateString()}`
              }
            : event
        ));
        handleCloseNegotiate();
      } else if (postponeResponse === 'decline') {
        setMockEvents(prev => prev.map(event => 
          event.id === selectedEvent.id 
            ? { 
                ...event, 
                status: 'Declined' as EventStatus,
                message: 'Declined'
              }
            : event
        ));
        handleCloseNegotiate();
      }
    }
  };

  const handleQuickSelect = (percentage: number) => {
    if (selectedEvent) {
      const amount = (selectedEvent.amount * percentage / 100).toFixed(2);
      setSettlementAmount(amount);
    }
  };

  const topRowEvents = filteredEvents.slice(0, 3);
  const bottomRowEvents = filteredEvents.slice(3, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-2xl font-bold text-gray-900 mb-2">Event Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Track and manage all speaker events and engagements</p>
          </div>
          
          <FilterBar 
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      </div>

      <div className="space-y-6">
        {topRowEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRowEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onOpenFeedback={handleOpenFeedback}
                onOpenSettlement={handleOpenSettlement}
                onOpenNegotiate={handleOpenNegotiate}
                onCancelEvent={handleCancelEvent}
              />
            ))}
          </div>
        )}

        {bottomRowEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bottomRowEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onOpenFeedback={handleOpenFeedback}
                onOpenSettlement={handleOpenSettlement}
                onOpenNegotiate={handleOpenNegotiate}
                onCancelEvent={handleCancelEvent}
              />
            ))}
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found for this filter.</p>
          </div>
        )}
      </div>

      {showNegotiateModal && selectedEvent && (
        <NegotiateModal
          event={selectedEvent}
          postponeResponse={postponeResponse}
          proposedDate={proposedDate}
          proposedTime={proposedTime}
          declineReason={declineReason}
          onClose={handleCloseNegotiate}
          onResponseChange={setPostponeResponse}
          onDateChange={setProposedDate}
          onTimeChange={setProposedTime}
          onReasonChange={setDeclineReason}
          onSubmit={handleSubmitNegotiate}
        />
      )}

      {showFeedbackModal && selectedEvent && (
        <FeedbackModal
          event={selectedEvent}
          ratings={ratings}
          workAgain={workAgain}
          additionalComments={additionalComments}
          onClose={handleCloseFeedback}
          onRatingClick={handleRatingClick}
          onWorkAgainChange={setWorkAgain}
          onCommentsChange={setAdditionalComments}
          onSubmit={handleSubmitFeedback}
        />
      )}

      {showSettlementModal && selectedEvent && (
        <SettlementModal
          event={selectedEvent}
          settlementAmount={settlementAmount}
          settlementReason={settlementReason}
          onClose={handleCloseSettlement}
          onAmountChange={setSettlementAmount}
          onReasonChange={setSettlementReason}
          onQuickSelect={handleQuickSelect}
          onSubmit={handleSubmitSettlement}
        />
      )}
    </div>
  );
}