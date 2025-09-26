import React from 'react';
import { Star, Briefcase } from 'lucide-react';

const RatingsCard: React.FC = () => (
  <div className="flex gap-4 mb-6 max-w-md">
    <div className="bg-orange-100 rounded-lg px-4 py-3 text-center border min-w-0 flex-1" style={{ borderColor: '#FF6B35' }}>
      <Star className="h-5 w-5 mx-auto mb-2" style={{ color: '#FF6B35' }} />
      <div className="text-xl font-bold mb-1" style={{ color: '#FF6B35' }}>4.9</div>
      <div className="text-sm text-gray-600">Ratings</div>
    </div>
    <div className="bg-orange-100 rounded-lg px-4 py-3 text-center border min-w-0 flex-1" style={{ borderColor: '#FF6B35' }}>
      <Briefcase className="h-5 w-5 mx-auto mb-2" style={{ color: '#FF6B35' }} />
      <div className="text-xl font-bold mb-1" style={{ color: '#FF6B35' }}>5</div>
      <div className="text-sm text-gray-600 whitespace-nowrap">Years of Experience</div>
    </div>
  </div>
);

export default RatingsCard;