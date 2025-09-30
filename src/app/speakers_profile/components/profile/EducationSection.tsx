import React from 'react';
import { GraduationCap, MapPin, Award } from 'lucide-react';
import { Education } from '@/store/types';

interface EducationSectionProps {
  education?: Education[];
  isLoading?: boolean;
  error?: unknown;
}

const EducationSection: React.FC<EducationSectionProps> = ({ 
  education = [], 
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

  // Format period for display
  const formatPeriod = (startDate: string, endDate?: string, isCurrentlyStudying?: boolean) => {
    const start = formatDate(startDate);
    const end = isCurrentlyStudying ? 'Present' : (endDate ? formatDate(endDate) : '');
    return end ? `${start} - ${end}` : start;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Education</h2>
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
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Education</h2>
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Failed to load education information</p>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!education || education.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Education</h2>
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No education information available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-900">Education</h2>
        
        <div className="space-y-4">
          {education.map((edu) => (
            <div 
              key={edu._id} 
              className="relative p-5 rounded-lg"
              style={{ backgroundColor: '#FFE2D8' }}
            >
              <div 
                className="absolute top-5 right-5 px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#FF6B35', color: 'white' }}
              >
                {formatPeriod(edu.startDate, edu.endDate, edu.isCurrentlyStudying)}
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{edu.degree}</h3>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xs font-medium" style={{ color: '#FF6B35' }}>
                {edu.institution}
              </p>
                {edu.location && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{edu.location}</span>
                    </div>
                  </>
                )}
              </div>
              
              {edu.fieldOfStudy && (
                <p className="text-xs font-medium mb-2" style={{ color: '#FF6B35' }}>
                  Field of Study: {edu.fieldOfStudy}
                </p>
              )}
              
              {edu.description && (
                <p className="text-xs text-gray-600 leading-relaxed pr-24 mb-2">
                {edu.description}
              </p>
              )}
              
              {edu.grade && (
                <div className="flex items-center space-x-1 pr-24">
                  <Award className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">Grade: {edu.grade}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EducationSection;