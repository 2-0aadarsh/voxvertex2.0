//demo header for temporary use
'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export default function Header() {
  return (
    <div className="bg-white border-b border-gray-200 width-full px-6 py-2">
      <div className="flex justify-end">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-[#FF6B35] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
              1
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Senior Product Manager</p>
            </div>
            <div className="w-9 h-9 bg-[#FF6B35]/50 rounded-full text-black text-xs flex items-center justify-center font-medium">
              A
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}