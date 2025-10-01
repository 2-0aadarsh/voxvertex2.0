"use client";

import { useState, useEffect, useMemo } from "react";
import { DisputeFormData, PartyInvolved } from "../../types/disputeTypes";
import { Check } from "lucide-react";
import {
  useGetEventsQuery,
  useGetParticipantsByEventIdQuery,
} from "../../../../store/api/disputApi";
import { p } from "framer-motion/client";

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

  const selectedEvent = useMemo(() => {
    if (!eventsData || !formData.eventId) return null;
    return (
      eventsData.data.upcoming.find((e: any) => e._id === formData.eventId) ||
      eventsData.data.past.find((e: any) => e._id === formData.eventId)
    );
  }, [eventsData, formData.eventId]);

  // Restore selections from formData
  const restoreSelections = (list: SelectableParty[]) =>
    list.map((p) => ({
      ...p,
      selected: !!formData.partiesInvolved?.some(
        (f) => (f.userId) === (p.userId)
      ),
    }));

  // Populate speakers from selected event
  useEffect(() => {
    console.log("selectedEvent.speakers:", selectedEvent.speakers);

    if (!selectedEvent) return;
    const formatted: SelectableParty[] = selectedEvent.speakers.map(
      (s: any) => ({
        name: s.name || "Unknown",
        email: s.email || "no-email@example.com",
        userId: (s.userId),
        role: "Speaker",
        selected:
          formData.partiesInvolved?.some(
            (f) => (f.userId) === (s.userId)
          ) || false,
      })
    );
    setSpeakers((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(formatted)) {
        return formatted;
      }
      return prev;
    });
  }, [selectedEvent.speakers, formData.partiesInvolved]);

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
            (f) => f.userId === (p.userId ?? p._id)
          ) || false,
      })
    );
    setParticipants(
      formatted.map((p) => ({
        ...p,
        selected:
          formData.partiesInvolved?.some(
            (f) => f.userId && f.userId === p.userId
          ) || false,
      }))
    );
  }, [participantsData]);
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
          (p.userId) === (party.userId)
            ? { ...p, selected: !p.selected }
            : p
        )
      );
    } else {
      setParticipants((prev) =>
        prev.map((p) =>
          (p.userId) === (party.userId)
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