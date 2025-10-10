'use client';
import React, { useState } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const Header: React.FC = () => (
  <header className="bg-white border-b border-gray-200 px-6 py-3">
    <div className="flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <div className="text-[#FF6B35] text-2xl font-bold">
          <span className="ml-2">V</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Speaker"
            className="w-full py-2 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-6">
        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a>
        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Speaker</a>
        <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Events</a>
        <a href="#" className="text-sm font-medium" style={{ color: '#FF6B35' }}>Pricing</a>
        <button 
          className="text-sm text-white px-5 py-2 rounded-full font-medium"
          style={{ backgroundColor: '#FF6B35' }}
        >
          login
        </button>
      </nav>
    </div>
  </header>
);
export default Header;