import React from 'react';

const EducationSection: React.FC = () => {
  const education = [
    {
      degree: 'Master of Business Administration (MBA)',
      institution: 'Stanford University',
      period: '2012 - 2014',
      description: 'Focus on Technology Management and Entrepreneurship. Graduated Magna Cum Laude.'
    },
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of California, Berkeley',
      period: '2008 - 2012',
      description: 'Specialized in Artificial Intelligence and Machine Learning. Minor in Business Administration.'
    },
    {
      degree: 'Certificate in Healthcare Innovation',
      institution: 'Harvard Medical School',
      period: '2019 - 2020',
      description: 'Executive education program focused on digital health technologies and healthcare transformation.'
    },
    {
      degree: 'Certificate in AI Ethics',
      institution: 'MIT OpenCourseWare',
      period: '2021',
      description: 'Comprehensive program covering ethical implications of AI in healthcare and business applications.'
    },
    {
      degree: 'Advanced Product Management Certification',
      institution: 'Product School',
      period: '2020',
      description: 'Advanced certification covering product strategy, growth metrics, and leadership in tech companies.'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-900">Education</h2>
        
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div 
              key={index} 
              className="relative p-5 rounded-lg"
              style={{ backgroundColor: '#FFE2D8' }}
            >
              <div 
                className="absolute top-5 right-5 px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#FF6B35', color: 'white' }}
              >
                {edu.period}
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{edu.degree}</h3>
              <p className="text-xs font-medium mb-2" style={{ color: '#FF6B35' }}>
                {edu.institution}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed pr-24">
                {edu.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EducationSection;