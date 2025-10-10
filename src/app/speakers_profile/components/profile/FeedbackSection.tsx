import React from 'react';
import { Calendar } from 'lucide-react';

const FeedbackSection: React.FC = () => {
  const feedbacks = [
    {
      title: 'Senior Product Manager',
      company: 'VoxVertex',
      period: '2020 - Present',
      feedback: 'nice platform!'
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-5 text-gray-900">Feedback</h2>
        
        
      </div>
    </div>
  );
};

export default FeedbackSection;