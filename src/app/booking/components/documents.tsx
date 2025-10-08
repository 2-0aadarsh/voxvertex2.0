//app/booking/components/documents.tsx
"use client";

import React from "react";
import DocumentsMain from "./parts/documentsMain";
import { useUserRole } from "@/utils/roleUtils";

export default function DocumentsPage({
  onTabChange,
}: {
  onTabChange?: (tab: string) => void;
}) {
  const userRole = useUserRole();
  const isOrganizer = userRole === "organizer";
  const isSpeaker = userRole === "speaker";

  return (
    <div className="min-h-screen bg-white">
      <div className="ml-64 pt-20">
        {/* Orange Header Card */}
        <div className="p-6">
          <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md mb-6">
            <h1 className="text-2xl font-bold text-black mb-2">
              {isOrganizer ? "Speaker Management" : "Booking Management"}
            </h1>
            <p className="text-white">
              {isOrganizer
                ? "Manage your speaker contracts, documents, and payments in one place"
                : "Manage your speaking opportunities, documents, and organizer proposals"}
            </p>
          </div>

          {/* Navigation Tabs - Role-based */}
          {isOrganizer && (
            <div className="bg-gray-50 p-1 rounded-lg mb-6 flex">
              <button
                onClick={() => onTabChange?.("Speaker Database")}
                className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
              >
                Speaker Database
              </button>
              <button
                onClick={() => onTabChange?.("Speaker Management")}
                className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
              >
                Speaker Management
              </button>
              <button className="flex-1 text-white bg-[#FF6B35] py-3 px-4 rounded-md font-medium">
                Documents
              </button>
            </div>
          )}

          {isSpeaker && (
            <div className="bg-gray-50 p-1 rounded-lg mb-6 flex">
              <button
                onClick={() => onTabChange?.("Booking Management")}
                className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
              >
                Booking Management
              </button>
              <button className="flex-1 text-white bg-[#FF6B35] py-3 px-4 rounded-md font-medium">
                Documents
              </button>
            </div>
          )}

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 p-6 min-h-[calc(100vh-280px)]">
            <DocumentsMain />
          </div>
        </div>
      </div>
    </div>
  );
}
