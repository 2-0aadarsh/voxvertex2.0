"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
  CreditCard,
  AlertTriangle,
  HelpCircle,
  Settings,
  Filter,
} from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import Logo from "./Logo";
import { useAuth } from "@/store/hooks";

interface NavbarProps {
  showSearch?: boolean;
  className?: string;
  user?: { firstName?: string; lastName?: string; whoAreYou?: string; profileImage?: unknown; profileImageUrl?: string; email?: string; role?: string };
  currentUserData?: { user?: { firstName?: string; lastName?: string; whoAreYou?: string; profileImage?: unknown; profileImageUrl?: string; email?: string; role?: string } };
  isAuthenticated?: boolean;
  activeTab?: string;
  onTabClick?: (tab: string) => void;
  forceHomepageStyle?: boolean;
  getProfileImageUrl?: (url: string | null | undefined) => string | null;
}

const Navbar: React.FC<NavbarProps> = ({
  showSearch = true,
  className = "",
  user,
  currentUserData,
  isAuthenticated = false,
  activeTab = "profile",
  onTabClick,
  forceHomepageStyle = false,
  getProfileImageUrl,
}) => {
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get logout function from useAuth hook
  const { logout } = useAuth();

  // Handle logout functionality (same as Sidebar)
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

  // Handle search functionality
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("🔍 Searching for:", searchQuery.trim());
      // Redirect to speakers page with search query
      router.push(`/speakers?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Helper function to get profile image URL
  const getProfileImage = (profileImage: unknown) => {
    console.log('🔍 Navbar Profile Image Debug:', {
      profileImage,
      type: typeof profileImage,
      hasData: (profileImage as unknown)?.data ? 'yes' : 'no',
      hasContentType: (profileImage as unknown)?.contentType ? 'yes' : 'no',
      hasUrl: (profileImage as unknown)?.url ? 'yes' : 'no',
      hasGetProfileImageUrl: !!getProfileImageUrl
    });
    
    if (!profileImage) return null;
    
    // If getProfileImageUrl function is provided, use it
    if (getProfileImageUrl) {
      const result = getProfileImageUrl(profileImage as string | null | undefined);
      console.log('✅ Using getProfileImageUrl function, result:', result);
      return result;
    }
    
    // Handle string URLs
    if (typeof profileImage === 'string') {
      if (profileImage.startsWith('http')) return profileImage;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`;
    }
    
    // Handle object with data and contentType (Buffer)
    if (typeof profileImage === 'object' && profileImage !== null && 'data' in profileImage && 'contentType' in profileImage) {
      const profileImageObj = profileImage as { data: { toString: (encoding: string) => string }; contentType: string };
      const dataUrl = `data:${profileImageObj.contentType};base64,${profileImageObj.data.toString('base64')}`;
      console.log('✅ Created data URL from Buffer');
      return dataUrl;
    }
    
    // Handle object with url property
    if (typeof profileImage === 'object' && profileImage !== null && 'url' in profileImage) {
      const profileImageObj = profileImage as { url: string };
      if (profileImageObj.url.startsWith('http')) return profileImageObj.url;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImageObj.url}`;
    }
    
    console.log('❌ No valid profile image format found');
    return null;
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    const firstName = user?.firstName || currentUserData?.user?.firstName;
    const lastName = user?.lastName || currentUserData?.user?.lastName;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    return "User";
  };

  // Helper function to get full name
  const getFullName = () => {
    const firstName = user?.firstName || currentUserData?.user?.firstName;
    const lastName = user?.lastName || currentUserData?.user?.lastName;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return "User";
  };

  const navigationItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "events", label: "Events", icon: FileText },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "dispute", label: "Dispute", icon: AlertTriangle },
    { id: "support", label: "Support", icon: HelpCircle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (user && !forceHomepageStyle) {
    // Speaker/Organizer sidebar navigation
    return (
      <div
        className={`bg-white shadow-lg h-screen fixed left-0 top-0 ${className}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Logo />
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabClick?.(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600 border-r-2 border-orange-500"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email || 'No email'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Public homepage navigation
  return (
    <header className={`bg-white h-20 flex items-center justify-center shadow-md border-b border-b-[#FF6B35] ${className}`}>
      <div className="w-full px-6 ">
        <div className="flex items-center h-20">
          
          <div className="flex lg:hidden ml-4">
            <button 
              onClick={() => setShowSidebar(true)}
              className="text-gray-900 hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 rounded-md p-1"
              aria-label="Open mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>

          <div className="flex-shrink-0">
            <Logo absolute={true} />
          </div>

          {/* Search Bar - Right after logo */}
          {showSearch && (
            <div className="flex-1 max-w-xl ml-24">
              <form onSubmit={handleSearchSubmit} className="relative hidden md:flex items-center">
                <Search className="absolute left-3 top-0 bottom-0 m-auto text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Speaker"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-2.5 border border-[#FF6B35]/70 rounded-full focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] focus:outline-none focus:ring-offset-0 text-sm bg-white"
                  style={{
                    boxShadow: 'none',
                  }}
                  onFocus={(e) => {
                    e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 53, 0.5)';
                    e.target.style.borderColor = '#FF6B35';
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = 'none';
                    e.target.style.borderColor = 'rgba(255, 107, 53, 0.7)';
                  }}
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-0 bottom-0 m-auto hover:opacity-70 transition-opacity"
                >
                  <img 
                    src="/vector1.png" 
                    alt="Search" 
                    className="w-4 h-4"
                  />
                </button>
              </form>
            </div>
          )}


<div
  className={`fixed inset-0 z-50 bg-black/50 bg-opacity-50 transition-opacity duration-300 ${showSidebar ? "opacity-100 visible" : "opacity-0 invisible"}`}
  onClick={() => setShowSidebar(false)}
></div>

<div
  className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300
    ${showSidebar ? "translate-x-0" : "-translate-x-full"} lg:hidden`}
>
  {/* Logo */}
  <div className="p-6 border-b border-gray-200">
    <Logo />
  </div>

  {/* Navigation */}
  <nav className="mt-6">
    {navigationItems.map((item) => {
      const Icon = item.icon;
      const isActive = activeTab === item.id;
      return (
        <button
          key={item.id}
          onClick={() => {
            onTabClick?.(item.id);
            setShowSidebar(false); // close drawer on click
          }}
          className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
            isActive
              ? "bg-orange-50 text-orange-600 border-r-2 border-orange-500"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{item.label}</span>
        </button>
      );
    })}
  </nav>
</div>



          {/* Navigation - Right aligned */}
          <nav className="flex items-center space-x-8 ml-auto">
            <button 
              onClick={() => router.push('/about')}
              className="hidden md:flex text-gray-900 hover:text-[#FF6B35] font-medium text-sm transition-colors duration-200 hover:scale-105"
            >
              About
            </button>
            <button 
              onClick={() => router.push('/speakers')}
              className="hidden md:flex text-gray-900 hover:text-[#FF6B35] font-medium text-sm transition-colors duration-200 hover:scale-105"
            >
              Speaker
            </button>
            <button 
              onClick={() => router.push('/events_dashboard')}
              className="hidden md:flex text-gray-900 hover:text-[#FF6B35] font-medium text-sm transition-colors duration-200 hover:scale-105"
            >
              Events
            </button>
            
            {/* Conditional rendering based on authentication */}
            {isAuthenticated && (user || currentUserData?.user) ? (
              <div className="relative">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-40 h-10 cursor-pointer flex items-center justify-between"
                >
                  {(() => {
                    const profileImageUrl = getProfileImage(user?.profileImageUrl || currentUserData?.user?.profileImageUrl || user?.profileImage || currentUserData?.user?.profileImage);
                    return (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt="profile"
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              e.currentTarget.style.display = "none";
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm"
                          style={{
                            display: profileImageUrl ? "none" : "flex",
                          }}
                        >
                          {getUserInitials()}
                        </div>
                      </div>
                    );
                  })()}
                  <h2 className="text-sm font-medium">
                    {getFullName()}
                  </h2>
                  <IoIosArrowDown className="cursor-pointer w-4 h-4" />
                </button>


                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={() => {
                        // Get user role from user object or currentUserData
                        const userRole = user?.role || currentUserData?.user?.role;
                        
                        console.log("🔍 Navbar Dashboard Debug:", {
                          user,
                          currentUserData,
                          userRole,
                          userRoleFromUser: user?.role,
                          userRoleFromCurrentUser: currentUserData?.user?.role
                        });
                        
                        // Use same logic as login page
                        switch (userRole) {
                          case 'speaker':
                            router.push('/speakerUser');
                            break;
                          case 'organizer':
                            router.push('/newuser');
                            break;
                          case 'participant':
                            router.push('/participant');
                            break;
                          default:
                            router.push('/newuser'); // fallback
                        }
                        setShowProfileDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </button>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => window.location.href = '/signup/login'}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
