'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface RoleTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function RoleTabs({ tabs, activeTab, onChange, className = '' }: RoleTabsProps) {
  return (
    <div className={`bg-gray-50 p-1 rounded-lg mb-6 flex ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              isActive
                ? 'text-white bg-[#FF6B35]'
                : 'text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35] hover:bg-[#FF6B35]/20'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}




