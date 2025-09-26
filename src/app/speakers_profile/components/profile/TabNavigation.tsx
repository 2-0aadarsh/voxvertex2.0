import React from 'react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab, tabs }) => (
  <div className="flex w-full mb-6">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`flex-1 px-6 py-3 text-sm font-medium rounded-full transition-colors ${
          activeTab === tab
            ? 'text-white shadow-sm'
            : 'text-gray-600 hover:text-[#FF6B35] bg-gray-100'
        }`}
        style={activeTab === tab ? { backgroundColor: '#FF6B35' } : {}}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default TabNavigation;