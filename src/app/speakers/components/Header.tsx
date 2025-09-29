import React from 'react';
import { Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sm:w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src="/V.png" alt="V Logo" className="h-8 w-12" />
          </div>
          
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search Speaker" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              />
            </div>
          </div>

          <nav className="flex items-center space-x-8">
            <a href="#" className="hidden md:inline-flex text-gray-700 hover:text-gray-900">About</a>
<a href="#" className="hidden md:inline-flex text-[#FF6B35] font-medium">Speaker</a>
<a href="#" className="hidden md:inline-flex text-gray-700 hover:text-gray-900">Events</a>

            <button className="bg-[#FF6B35] text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors">
              Login
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;