//     { icon: <CiUser />, label: "Profile", href: "/", active: true },
//     { icon: <MdOutlineDashboard />, label: "Dashboard", href: "/dashboard" },
//     { icon: <LuMessageCircleMore />, label: "Messages", href: "/messages" },
//     { icon: <IoCalendarOutline />, label: "Bookings", href: "/bookings" },
//     { icon: <CalendarDays />, label: "Events", href: "/events" },
//     { icon: <VscCreditCard />, label: "Payments", href: "/payments" },
//     { icon: <FaMoneyBillTrendUp />, label: "Dispute", href: "/dispute" },
//   ];

//   const bottomItems = [
//     { icon: <BiSupport />, label: "Support", href: "/support" },
//     { icon: <CiSettings />, label: "Settings", href: "/settings" },
//   ];

//   return (
//     <>
//       {/* Hamburger (Mobile Only) */}
//       {!isDesktop && (
//         <button
//           className="p-2 fixed top-4 left-4 rounded z-50 bg-white shadow"
//           onClick={() => setIsSidebarOpen(true)}
//         >
//           ☰
//         </button>
//       )}

//       {/* Overlay (Mobile Only) */}
//       {!isDesktop && isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 z-30"
//           onClick={() => setIsSidebarOpen(false)}
//         ></div>
//       )}

//       <div
//         className={`
//           fixed left-0 top-16 h-[calc(100vh-4rem)] flex flex-col shadow-md bg-white z-40
//           transition-transform duration-300
//           ${isDesktop ? "translate-x-0" : isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
//           lg:w-[20%] md:w-[30%] sm:w-[50%] w-[30%]
//           overflow-x-hidden
//         `}
//       >
//         {!isDesktop && (
//           <button
//             className="absolute top-4 right-4 text-xl"
//             onClick={() => setIsSidebarOpen(false)}
//           >
//             ✕
//           </button>
//         )}

//         {/* Scrollable Menu */}
//         <div className="flex flex-col gap-2 p-6 sm:p-8 lg:p-10 overflow-y-auto">
//           {navigationItems.map((item, index) => (
//             <div
//               key={index}
//               className={`cursor-pointer flex items-center gap-2 rounded-md px-3 py-2 text-sm sm:text-base font-medium
//               ${item.active ? "text-[#FF6B35] bg-[#FFE2D7]" : "hover:bg-gray-100"}`}
//               onClick={() => {
//                 router.push(item.href);
//                 if (!isDesktop) setIsSidebarOpen(false);
//               }}
//             >
//               {item.icon}
//               <span>{item.label}</span>
//             </div>
//           ))}
//         </div>

//         {/* Bottom Items */}
//         <div className="flex flex-col gap-2 mt-auto px-6 sm:px-8 lg:px-10">
//           {bottomItems.map((item, index) => (
//             <div
//               key={index}
//               className="cursor-pointer flex items-center gap-2 rounded-md px-3 py-2 w-full text-sm sm:text-base hover:bg-gray-100"
//               onClick={() => {
//                 router.push(item.href);
//                 if (!isDesktop) setIsSidebarOpen(false);
//               }}
//             >
//               {item.icon}
//               <span>{item.label}</span>
//             </div>
//           ))}
//         </div>

//         {/* User Footer */}
//         <div className="border-t-2 border-gray-200 p-4 sm:p-5 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg">
//               {userDetails.name[0]}
//             </div>
//             <div>
//               <h2 className="text-sm sm:text-lg font-bold">{userDetails.name}</h2>
//               <p className="text-xs sm:text-sm text-gray-500">{userDetails.email}</p>
//             </div>
//           </div>
//           <MdLogout
//             className="text-red-500 text-2xl sm:text-3xl cursor-pointer"
//             onClick={handleLogout}
//           />
//         </div>
//       </div>
//     </>
//   );
// =======
// import Sidebar from "@/components/Sidebar";

// const NewUserSidebar = () => {
//   return <Sidebar userRole="newuser" />;
// >>>>>>> 92a26e2 (implemented the chatting with negotitaion functionality)
// };

// export default NewUserSidebar;
