import React from 'react';
import { Calendar, MapPin, Briefcase } from 'lucide-react';
import { WorkExperience } from '@/store/types';

interface ExperienceSectionProps {
  workExperience?: WorkExperience[];
  isLoading?: boolean;
  error?: unknown;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ 
  workExperience = [], 
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
  const formatPeriod = (startDate: string, endDate?: string, isCurrentlyWorking?: boolean) => {
    const start = formatDate(startDate);
    const end = isCurrentlyWorking ? 'Present' : (endDate ? formatDate(endDate) : '');
    return end ? `${start} - ${end}` : start;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Work Experience</h2>
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
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Work Experience</h2>
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Failed to load work experience</p>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!workExperience || workExperience.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-900">Work Experience</h2>
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No work experience information available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-900">Work Experience</h2>
        
        <div className="space-y-4">
          {workExperience.map((exp) => (
            <div 
              key={exp._id} 
              className="relative p-5 rounded-lg"
              style={{ backgroundColor: '#FFE2D8' }}
            >
              <div 
                className="absolute top-5 right-5 px-2 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-1"
                style={{ backgroundColor: '#FF6B35' }}
              >
                <Calendar className="h-3 w-3" />
                <span>{formatPeriod(exp.startDate, exp.endDate, exp.isCurrentlyWorking)}</span>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{exp.title}</h3>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xs font-medium" style={{ color: '#FF6B35' }}>
                {exp.company}
              </p>
                {exp.location && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{exp.location}</span>
                    </div>
                  </>
                )}
              </div>
              
              {exp.description && (
              <p className="text-xs text-gray-600 leading-relaxed pr-24">
                {exp.description}
              </p>
              )}
              
              {exp.skills && exp.skills.length > 0 && (
                <div className="mt-3 pr-24">
                  <div className="flex flex-wrap gap-1">
                    {exp.skills.slice(0, 5).map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-white/50 rounded-md text-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {exp.skills.length > 5 && (
                      <span className="px-2 py-1 text-xs bg-white/50 rounded-md text-gray-700">
                        +{exp.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceSection;