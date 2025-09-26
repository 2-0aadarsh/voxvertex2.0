import React from 'react';
import { Play } from 'lucide-react';

const VideosSection: React.FC = () => {
  const videos = [
    {
      title: 'The Future of AI in Healthcare',
      duration: '45 min',
      views: '1,541 views',
      imageUrl: '/speakers/pic1.png'
    },
    {
      title: 'Building Ethical AI Products',
      duration: '32 min',
      views: '2,103 views',
      imageUrl: '/speakers/pic3.png'
    },
    {
      title: 'Product Management in the AI Era',
      duration: '38 min',
      views: '1,847 views',
      imageUrl: '/speakers/pic2.png'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-900">Featured Videos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {videos.map((video, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              {/* Video thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={video.imageUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white shadow-lg"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  {video.duration}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 border-2 border-[#FF6B35] rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg">
                    <Play className="h-6 w-6 text-[#FF6B35] ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div 
                className="p-4 text-white"
                style={{ backgroundColor: '#FF6B35' }}
              >
                <h4 className="text-sm font-medium leading-tight mb-1">{video.title}</h4>
                <div className="flex items-center text-xs opacity-90">
                  <span>👁</span>
                  <span className="ml-1">{video.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideosSection;