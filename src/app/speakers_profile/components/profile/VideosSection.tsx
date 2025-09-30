import React from 'react';
import { Play, Eye, Calendar } from 'lucide-react';
import { FeaturedVideo } from '@/store/types';

interface VideosSectionProps {
  featuredVideos?: FeaturedVideo[];
  isLoading?: boolean;
  error?: unknown;
}

const VideosSection: React.FC<VideosSectionProps> = ({ 
  featuredVideos = [], 
  isLoading = false, 
  error 
}) => {
  // Format duration for display
  const formatDuration = (duration?: number) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format view count for display
  const formatViewCount = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    } else {
      return `${views} views`;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Featured Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative rounded-lg overflow-hidden shadow-md bg-gray-100 animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 bg-gray-200">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Featured Videos</h2>
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Failed to load featured videos</p>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!featuredVideos || featuredVideos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Featured Videos</h2>
          <div className="text-center py-8">
            <Play className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No featured videos available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-900">Featured Videos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredVideos.map((video) => (
            <div key={video._id} className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              {/* Video thumbnail */}
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={video.thumbnailUrl || '/default-video-thumbnail.jpg'}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-video-thumbnail.jpg';
                  }}
                />
                <div 
                  className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white shadow-lg"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  {formatDuration(video.duration)}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <a 
                    href={video.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-16 h-16 bg-white/90 border-2 border-[#FF6B35] rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
                  >
                    <Play className="h-6 w-6 text-[#FF6B35] ml-1" fill="currentColor" />
                  </a>
                </div>
              </div>
              <div 
                className="p-4 text-white"
                style={{ backgroundColor: '#FF6B35' }}
              >
                <h4 className="text-sm font-medium leading-tight mb-1">{video.title}</h4>
                {video.description && (
                  <p className="text-xs opacity-90 mb-2 line-clamp-2">{video.description}</p>
                )}
                <div className="flex items-center justify-between text-xs opacity-90">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{formatViewCount(video.viewCount || 0)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>
                {video.category && (
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-white/20 rounded-full">
                      {video.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideosSection;