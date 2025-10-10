"use client";

import React from 'react';
import { 
  User, 
  BarChart3, 
  MessageCircle, 
  Calendar, 
  CalendarDays, 
  CreditCard, 
  TrendingUp, 
  HelpCircle, 
  Settings,
  LogOut
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/slices/authSlice";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data: currentUserData, isLoading: isUserLoading } =
    useGetCurrentUserQuery();

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out user...");

      // Call logout from Redux store (this will clear tokens and cookies and redirect)
      await logout();

      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  // Debug: Log user data to understand the structure
  console.log("🔍 Sidebar Debug - User data:", {
    user: user,
    currentUserData: currentUserData,
    userFirstName: user?.firstName,
    userLastName: user?.lastName,
    userProfileImageUrl: user?.profileImageUrl,
    currentUserFirstName: currentUserData?.user?.firstName,
    currentUserLastName: currentUserData?.user?.lastName,
    currentUserProfileImageUrl: currentUserData?.user?.profileImageUrl,
  });

  // Get user details from Redux store or current user data
  const userDetails = {
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : currentUserData?.user?.firstName && currentUserData?.user?.lastName
        ? `${currentUserData.user.firstName} ${currentUserData.user.lastName}`
        : "User",
    email: user?.email || currentUserData?.user?.email || "user@example.com",
  };

  const navigationItems: MenuItem[] = [
    {
      icon: User,
      label: "Profile",
      href: "/",
      active: true,
    },
    {
      icon: BarChart3,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: MessageCircle,
      label: "Messages",
      href: "/messages",
    },
    {
      icon: Calendar,
      label: "Bookings",
      href: "/bookings",
    },
    {
      icon: CalendarDays,
      label: "Events",
      href: "/events",
    },
    {
      icon: CreditCard,
      label: "Payments",
      href: "/payments",
    },
    {
      icon: TrendingUp,
      label: "Dispute",
      href: "/dispute",
    },
  ];

  const bottomItems: MenuItem[] = [
    {
      icon: HelpCircle,
      label: "Support",
      href: "/support",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="fixed left-0 top-14 w-64 bg-white border-r border-gray-200 z-40" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="p-6 h-full flex flex-col">
        {/* Main Menu */}
        <div className="space-y-1 flex-1">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                onClick={() => handleNavigation(item.href)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  item.active
                    ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <IconComponent size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Menu - positioned just above profile */}
        <div className="space-y-2 mb-6">
          {bottomItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                onClick={() => handleNavigation(item.href)}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <IconComponent size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* User Profile with Logout */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 overflow-hidden cursor-pointer flex items-center justify-center rounded-full bg-gray-200 flex-shrink-0">
              {user?.profileImageUrl || currentUserData?.user?.profileImageUrl ? (
                <img
                  src={
                    user?.profileImageUrl ||
                    currentUserData?.user?.profileImageUrl
                  }
                  alt="profile"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = "none";
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm"
                style={{
                  display:
                    user?.profileImageUrl ||
                    currentUserData?.user?.profileImageUrl
                      ? "none"
                      : "flex",
                }}
              >
                {userDetails.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{userDetails.name}</p>
              <p className="text-xs text-gray-500 truncate">{userDetails.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex-shrink-0 ml-2"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}