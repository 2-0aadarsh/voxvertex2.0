import React, { useState, useEffect } from 'react';
import { useGetSpeakerWorkExperienceQuery, useGetSpeakerEducationQuery, useGetSpeakerAwardsQuery, useGetSpeakerFeaturedVideosQuery } from '@/store/slices/speakerProfileSlice';

interface LazySectionProps {
  speakerId: string;
  sectionType: 'work-experience' | 'education' | 'awards' | 'videos';
  children: (data: any, isLoading: boolean, error: any) => React.ReactNode;
}

const LazySection: React.FC<LazySectionProps> = ({ speakerId, sectionType, children }) => {
  const [hasBeenViewed, setHasBeenViewed] = useState(false);

  // Use intersection observer to detect when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenViewed) {
            setHasBeenViewed(true);
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of the section is visible
    );

    const sectionElement = document.getElementById(`section-${sectionType}`);
    if (sectionElement) {
      observer.observe(sectionElement);
    }

    return () => {
      if (sectionElement) {
        observer.unobserve(sectionElement);
      }
    };
  }, [sectionType, hasBeenViewed]);

  // Fetch data only when section has been viewed
  const workExperienceQuery = useGetSpeakerWorkExperienceQuery(speakerId, {
    skip: !hasBeenViewed || sectionType !== 'work-experience'
  });

  const educationQuery = useGetSpeakerEducationQuery(speakerId, {
    skip: !hasBeenViewed || sectionType !== 'education'
  });

  const awardsQuery = useGetSpeakerAwardsQuery(speakerId, {
    skip: !hasBeenViewed || sectionType !== 'awards'
  });

  const videosQuery = useGetSpeakerFeaturedVideosQuery(speakerId, {
    skip: !hasBeenViewed || sectionType !== 'videos'
  });

  // Get the appropriate query based on section type
  const getQueryData = () => {
    switch (sectionType) {
      case 'work-experience':
        return {
          data: workExperienceQuery.data?.data,
          isLoading: workExperienceQuery.isLoading,
          error: workExperienceQuery.error
        };
      case 'education':
        return {
          data: educationQuery.data?.data,
          isLoading: educationQuery.isLoading,
          error: educationQuery.error
        };
      case 'awards':
        return {
          data: awardsQuery.data?.data,
          isLoading: awardsQuery.isLoading,
          error: awardsQuery.error
        };
      case 'videos':
        return {
          data: videosQuery.data?.data,
          isLoading: videosQuery.isLoading,
          error: videosQuery.error
        };
      default:
        return { data: null, isLoading: false, error: null };
    }
  };

  const { data, isLoading, error } = getQueryData();

  return (
    <div id={`section-${sectionType}`}>
      {children(data, isLoading, error)}
    </div>
  );
};

export default LazySection;





