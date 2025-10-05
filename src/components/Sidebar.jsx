"use client";

import { CiSettings, CiUser } from "react-icons/ci";
import { IoCalendarOutline } from "react-icons/io5";
import { LuMessageCircleMore } from "react-icons/lu";
import { MdLogout, MdOutlineDashboard } from "react-icons/md";
import { CalendarDays } from "lucide-react";
import { VscCreditCard } from "react-icons/vsc";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { BiSupport } from "react-icons/bi";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/hooks";
import { useGetCurrentUserQuery } from "@/store/slices/authSlice";
import { useState, useEffect } from "react";

const Sidebar = ({ userRole = "newuser" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: currentUserData, isLoading: isUserLoading } =
    useGetCurrentUserQuery();

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out user...");

      // Call logout from Redux store (this will clear tokens and cookies)
      await logout();

      console.log("✅ Logout successful, redirecting to homepage...");

      // Redirect to homepage for all user roles
      router.push("/");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Even if logout fails, redirect to homepage
      router.push("/");
    }
  };

  // Debug: Log user data to understand the structure
  // console.log(`🔍 ${userRole} Sidebar Debug - User data:`, {
  //   user: user,
  //   currentUserData: currentUserData,
  //   userFirstName: user?.firstName,
  //   userLastName: user?.lastName,
  //   userProfileImageUrl: user?.profileImageUrl,
  //   currentUserFirstName: currentUserData?.user?.firstName,
  //   currentUserLastName: currentUserData?.user?.lastName,
  //   currentUserProfileImageUrl: currentUserData?.user?.profileImageUrl,
  // });

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

  // Helper function to get user role
  const getUserRole = () => {
    // Try multiple possible paths to find the role
    const role =
      user?.role ||
      currentUserData?.user?.role ||
      currentUserData?.role ||
      userRole;

    console.log("user role log from sidebar:", {
      userRole: user?.role,
      currentUserDataUserRole: currentUserData?.user?.role,
      currentUserDataRole: currentUserData?.role,
      userRoleProp: userRole,
      finalRole: role,
    });

    return role;
  };

  // Helper function to get events redirect based on user role
  const getEventsRedirect = () => {
    const role = getUserRole();
    let redirectPath;

    switch (role) {
      case "organizer":
        redirectPath = "/events_page";
        break;
      case "participant":
        redirectPath = "/participant/events";
        break;
      default:
        redirectPath = "/events_page"; // Default fallback
    }

    console.log(" second log from sidebar page", {
      detectedRole: role,
      redirectPath: redirectPath,
    });

    return redirectPath;
  };

  // Helper function to get profile redirect based on user role
  const getProfileRedirect = () => {
    const role = user?.role || currentUserData?.user?.role;
    switch (role) {
      case "organizer":
        return "/newuser";
      case "speaker":
        return "/speakerUser";
      case "participant":
        return "/participant";
      default:
        return "/newuser"; // Default fallback
    }
  };

  // Get current pathname to determine active item
  const currentPath = pathname || "/";

  // Role-based navigation items
  const baseNavigationItems = [
    {
      icon: <CiUser />,
      label: "Dashboard",
      href: getProfileRedirect(),
      active:
        currentPath === getProfileRedirect() ||
        currentPath === "/newuser" ||
        currentPath === "/speakerUser" ||
        currentPath === "/participant",
    },
    {
      icon: <LuMessageCircleMore />,
      label: "Messages",
      href: "/messages",
      active: currentPath === "/messages",
    },
    {
      icon: <CalendarDays />,
      label: "Events",
      href: getEventsRedirect(),
      active:
        currentPath === "/events_page" ||
        currentPath === "/participant/events" ||
        currentPath.startsWith("/events"),
    },
    {
      icon: <VscCreditCard />,
      label: "Payments",
      href: "/payments",
      active: currentPath === "/payments",
    },
    {
      icon: <FaMoneyBillTrendUp />,
      label: "Dispute",
      href: "/dispute",
      active: currentPath === "/dispute" || currentPath.startsWith("/dispute"),
    },
  ];

  // Add Bookings only for organizers and speakers (not participants)
  const navigationItems =
    getUserRole() === "participant"
      ? baseNavigationItems
      : [
          ...baseNavigationItems.slice(0, 2), // Dashboard and Messages
          {
            icon: <IoCalendarOutline />,
            label: "Bookings",
            href: "/booking",
            active:
              currentPath === "/booking" || currentPath.startsWith("/booking"),
          },
          ...baseNavigationItems.slice(2), // Events, Payments, Dispute
        ];

  const bottomItems = [
    {
      icon: <BiSupport />,
      label: "Support",
      href: "/support",
      active: currentPath === "/support",
    },
    {
      icon: <CiSettings />,
      label: "Settings",
      href: "/settings",
      active: currentPath === "/settings",
    },
  ];

  return (
    <div
      className="fixed left-0 top-20 w-64 bg-white border-r border-gray-200 z-40"
      style={{ height: "calc(100vh - 80px)" }}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Main Menu */}
        <div className="space-y-1 flex-1">
          {navigationItems.map((item, index) => (
            <div
              key={index}
              onClick={() => router.push(item.href)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                item.active
                  ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom Menu - positioned just above profile */}
        <div className="space-y-2 mb-6">
          {bottomItems.map((item, index) => (
            <div
              key={index}
              onClick={() => router.push(item.href)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                item.active
                  ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* User Profile with Logout */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 overflow-hidden cursor-pointer flex items-center justify-center rounded-full bg-gray-200 flex-shrink-0">
              {user?.profileImageUrl ||
              currentUserData?.user?.profileImageUrl ? (
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
                      e.currentTarget.nextElementSibling.style.display = "flex";
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
              <p className="text-sm font-medium text-gray-900 truncate">
                {userDetails.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userDetails.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors flex-shrink-0 ml-2"
            title="Logout"
          >
            <MdLogout size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
