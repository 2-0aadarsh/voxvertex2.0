"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic imports
const ProfileHeader = dynamic(
  () => import("./components/header/ProfileHeader"),
  {
    loading: () => (
      <div className="h-32 bg-white border-b border-gray-200 animate-pulse"></div>
    ),
    ssr: false,
  }
);

const Sidebar = dynamic(() => import("./components/sidebar/Sidebar"), {
  loading: () => <div className="w-64 bg-gray-100"></div>,
  ssr: false,
});

const AboutUser = dynamic(
  () => import("./components/sections/aboutUser/AboutUser"),
  { loading: () => <div className="bg-white p-6 animate-pulse h-64"></div>, ssr: false }
);

const Post = dynamic(
  () => import("./components/sections/posts/Posts"),
  { loading: () => <div className="bg-white p-6 animate-pulse h-64"></div>, ssr: false }
);

const WorkExperience = dynamic(
  () => import("./components/sections/workExperience/WorkExperience"),
  { loading: () => <div className="bg-white p-6 animate-pulse h-64"></div>, ssr: false }
);

const Education = dynamic(
  () => import("./components/sections/education/Education"),
  { loading: () => <div className="bg-white p-6 animate-pulse h-64"></div>, ssr: false }
);

const AwardsAndCertifications = dynamic(
  () => import("./components/sections/awardsAndCertifications/AwardsAndCertifications"),
  { loading: () => <div className="bg-white p-6 animate-pulse h-64"></div>, ssr: false }
);

const FeaturedVideos = dynamic(
  () => import("./components/sections/featuredVideos/FeaturedVideos"),
  { loading: () => <div className="bg-white p-6 animate-pulse h-64"></div>, ssr: false }
);

const FeedbackReviews = dynamic(
  () => import("@/components/feedbackReviews/FeedbackReviews"),
  { loading: () => <div className="bg-white p-6 animate-pulse h-64"></div>, ssr: false }
);

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function NewUserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Scroll to top on page load
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

      <Suspense
        fallback={
          <div className="h-32 bg-white border-b border-gray-200 animate-pulse"></div>
        }
      >
        <ProfileHeader />
      </Suspense>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar (Fixed) */}
        <Suspense fallback={<div className="w-64 bg-white"></div>}>
          <Sidebar />
        </Suspense>

        {/* Main Content */}
        <div className="flex-1 bg-[#fffbf5] lg:ml-64">
          <main className="flex flex-col items-center justify-between gap-5 py-5 px-4 lg:px-0">
            <Suspense fallback={<div className="bg-white p-6 animate-pulse h-64"></div>}>
              <AboutUser />
            </Suspense>

            <Suspense fallback={<div className="bg-white p-6 animate-pulse h-64"></div>}>
              <Post />
            </Suspense>

            <Suspense fallback={<div className="bg-white p-6 animate-pulse h-64"></div>}>
              <WorkExperience />
            </Suspense>

            <Suspense fallback={<div className="bg-white p-6 animate-pulse h-64"></div>}>
              <Education />
            </Suspense>

            <Suspense fallback={<div className="bg-white p-6 animate-pulse h-64"></div>}>
              <AwardsAndCertifications />
            </Suspense>

            <Suspense fallback={<div className="bg-white p-6 animate-pulse h-64"></div>}>
              <FeaturedVideos />
            </Suspense>

            <Suspense fallback={<div className="bg-white p-6 animate-pulse h-64"></div>}>
              <FeedbackReviews />
            </Suspense>
          </main>
        </div>
      </div>

      {children}
    </div>
  );
}