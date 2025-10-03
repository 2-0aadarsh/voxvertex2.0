'use client';
import { useGetEventsQuery } from '../../../../store/api/disputApi';
import { DisputeFormData } from '../../types/disputeTypes';

interface EventSelectionStepProps {
  formData: DisputeFormData;
  onFormDataUpdate: (data: Partial<DisputeFormData>) => void;
}

export default function EventSelectionStep({ formData, onFormDataUpdate }: EventSelectionStepProps) {
  // Use RTK Query hook
  const { data: eventsData, isLoading, isError } = useGetEventsQuery();
  console.log("events from eventslection page is", eventsData);
  

  // Transform events data if needed
  // const events = eventsData
  //   ? [...(eventsData?.data?.upcoming || []), ...(eventsData?.data?.past || [])]
  //   : [];
  const events = eventsData?.data?.events || [];

  const handleSelectEvent = (event: any) => {
    onFormDataUpdate({
      eventName: event.eventName,
      eventId: event._id,
      eventDate: event.startDate,
    });
  };

  if (isLoading) return <p>Loading events...</p>;
  if (isError) return <p className="text-red-500">Error fetching events.</p>;
  if (events.length === 0) return <p>No events available.</p>;

  return (
    <div className="space-y-6">
      {events.map((event: any) => (
        <div
          key={event._id}
          onClick={() => handleSelectEvent(event)}
          className={`p-4 border rounded-lg cursor-pointer ${
            formData.eventId === event._id
              ? 'border-orange-400 bg-orange-50'
              : 'border-gray-200 hover:border-orange-300'
          }`}
        >
          <h4 className="font-medium text-gray-900">{event.eventName}</h4>
          <p className="text-sm text-gray-500">
            {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date not available'}
          </p>
        </div>
      ))}
    </div>
  );
}