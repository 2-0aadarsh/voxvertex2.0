import React from 'react';

const PricingCard: React.FC = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm">
    <div className="p-4 text-white font-semibold" style={{ backgroundColor: '#FF6B35' }}>
      Pricing
    </div>
    
    <div className="p-5">
      <div className="space-y-3">
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-sm text-gray-900">Keynote (60 min)</span>
          <span className="text-sm font-semibold text-gray-900">$5,000</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-sm text-gray-900">Workshop (Half day)</span>
          <span className="text-sm font-semibold text-gray-900">$7,500</span>
        </div>
        
        <div className="flex justify-between items-center py-3">
          <span className="text-sm text-gray-900">Consultation</span>
          <span className="text-sm font-semibold text-gray-900">$1,500/hr</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          * Prices may vary based on event requirements, travel, and duration
        </p>
      </div>
    </div>
  </div>
);

export default PricingCard;