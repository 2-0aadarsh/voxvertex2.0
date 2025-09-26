import React from 'react';
import { Calendar } from 'lucide-react';

const ExperienceSection: React.FC = () => {
  const experiences = [
    {
      title: 'Senior Product Manager',
      company: 'VoxVertex',
      period: '2020 - Present',
      description: 'Led cross-functional teams in developing and launching successful products that increased user engagement by 40%. Managed product roadmap and strategic planning.'
    },
    {
      title: 'Product Manager',
      company: 'Tech Solutions Inc.',
      period: '2018 - 2020',
      description: 'Managed product lifecycle and implemented agile methodologies. Collaborated with engineering and design teams to deliver high-quality products.'
    },
    {
      title: 'Associate Product Manager',
      company: 'InnovateTech',
      period: '2016 - 2018',
      description: 'Assisted in product development and market research. Worked closely with senior managers to learn product management fundamentals.'
    },
    {
      title: 'Business Analyst',
      company: 'StartupCorp',
      period: '2014 - 2016',
      description: 'Analyzed business requirements and provided data-driven insights. Supported product development through comprehensive market analysis.'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-900">Work Experience</h2>
        
        <div className="space-y-4">
          {experiences.map((exp, index) => (
            <div 
              key={index} 
              className="relative p-5 rounded-lg"
              style={{ backgroundColor: '#FFE2D8' }}
            >
              <div 
                className="absolute top-5 right-5 px-2 py-1 rounded-full text-xs font-medium text-white flex items-center space-x-1"
                style={{ backgroundColor: '#FF6B35' }}
              >
                <Calendar className="h-3 w-3" />
                <span>{exp.period}</span>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{exp.title}</h3>
              <p className="text-xs font-medium mb-2" style={{ color: '#FF6B35' }}>
                {exp.company}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed pr-24">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceSection;