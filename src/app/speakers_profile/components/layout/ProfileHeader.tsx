import React from 'react';
import { Briefcase, MapPin, Check } from 'lucide-react';

const ProfileHeader: React.FC = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
    <div className="p-6 text-white relative" style={{ backgroundColor: '#FF6B35' }}>
      <div className="flex items-start space-x-6">
        <div className="relative flex-shrink-0">
          <div className="w-30 h-30 rounded-lg overflow-hidden border-2 border-white">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face"
              alt="Dr. Jane Doe"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        </div>
        
        <div className="flex-1 pt-0">
          <h1 className="text-2xl font-semibold mb-1 text-black">Dr. Jane Doe</h1>
          <p className="text-sm opacity-90 mb-4">AI Healthcare Innovation Expert</p>
          <p className="text-xs  text-white/60 leading-relaxed mb-3">
            Experienced product manager and thought leader specializing in AI and technology innovation. 
            Passionate about building products that solve real-world problems and drive meaningful impact.
          </p>
          
          <div className="flex flex-wrap gap-2 mt-5 mb-3">
            <span className="px-4 py-1 text-xs bg-white/20 border border-white border-opacity-30 rounded-lg">
              Artificial Intelligence
            </span>
            <span className="px-4 py-1 text-xs bg-white/20 border border-white border-opacity-30 rounded-lg">
              Healthcare Technology
            </span>
            <span className="px-4 py-1 text-xs bg-white/20 border border-white border-opacity-30 rounded-lg">
              Product Management
            </span>
            <span className="px-4 py-1 text-xs bg-white/20 border border-white border-opacity-30 rounded-lg">
              + 2 more
            </span>
          </div>
          
          <div className="flex space-x-6 mt-4 text-xs">
            <span className="flex items-center space-x-1 text-white-400">
              <MapPin className="h-3 w-3" />
              <span>San Francisco, CA</span>
            </span>
          </div>
        </div>
        
        <button 
          className="px-9 py-2 bg-white rounded-lg text-sm font-medium self-start hover:shadow-md transition-shadow"
          style={{ color: '#FF6B35' }}
        //   onClick={onBookSpeaker}
        >
          Book Speaker
        </button>
      </div>
    </div>
  </div>
);

export default ProfileHeader;