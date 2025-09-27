import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { setFilters, clearFilters } from '@/store/slices/speakersSlice';

interface SubCategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: SubCategory[];
}

const categories: Category[] = [
  {
    id: 'technology',
    name: 'Technology',
    subcategories: [
      { id: 'ai-ml', name: 'Artificial Intelligence & Machine Learning' },
      { id: 'cybersecurity', name: 'Cybersecurity' },
      { id: 'blockchain', name: 'Blockchain & Cryptocurrencies' },
      { id: 'cloud-computing', name: 'Cloud Computing' },
      { id: 'data-science', name: 'Data Science & Big Data Analytics' },
      { id: 'iot', name: 'Internet of Things (IoT)' },
      { id: 'software-eng', name: 'Software Development & Engineering' },
      { id: 'web-mobile-dev', name: 'Web & Mobile App Development' },
      { id: 'quantum-computing', name: 'Quantum Computing' },
      { id: 'ar-vr', name: 'Augmented Reality (AR) & Virtual Reality (VR)' },
      { id: '5g', name: '5G Technology' },
      { id: 'robotics', name: 'Robotics & Automation' },
      { id: 'digital-transformation', name: 'Digital Transformation' }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medicine',
    subcategories: [
      { id: 'pharmaceuticals', name: 'Pharmaceuticals & Drug Development' },
      { id: 'telemedicine', name: 'Telemedicine & Digital Health' },
      { id: 'medical-devices', name: 'Medical Devices & Equipment' },
      { id: 'public-health', name: 'Public Health & Epidemiology' },
      { id: 'biotech', name: 'Biotechnology & Genetic Engineering' },
      { id: 'mental-health', name: 'Mental Health & Psychology' },
      { id: 'healthcare-policy', name: 'Healthcare Management & Policy' },
      { id: 'surgery', name: 'Surgery & Medical Techniques' },
      { id: 'nursing', name: 'Nursing & Patient Care' },
      { id: 'cancer-research', name: 'Cancer Research' },
      { id: 'regenerative-medicine', name: 'Regenerative Medicine & Stem Cells' },
      { id: 'vaccines', name: 'Vaccines & Immunology' }
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Banking',
    subcategories: [
      { id: 'markets', name: 'Financial Markets & Investment' },
      { id: 'fintech', name: 'FinTech & Digital Payments' },
      { id: 'crypto-blockchain', name: 'Cryptocurrency & Blockchain' },
      { id: 'corporate-finance', name: 'Corporate Finance & Mergers' },
      { id: 'banking', name: 'Banking Operations & Regulations' },
      { id: 'accounting', name: 'Accounting & Taxation' },
      { id: 'venture-capital', name: 'Venture Capital & Startups' },
      { id: 'real-estate', name: 'Real Estate Investment & Property Management' },
      { id: 'sustainable-finance', name: 'Sustainable Finance & ESG' },
      { id: 'trading', name: 'Stock Market & Trading' }
    ]
  },
  {
    id: 'education',
    name: 'Education',
    subcategories: [
      { id: 'elearning', name: 'E-learning & Online Education' },
      { id: 'curriculum', name: 'Curriculum Development & Instructional Design' },
      { id: 'edtech', name: 'Educational Technology (Ed Tech)' },
      { id: 'special-education', name: 'Special Education' },
      { id: 'stem', name: 'STEM Education' },
      { id: 'higher-education-policy', name: 'Higher Education Policy' },
      { id: 'adult-learning', name: 'Adult Learning & Lifelong Learning' },
      { id: 'vocational', name: 'Vocational & Technical Education' },
      { id: 'teacher-training', name: 'Teacher Training & Development' },
      { id: 'edu-psychology', name: 'Educational Psychology' },
      { id: 'assessment', name: 'Assessment & Evaluation' },
      { id: 'early-childhood', name: 'Early Childhood Education' }
    ]
  },
  {
    id: 'business',
    name: 'Business & Management',
    subcategories: [
      { id: 'entrepreneurship', name: 'Entrepreneurship & Startups' },
      { id: 'hr', name: 'Human Resources & Talent Management' },
      { id: 'marketing', name: 'Marketing & Advertising' },
      { id: 'strategy', name: 'Business Strategy & Innovation' },
      { id: 'supply-chain', name: 'Supply Chain & Operations Management' },
      { id: 'leadership', name: 'Leadership & Organizational Behavior' },
      { id: 'project-management', name: 'Project Management' },
      { id: 'csr', name: 'Corporate Social Responsibility (CSR)' },
      { id: 'business-analytics', name: 'Business Analytics & Data-Driven Decision Making' },
      { id: 'sales', name: 'Sales & Business Development' },
      { id: 'product-management', name: 'Product Management' },
      { id: 'crm', name: 'Customer Relationship Management (CRM)' }
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering',
    subcategories: [
      { id: 'mechanical', name: 'Mechanical Engineering' },
      { id: 'electrical', name: 'Electrical & Electronics Engineering' },
      { id: 'civil', name: 'Civil Engineering' },
      { id: 'chemical', name: 'Chemical Engineering' },
      { id: 'aerospace', name: 'Aerospace Engineering' },
      { id: 'materials', name: 'Materials Science & Nanotechnology' },
      { id: 'automotive', name: 'Automotive Engineering' },
      { id: 'renewable-energy', name: 'Renewable Energy Engineering' },
      { id: 'robotics-mechatronics', name: 'Robotics & Mechatronics' },
      { id: 'structural', name: 'Structural Engineering' },
      { id: 'environmental', name: 'Environmental Engineering' }
    ]
  },
  {
    id: 'law',
    name: 'Law & Legal Studies',
    subcategories: [
      { id: 'corporate-law', name: 'Corporate Law' },
      { id: 'intellectual-property', name: 'Intellectual Property Law' },
      { id: 'criminal-law', name: 'Criminal Law & Justice' },
      { id: 'international-law', name: 'International Law' },
      { id: 'environmental-law', name: 'Environmental Law' },
      { id: 'human-rights', name: 'Human Rights Law' },
      { id: 'labor-law', name: 'Labor & Employment Law' },
      { id: 'cyber-law', name: 'Cyber Law & Data Privacy' },
      { id: 'constitutional-law', name: 'Constitutional Law' },
      { id: 'tax-law', name: 'Tax Law' },
      { id: 'immigration-law', name: 'Immigration Law' }
    ]
  },
  {
    id: 'marketing-communications',
    name: 'Marketing & Communications',
    subcategories: [
      { id: 'digital-marketing-seo', name: 'Digital Marketing & SEO' },
      { id: 'public-relations', name: 'Public Relations & Media Relations' },
      { id: 'content-marketing', name: 'Content Marketing' },
      { id: 'branding-identity', name: 'Branding & Identity' },
      { id: 'advertising-strategies', name: 'Advertising Strategies' },
      { id: 'social-media-marketing', name: 'Social Media Marketing' },
      { id: 'email-marketing', name: 'Email Marketing' },
      { id: 'crisis-communication', name: 'Crisis Communication & Reputation Management' },
      { id: 'video-visual-content', name: 'Video & Visual Content Marketing' },
      { id: 'copywriting', name: 'Copywriting & Storytelling' }
    ]
  },
  {
    id: 'art-entertainment',
    name: 'Art & Entertainment',
    subcategories: [
      { id: 'film-tv', name: 'Film & Television Production' },
      { id: 'visual-arts', name: 'Visual Arts (Painting, Sculpture, etc.)' },
      { id: 'graphic-design', name: 'Graphic Design & Animation' },
      { id: 'music-production', name: 'Music Production & Sound Engineering' },
      { id: 'performing-arts', name: 'Performing Arts (Theatre, Dance)' },
      { id: 'photography', name: 'Photography & Cinematography' },
      { id: 'literature', name: 'Literature & Creative Writing' },
      { id: 'video-games', name: 'Video Game Development' },
      { id: 'fashion-design', name: 'Fashion Design' },
      { id: 'digital-art', name: 'Digital Art & NFTs' },
      { id: 'cultural-studies', name: 'Cultural Studies & Art History' }
    ]
  },
  {
    id: 'environmental',
    name: 'Environmental & Sustainability',
    subcategories: [
      { id: 'climate-change', name: 'Climate Change & Global Warming' },
      { id: 'renewable-energy-clean', name: 'Renewable Energy & Clean Technology' },
      { id: 'sustainable-agriculture', name: 'Sustainable Agriculture' },
      { id: 'waste-management', name: 'Waste Management & Recycling' },
      { id: 'conservation', name: 'Environmental Conservation' },
      { id: 'sustainable-business', name: 'Sustainable Business Practices' },
      { id: 'carbon-footprint', name: 'Carbon Footprint Reduction' },
      { id: 'water-conservation', name: 'Water Conservation' },
      { id: 'green-building', name: 'Green Building & Architecture' },
      { id: 'wildlife-protection', name: 'Wildlife Protection & Biodiversity' },
      { id: 'environmental-policy', name: 'Environmental Policy & Regulations' }
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industry',
    subcategories: [
      { id: 'lean-manufacturing', name: 'Lean Manufacturing' },
      { id: 'additive-manufacturing', name: 'Additive Manufacturing (3D Printing)' },
      { id: 'industrial-automation', name: 'Industrial Automation & Robotics' },
      { id: 'supply-chain-mgmt', name: 'Supply Chain Management' },
      { id: 'quality-control', name: 'Quality Control & Six Sigma' },
      { id: 'manufacturing-engineering', name: 'Manufacturing Engineering' },
      { id: 'textile-manufacturing', name: 'Textile Manufacturing' },
      { id: 'automotive-manufacturing', name: 'Automotive Manufacturing' },
      { id: 'aerospace-manufacturing', name: 'Aerospace Manufacturing' },
      { id: 'smart-factories', name: 'Smart Factories & Industry 4.0' }
    ]
  },
  {
    id: 'social-sciences',
    name: 'Social Sciences & Humanities',
    subcategories: [
      { id: 'psychology-behavioral', name: 'Psychology & Behavioral Sciences' },
      { id: 'sociology-anthropology', name: 'Sociology & Anthropology' },
      { id: 'political-science', name: 'Political Science & International Relations' },
      { id: 'history-archaeology', name: 'History & Archaeology' },
      { id: 'philosophy-ethics', name: 'Philosophy & Ethics' },
      { id: 'gender-studies', name: 'Gender Studies' },
      { id: 'linguistics', name: 'Linguistics & Language Studies' },
      { id: 'religious-studies', name: 'Religious Studies' },
      { id: 'cultural-anthropology', name: 'Cultural Anthropology' },
      { id: 'public-policy', name: 'Public Policy & Governance' },
      { id: 'criminology', name: 'Criminology & Law Enforcement' }
    ]
  },
  {
    id: 'retail-ecommerce',
    name: 'Retail & E-commerce',
    subcategories: [
      { id: 'omnichannel', name: 'Omnichannel Retailing' },
      { id: 'customer-experience', name: 'Customer Experience Management' },
      { id: 'ecommerce-platforms', name: 'E-commerce & Online Marketplaces' },
      { id: 'retail-supply-chain', name: 'Retail Supply Chain & Logistics' },
      { id: 'retail-analytics', name: 'Retail Analytics & Consumer Insights' },
      { id: 'branding-merchandising', name: 'Branding & Merchandising' },
      { id: 'retail-tech', name: 'Retail Tech & Digital Innovation' },
      { id: 'fashion-retail', name: 'Fashion Retail' },
      { id: 'luxury-retail', name: 'Luxury Retail Innovation' },
      { id: 'payment-systems', name: 'Payment Systems in Retail' },
      { id: 'subscription-models', name: 'Subscription Models in E-commerce' }
    ]
  },
  {
    id: 'energy-utilities',
    name: 'Energy & Utilities',
    subcategories: [
      { id: 'oil-gas', name: 'Oil & Gas Exploration' },
      { id: 'renewable-solar', name: 'Renewable Energy & Solar Power' },
      { id: 'nuclear-energy', name: 'Nuclear Energy' },
      { id: 'hydropower-wind', name: 'Hydropower & Wind Energy' },
      { id: 'energy-storage', name: 'Energy Storage & Batteries' },
      { id: 'energy-policy', name: 'Energy Policy & Regulations' },
      { id: 'smart-grids', name: 'Smart Grids & Energy Distribution' },
      { id: 'energy-efficiency', name: 'Energy Efficiency Technologies' },
      { id: 'natural-gas', name: 'Natural Gas & LNG' },
      { id: 'geothermal', name: 'Geothermal Energy' }
    ]
  },
  {
    id: 'real-estate-property',
    name: 'Real Estate & Property Development',
    subcategories: [
      { id: 'real-estate-investment', name: 'Real Estate Investment & Finance' },
      { id: 'property-development', name: 'Property Development & Management' },
      { id: 'real-estate-law', name: 'Real Estate Law & Regulations' },
      { id: 'urban-planning', name: 'Urban Planning & Smart Cities' },
      { id: 'sustainable-architecture', name: 'Sustainable Architecture' },
      { id: 'commercial-real-estate', name: 'Commercial Real Estate' },
      { id: 'residential-real-estate', name: 'Residential Real Estate' },
      { id: 'proptech', name: 'Property Technology (PropTech)' },
      { id: 'green-buildings', name: 'Green Buildings & LEED Certification' },
      { id: 'real-estate-analytics', name: 'Real Estate Analytics' },
      { id: 'land-acquisition', name: 'Land Acquisition & Zoning Laws' }
    ]
  }
];

const FiltersSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  // const filters = useAppSelector(selectSpeakersFilters); // Not needed for local state approach
  
  // Local state for pending filter changes (not applied until button click)
  const [searchKeywords, setSearchKeywords] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [identityVerified, setIdentityVerified] = useState(false);
  const [credentialsVerified, setCredentialsVerified] = useState(false);
  const [location, setLocation] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [deliveryMode, setDeliveryMode] = useState('');
  const [minFee, setMinFee] = useState(0);
  const [maxFee, setMaxFee] = useState(10000);

  const clearAllFilters = () => {
    setSearchKeywords('');
    setSelectedDate('');
    setIdentityVerified(false);
    setCredentialsVerified(false);
    setLocation('');
    setSelectedTopic('');
    setSelectedExpertise('');
    setYearsOfExperience(0);
    setDeliveryMode('');
    setMinFee(0);
    setMaxFee(10000);
    dispatch(clearFilters());
  };

  const applyFilters = () => {
    // Get the actual names instead of IDs
    const selectedCategory = categories.find(cat => cat.id === selectedTopic);
    const selectedExpertiseCategory = selectedCategory?.subcategories.find(sub => sub.id === selectedExpertise);
    
    const newFilters = {
      searchQuery: searchKeywords,
      availabilityDate: selectedDate,
      location: location,
      yearsOfExperience: yearsOfExperience,
      expertise: selectedExpertiseCategory ? [selectedExpertiseCategory.name] : [],
      topics: selectedCategory ? [selectedCategory.name] : [],
      eventTypes: deliveryMode ? [deliveryMode] : [],
      priceRange: {
        min: minFee,
        max: maxFee
      }
    };
    
    console.log('🎯 Applying filters:', newFilters);
    console.log('🎯 Selected topic:', selectedTopic);
    console.log('🎯 Selected expertise:', selectedExpertise);
    console.log('🎯 Selected category:', selectedCategory);
    console.log('🎯 Selected expertise category:', selectedExpertiseCategory);
    dispatch(setFilters(newFilters));
  };

  const getExpertiseOptions = () => {
    const selectedCategory = categories.find(cat => cat.id === selectedTopic);
    return selectedCategory ? selectedCategory.subcategories : [];
  };

  const increaseYears = () => {
    setYearsOfExperience(prev => prev + 1);
  };

  const decreaseYears = () => {
    setYearsOfExperience(prev => Math.max(0, prev - 1));
  };

  const handleTopicChange = (topicId: string) => {
    setSelectedTopic(topicId);
    setSelectedExpertise('');
  };

  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-[#FF6B35] text-white rounded-lg mb-0">
        <div className="flex justify-between items-center p-3">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button 
            onClick={clearAllFilters}
            className="text-white hover:text-gray-200 text-sm underline"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 space-y-6">
        {/* Search Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Keywords
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Refine your search..." 
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-[#FF6B35] rounded-md leading-5 bg-orange-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
            />
          </div>
        </div>

        {/* Availability Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability Date
          </label>
          <div className="relative">
            <Calendar 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer z-10" 
              onClick={() => {
                const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                if (dateInput) {
                  dateInput.showPicker?.();
                }
              }}
            />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
            />
          </div>
        </div>

        {/* Fee Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fee Range
          </label>
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Min Fee</label>
              <input 
                type="number" 
                value={minFee}
                onChange={(e) => setMinFee(Math.max(0, parseInt(e.target.value) || 0))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                placeholder="0"
                min="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Max Fee</label>
              <input 
                type="number" 
                value={maxFee}
                onChange={(e) => setMaxFee(Math.max(minFee, parseInt(e.target.value) || 10000))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                placeholder="10000"
                min={minFee}
              />
            </div>
          </div>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Type
          </label>
          <select 
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
          >
            <option value="">Select event type...</option>
            <option value="Corporate & Professional Events">Corporate & Professional Events</option>
            <option value="Educational & Training Formats">Educational & Training Formats</option>
            <option value="Specialized & Niche Events">Specialized & Niche Events</option>
          </select>
        </div>

        {/* Topics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topics
          </label>
          <select 
            value={selectedTopic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
          >
            <option value="">Select topic...</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Expertise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expertise
          </label>
          <select 
            value={selectedExpertise}
            onChange={(e) => setSelectedExpertise(e.target.value)}
            disabled={!selectedTopic}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select expertise...</option>
            {getExpertiseOptions().map((expertise) => (
              <option key={expertise.id} value={expertise.id}>
                {expertise.name}
              </option>
            ))}
          </select>
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <div className="flex items-center border border-gray-300 rounded-md">
            <input 
              type="number" 
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(Math.max(0, parseInt(e.target.value) || 0))}
              className="block w-full px-3 py-2 leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] border-0 rounded-l-md"
              min="0"
            />
            <div className="flex flex-col border-l border-gray-300">
              <button 
                type="button"
                onClick={increaseYears}
                className="px-2 py-1 hover:bg-gray-100 focus:outline-none"
              >
                <ChevronUp className="h-3 w-3 text-gray-500" />
              </button>
              <button 
                type="button"
                onClick={decreaseYears}
                className="px-2 py-1 hover:bg-gray-100 focus:outline-none border-t border-gray-300"
              >
                <ChevronDown className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Mode
          </label>
          <select 
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
          >
            <option value="">Select delivery mode...</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {/* Trust & Verification */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Trust & Verification
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={identityVerified}
                onChange={(e) => setIdentityVerified(e.target.checked)}
                className="h-4 w-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
              />
              <span className="ml-2 text-sm text-gray-700">Identity Verified Only</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={credentialsVerified}
                onChange={(e) => setCredentialsVerified(e.target.checked)}
                className="h-4 w-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
              />
              <span className="ml-2 text-sm text-gray-700">Credentials Verified Only</span>
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input 
            type="text" 
            placeholder="City, State or Region" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-orange-50 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
          />
        </div>

        {/* Apply Filters Button */}
        <button 
          onClick={applyFilters}
          className="w-full mt-69 bg-[#FF6B35] text-white py-3 px-4 rounded-md hover:bg-orange-600 font-medium transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FiltersSidebar;