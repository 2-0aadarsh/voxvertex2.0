"use client";

import React, { useState, Suspense } from "react";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/slices/authSlice";
import dynamic from "next/dynamic";
import SpeakerManagementPage from "./components/management";
import SpeakerDatabasePage from "./components/database";
import DocumentsPage from "./components/documents";
import SpeakerBookingManagement from "./components/SpeakerBookingManagement";
import Sidebar from "@/components/Sidebar";
import { useUserRole } from "@/utils/roleUtils";

// Dynamic import for Navbar (same as Privacy Policy)
const Navbar = dynamic(() => import("@/components/Navbar"), {
  loading: () => (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
    </div>
  ),
  ssr: false,
});

export default function BookingPage() {
  const userRole = useUserRole();
  const isOrganizer = userRole === "organizer";
  const isSpeaker = userRole === "speaker";

  // Set default tab based on role
  const [activeTab, setActiveTab] = useState(
    isOrganizer ? "Speaker Management" : "Booking Management"
  );

  // Authentication hooks (same as Privacy Policy)
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Helper function to get profile image URL (same as Privacy Policy)
  const getProfileImageUrl = (profileImage: unknown) => {
    if (!profileImage) return null;

    // Handle string URLs
    if (typeof profileImage === "string") {
      if (profileImage.startsWith("http")) return profileImage;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`;
    }

    // Handle object with data and contentType (Buffer)
    if (
      typeof profileImage === "object" &&
      profileImage !== null &&
      "data" in profileImage &&
      "contentType" in profileImage
    ) {
      const profileImageObj = profileImage as {
        data: { toString: (encoding: string) => string };
        contentType: string;
      };
      const dataUrl = `data:${
        profileImageObj.contentType
      };base64,${profileImageObj.data.toString("base64")}`;
      return dataUrl;
    }

    // Handle object with url property
    if (
      typeof profileImage === "object" &&
      profileImage !== null &&
      "url" in profileImage
    ) {
      const profileImageObj = profileImage as { url: string };
      if (profileImageObj.url.startsWith("http")) return profileImageObj.url;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImageObj.url}`;
    }

    return null;
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const renderContent = () => {
    // Organizer view
    if (isOrganizer) {
      switch (activeTab) {
        case "Speaker Database":
          return (
            <div className="min-h-screen bg-white">
              <Suspense
                fallback={
                  <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                }
              >
                <Navbar
                  user={user || undefined}
                  currentUserData={currentUserData}
                  isAuthenticated={isAuthenticated}
                  forceHomepageStyle={true}
                  getProfileImageUrl={getProfileImageUrl}
                />
              </Suspense>
              <Sidebar />
              <div className="ml-64 pt-20">
                <div className="p-6">
                  <div className="bg-[#FF6B35]/50 px-6 py-4 rounded-md mb-6">
                    <h1 className="text-2xl font-bold text-black mb-2">
                      Speaker Management
                    </h1>
                    <p className="text-white">
                      Browse and discover speakers from our database
                    </p>
                  </div>
                  <div className="bg-gray-50 p-1 rounded-lg mb-6 flex">
                    <button
                      onClick={() => handleTabClick("Speaker Database")}
                      className="flex-1 text-white bg-[#FF6B35] py-3 px-4 rounded-md font-medium"
                    >
                      Speaker Database
                    </button>
                    <button
                      onClick={() => handleTabClick("Speaker Management")}
                      className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md font-medium"
                    >
                      Speaker Management
                    </button>
                    <button
                      onClick={() => handleTabClick("Documents")}
                      className="flex-1 text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] py-3 px-4 rounded-md text-center font-medium"
                    >
                      Documents
                    </button>
                  </div>
                  <SpeakerDatabasePage />
                </div>
              </div>
            </div>
          );
        case "Speaker Management":
          return (
            <div className="min-h-screen bg-white">
              <Suspense
                fallback={
                  <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                }
              >
                <Navbar
                  user={user || undefined}
                  currentUserData={currentUserData}
                  isAuthenticated={isAuthenticated}
                  forceHomepageStyle={true}
                  getProfileImageUrl={getProfileImageUrl}
                />
              </Suspense>
              <Sidebar />
              <SpeakerManagementPage
                onTabChange={handleTabClick}
                activeTab={activeTab}
              />
            </div>
          );
        case "Documents":
          return (
            <div className="min-h-screen bg-white">
              <Suspense
                fallback={
                  <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                }
              >
                <Navbar
                  user={user || undefined}
                  currentUserData={currentUserData}
                  isAuthenticated={isAuthenticated}
                  forceHomepageStyle={true}
                  getProfileImageUrl={getProfileImageUrl}
                />
              </Suspense>
              <Sidebar />
              <DocumentsPage onTabChange={handleTabClick} />
            </div>
          );
        default:
          return (
            <div className="min-h-screen bg-white">
              <Suspense
                fallback={
                  <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                }
              >
                <Navbar
                  user={user || undefined}
                  currentUserData={currentUserData}
                  isAuthenticated={isAuthenticated}
                  forceHomepageStyle={true}
                  getProfileImageUrl={getProfileImageUrl}
                />
              </Suspense>
              <Sidebar />
              <SpeakerManagementPage
                onTabChange={handleTabClick}
                activeTab={activeTab}
              />
            </div>
          );
      }
    }

    // Speaker view
    if (isSpeaker) {
      switch (activeTab) {
        case "Booking Management":
          return (
            <div className="min-h-screen bg-white">
              <Suspense
                fallback={
                  <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                }
              >
                <Navbar
                  user={user || undefined}
                  currentUserData={currentUserData}
                  isAuthenticated={isAuthenticated}
                  forceHomepageStyle={true}
                  getProfileImageUrl={getProfileImageUrl}
                />
              </Suspense>
              <Sidebar />
              <SpeakerBookingManagement
                onTabChange={handleTabClick}
                activeTab={activeTab}
              />
            </div>
          );
        case "Documents":
          return (
            <div className="min-h-screen bg-white">
              <Suspense
                fallback={
                  <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                }
              >
                <Navbar
                  user={user || undefined}
                  currentUserData={currentUserData}
                  isAuthenticated={isAuthenticated}
                  forceHomepageStyle={true}
                  getProfileImageUrl={getProfileImageUrl}
                />
              </Suspense>
              <Sidebar />
              <DocumentsPage onTabChange={handleTabClick} />
            </div>
          );
        default:
          return (
            <div className="min-h-screen bg-white">
              <Suspense
                fallback={
                  <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                }
              >
                <Navbar
                  user={user || undefined}
                  currentUserData={currentUserData}
                  isAuthenticated={isAuthenticated}
                  forceHomepageStyle={true}
                  getProfileImageUrl={getProfileImageUrl}
                />
              </Suspense>
              <Sidebar />
              <SpeakerBookingManagement
                onTabChange={handleTabClick}
                activeTab={activeTab}
              />
            </div>
          );
      }
    }

    // Default fallback for other roles
    return (
      <div className="min-h-screen bg-white">
        <Suspense
          fallback={
            <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            </div>
          }
        >
          <Navbar
            user={user || undefined}
            currentUserData={currentUserData}
            isAuthenticated={isAuthenticated}
            forceHomepageStyle={true}
            getProfileImageUrl={getProfileImageUrl}
          />
        </Suspense>
        <Sidebar />
        <div className="ml-64 pt-20">
          <div className="p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Access Denied
              </h1>
              <p className="text-gray-600">
                This page is only accessible to organizers and speakers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return renderContent();
}
