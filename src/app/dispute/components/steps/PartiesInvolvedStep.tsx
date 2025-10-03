"use client";

import { useState, useEffect, useMemo } from "react";
import { DisputeFormData, PartyInvolved } from "../../types/disputeTypes";
import { Check } from "lucide-react";
import {
  useGetEventsQuery,
  useGetParticipantsByEventIdQuery,
} from "../../../../store/api/disputApi";

interface PartiesInvolvedStepProps {
  formData: DisputeFormData;
  onFormDataUpdate: (data: Partial<DisputeFormData>) => void;
}

interface SelectableParty extends PartyInvolved {
  selected?: boolean;
}

export default function PartiesInvolvedStep({
  formData,
  onFormDataUpdate,
}: PartiesInvolvedStepProps) {
  const [activeTab, setActiveTab] = useState<"Speakers" | "Participants">(
    "Participants"
  );
  const [speakers, setSpeakers] = useState<SelectableParty[]>([]);
  const [participants, setParticipants] = useState<SelectableParty[]>([]);

  const { data: eventsData } = useGetEventsQuery(undefined, {
    skip: !formData.eventId,
  });
  const { data: participantsData } = useGetParticipantsByEventIdQuery(
    formData.eventId!,
    {
      skip: !formData.eventId,
    }
  );
  console.log("PartiesInvolvedStep rendered", formData);
  // console.log("PartiesInvolvedStep rendered", formData);

  formData.partiesInvolved?.forEach((p) => {
    if (p?.userId) {
      console.log("party.userId:", p.userId);
    } else {
      console.warn("Missing userId for party:", p);
    }
  });

  // Fix lines 51-57 in PartiesInvolvedStep.tsx
  const selectedEvent = useMemo(() => {
    if (!eventsData || !formData.eventId) return null;
    return eventsData.data.events.find((e: any) => e._id === formData.eventId);
  }, [eventsData, formData.eventId]);


  // Populate speakers from selected event
  useEffect(() => {
    if (!selectedEvent) return;
    
    // Combine manual speakers and platform speakers
    const allSpeakers = [
      ...(selectedEvent.speakers?.manualSpeakers || []).map((s: any) => ({
        ...s,
        speakerType: 'manual',
        userId: s._id, // Use the _id from manual speaker as userId
        email: `${s.title} (Manual Speaker)` // Show title instead of email for manual speakers
      })),
      ...(selectedEvent.speakers?.platformSpeakers || []).map((s: any) => ({
        ...s,
        speakerType: 'platform',
        userId: s.speakerId, // Use speakerId from platform speaker
        name: s.speakerDetails?.fullName || `${s.speakerDetails?.firstName || ''} ${s.speakerDetails?.lastName || ''}`.trim(),
        email: `${s.speakerDetails?.professionalTitle || 'Speaker'} (Platform Speaker)` // Show title instead of email for platform speakers
      }))
    ];

    console.log("All speakers from event:", allSpeakers);

    const formatted: SelectableParty[] = allSpeakers.map((s: any) => ({
      name: s.name || "Unknown Speaker",
      email: s.email || `${s.title || 'Speaker'} (Event Speaker)`,
      userId: s.userId,
      role: "Speaker",
      selected:
        formData.partiesInvolved?.some(
          (f) => String(f.userId) === String(s.userId)
        ) || false,
    }));
    
    setSpeakers(formatted);
  }, [selectedEvent?._id, selectedEvent?.speakers?.manualSpeakers?.length, selectedEvent?.speakers?.platformSpeakers?.length]);

  // Populate participants from API
  useEffect(() => {
    if (!participantsData?.participants) return;
    const formatted: SelectableParty[] = participantsData.participants.map(
      (p: any) => ({
        name: p.name,
        email: p.email,
        phone: p.phone,
        userId: p.userId ?? "",
        role: "Participant",
        selected:
          formData.partiesInvolved?.some(
            (f) => String(f.userId) === String(p.userId ?? p._id)
          ) || false,
      })
    );
    setParticipants(formatted);
  }, [participantsData?.participants?.length]);

  // Separate useEffect to restore selections from formData without causing loops
  useEffect(() => {
    if (!formData.partiesInvolved?.length) return;
    
    const selectedUserIds = new Set(formData.partiesInvolved.map(p => String(p.userId)));
    
    setSpeakers(prev => prev.map(speaker => ({
      ...speaker,
      selected: selectedUserIds.has(String(speaker.userId))
    })));
    
    setParticipants(prev => prev.map(participant => ({
      ...participant,
      selected: selectedUserIds.has(String(participant.userId))
    })));
  }, [formData.partiesInvolved?.length]);

  console.log("Submitting parties:", formData.partiesInvolved);

  // Merge selected parties

  // Toggle selection
  const toggleSelection = (
    party: SelectableParty,
    type: "speakers" | "participants"
  ) => {
    if (type === "speakers") {
      setSpeakers((prev) =>
        prev.map((p) =>
          String(p.userId) === String(party.userId)
            ? { ...p, selected: !p.selected }
            : p
        )
      );
    } else {
      setParticipants((prev) =>
        prev.map((p) =>
          String(p.userId) === String(party.userId)
            ? { ...p, selected: !p.selected }
            : p
        )
      );
    }
  };

  useEffect(() => {
    console.log("speaker is 130", speakers);

    const allSelected: PartyInvolved[] = [
      ...speakers.filter((p) => p.selected),
      ...participants.filter((p) => p.selected),
    ].map(({ name, email, phone, userId, role }) => ({
      name,
      email,
      phone,
      userId,
      role,
    }));

    const respondentIds = allSelected
      .map((p) => (p.userId))
  
    onFormDataUpdate({
      partiesInvolved: allSelected,
      respondentId: respondentIds,
    });
  }, [speakers, participants, onFormDataUpdate]);

  const renderPartyList = () => {
    const list = activeTab === "Speakers" ? speakers : participants;
    const currentType: "speakers" | "participants" =
      activeTab === "Speakers" ? "speakers" : "participants";

    // Show empty state if no parties found
    if (list.length === 0) {
      const emptyMessage = activeTab === "Speakers" 
        ? "No speakers found for this event"
        : "No participants found associated to this event";
      
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      );
    }

    return list.map((party) => (
      <div
        key={(party.userId)}
        onClick={() => toggleSelection(party, currentType)}
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          party.selected
            ? "border-orange-400 bg-orange-50"
            : "border-gray-200 hover:border-orange-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{party.name}</h4>
            <p className="text-xs text-gray-500">{party.email}</p>
          </div>
          <div
            className={`w-5 h-5 flex items-center justify-center rounded border-2 transition-colors ${
              party.selected
                ? "border-orange-500 bg-orange-500"
                : "border-gray-300 bg-white"
            }`}
          >
            {party.selected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </div>
    ));
  };

  // Debug logging
  console.log("selectedEvent:", selectedEvent);
  console.log("speakers state:", speakers);
  console.log("participants state:", participants);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-orange-500 mb-2">
          Identify Parties Involved
        </h3>
        <p className="text-gray-600 mb-1">
          Select all Parties involved in this dispute
        </p>
        <p className="text-sm text-gray-500">
          Select individuals or entities that are part of this dispute
        </p>
        {selectedEvent && (
          <p className="text-xs text-gray-400 mt-2">
            Event: {selectedEvent.eventName} | 
            Manual Speakers: {selectedEvent.speakers?.manualSpeakers?.length || 0} | 
            Platform Speakers: {selectedEvent.speakers?.platformSpeakers?.length || 0}
          </p>
        )}
      </div>

      <div className="flex space-x-0 bg-gray-100 p-1 rounded-full">
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === "Speakers"
              ? "text-white bg-orange-500"
              : "text-gray-500 bg-transparent"
          }`}
          onClick={() => setActiveTab("Speakers")}
        >
          Speakers
        </button>
        <button
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            activeTab === "Participants"
              ? "text-white bg-orange-500"
              : "text-gray-500 bg-transparent"
          }`}
          onClick={() => setActiveTab("Participants")}
        >
          Participants
        </button>
      </div>

      <div className="space-y-3">{renderPartyList()}</div>
    </div>
  );
}