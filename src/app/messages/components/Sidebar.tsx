//app\messages\components\Sidebar.tsx
"use client";

import { CiSettings, CiUser } from "react-icons/ci";
import { IoCalendarOutline } from "react-icons/io5";
import { LuMessageCircleMore } from "react-icons/lu";
import { MdLogout, MdOutlineDashboard } from "react-icons/md";
import { CalendarDays } from "lucide-react";
import { VscCreditCard } from "react-icons/vsc";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { BiSupport } from "react-icons/bi";
import { useRouter } from "next/navigation";

interface SidebarProps {
  currentUser: {
    name: string;
    email: string;
  };
}

export function Sidebar({ currentUser }: SidebarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out user...");
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  const navigationItems = [
    {
      icon: <CiUser />,
      label: "Profile",
      href: "/",
      active: false,
    },
    {
      icon: <MdOutlineDashboard />,
      label: "Dashboard",
      href: "/dashboard",
      active: false,
    },
    {
      icon: <LuMessageCircleMore />,
      label: "Messages",
      href: "/messages",
      active: true,
    },
    {
      icon: <IoCalendarOutline />,
      label: "Bookings",
      href: "/speakers",
      active: false,
    },
    {
      icon: <CalendarDays />,
      label: "Events",
      href: "/events",
      active: false,
    },
    {
      icon: <VscCreditCard />,
      label: "Payments",
      href: "/payments",
      active: false,
    },
    {
      icon: <FaMoneyBillTrendUp />,
      label: "Dispute",
      href: "/dispute",
      active: false,
    },
  ];

  const bottomItems = [
    {
      icon: <BiSupport />,
      label: "Support",
      href: "/support",
    },
    {
      icon: <CiSettings />,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <div className="fixed left-0 flex flex-col w-[20%] shadow-md h-[100vh] bg-white">

      <div className="flex flex-col gap-5 p-10">
        {navigationItems.map((item, index) => (
          <div
            key={index}
            className={`cursor-pointer px-7 flex items-center justify-start text-[16px] font-semibold gap-2 w-[199px] rounded-[10px] ${
              item.active && `text-[#FF6B35] bg-[#FFE2D7] `
            }`}
          >
            {item.icon}
            <a href={item.href}>{item.label}</a>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-15">
        <div className="flex flex-col px-10">
          {bottomItems.map((item, index) => (
            <div
              key={index}
              className={` cursor-pointer px-7 flex items-center justify-start text-[16px] font-semibold gap-2 w-[199px] h-[30px] rounded-[10px] `}
            >
              {item.icon}
              <a href={item.href}>{item.label}</a>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-[#000000]/19 p-5 flex items-center justify-between ">
          <div className=" profileImg w-[46px] h-[46px] overflow-hidden cursor-pointer flex items-center justify-center rounded-full bg-gray-200">
            <div
              className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg"
            >
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
          </div>

          <div className=" profileDetails flex flex-col items-start justify-center ">
            <h2 className="text-lg font-bold leading-[150.7%] tracking-[8%] cursor-pointer ">
              {currentUser.name}
            </h2>
            <p className="text-[13px] text-[#6B7280] leading-[150.7%] tracking-[8%]">
              {currentUser.email}
            </p>
          </div>

          <div className="logout">
            <MdLogout
              className="text-[#DC2626] text-[33px] cursor-pointer hover:text-red-700 transition-colors"
              onClick={handleLogout}
              title="Logout"
            />
          </div>
        </div>
      </div>
    </div>
  );
}