import React from 'react';

const AwardsSection: React.FC = () => {
  const awards = [
    {
      title: 'Innovation Excellence Award',
      category: 'Healthcare Technology Innovation',
      period: '2023',
      description: 'Recognized for groundbreaking contributions to AI-powered healthcare solutions that improved patient outcomes by 35%.'
    },
    {
      title: 'Women in Tech Leadership Award',
      category: 'Technology Leadership',
      period: '2022',
      description: 'Honored for exceptional leadership in promoting diversity and inclusion in technology organizations.'
    },
    {
      title: 'Product Manager of the Year',
      category: 'Product Management Excellence',
      period: '2021',
      description: 'Awarded by Tech Leaders Association for outstanding product strategy and successful product launches.'
    },
    {
      title: 'Healthcare Digital Transformation Award',
      category: 'Digital Health Innovation',
      period: '2020',
      description: 'Recognized for leading digital transformation initiatives that revolutionized patient care delivery systems.'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-900">Awards & Certifications</h2>
        
        <div className="space-y-4">
          {awards.map((award, index) => (
            <div 
              key={index} 
              className="relative p-5 rounded-lg"
              style={{ backgroundColor: '#FFE2D8' }}
            >
              <div 
                className="absolute top-5 right-5 px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#FF6B35', color: 'white' }}
              >
                {award.period}
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{award.title}</h3>
              <p className="text-xs font-medium mb-2" style={{ color: '#FF6B35' }}>
                {award.category}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed pr-24">
                {award.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AwardsSection;