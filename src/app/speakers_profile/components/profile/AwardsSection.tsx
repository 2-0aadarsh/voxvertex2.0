import React from 'react';
import { Trophy, Calendar, ExternalLink, Award } from 'lucide-react';
import { Award as AwardType } from '@/store/types';

interface AwardsSectionProps {
  awards?: AwardType[];
  isLoading?: boolean;
  error?: unknown;
}

const AwardsSection: React.FC<AwardsSectionProps> = ({ 
  awards = [], 
  isLoading = false, 
  error 
}) => {
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
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Awards & Certifications</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative p-5 rounded-lg bg-gray-100 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
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
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Awards & Certifications</h2>
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Failed to load awards information</p>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!awards || awards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Awards & Certifications</h2>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No awards or certifications available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-900">Awards & Certifications</h2>
        
        <div className="space-y-4">
          {awards.map((award) => (
            <div 
              key={award._id} 
              className="relative p-5 rounded-lg"
              style={{ backgroundColor: '#FFE2D8' }}
            >
              <div 
                className="absolute top-5 right-5 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                style={{ backgroundColor: '#FF6B35', color: 'white' }}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatDate(award.dateIssued)}</span>
              </div>
              
              <div className="flex items-start space-x-3 mb-2">
                {award.type === 'award' ? (
                  <Trophy className="h-5 w-5 mt-0.5" style={{ color: '#FF6B35' }} />
                ) : (
                  <Award className="h-5 w-5 mt-0.5" style={{ color: '#FF6B35' }} />
                )}
                <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{award.title}</h3>
                  {award.issuer && (
              <p className="text-xs font-medium mb-2" style={{ color: '#FF6B35' }}>
                      {award.issuer}
                    </p>
                  )}
                </div>
              </div>
              
              {award.description && (
                <p className="text-xs text-gray-600 leading-relaxed pr-24 mb-2">
                {award.description}
              </p>
              )}
              
              <div className="flex items-center space-x-4 pr-24">
                <span className="text-xs px-2 py-1 bg-white/50 rounded-md text-gray-700 capitalize">
                  {award.type}
                </span>
                {award.credentialId && (
                  <span className="text-xs text-gray-600">
                    ID: {award.credentialId}
                  </span>
                )}
                {award.credentialUrl && (
                  <a 
                    href={award.credentialUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs flex items-center space-x-1 text-[#FF6B35] hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View Credential</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AwardsSection;