"use client";

import React, { useState } from "react";
import { Search, Menu, X } from "lucide-react";

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white shadow-md border-b w-full relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16">

        <div className="flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>


        <div className="hidden md:flex flex-1 justify-center max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Speaker"
              className="w-full pl-12 pr-12 py-2 border border-blue-400 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-sm bg-white"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity">
              <img src="/vector1.png" alt="Filter" className="w-4 h-4" />
            </button>
          </div>
        </div>


        <nav className="hidden md:flex items-center space-x-8 ml-auto">
          <a href="#" className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm">
            About
          </a>
          <a href="#" className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm">
            Speaker
          </a>
          <a href="#" className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm">
            Events
          </a>
          <a
            href="/signup/login"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors"
          >
            Login
          </a>
        </nav>


        <div className="md:hidden ml-auto">
          <button onClick={() => setOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>


      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={() => setOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-4">
          <a href="#" className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm">
            About
          </a>
          <a href="#" className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm">
            Speaker
          </a>
          <a href="#" className="text-gray-900 hover:text-[#FF6B35] font-medium text-sm">
            Events
          </a>
          <a
            href="/signup/login"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium text-sm text-center"
          >
            Login
          </a>
        </nav>
      </div>


      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;