'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/store/hooks';
import { useGetCurrentUserQuery } from '@/store/slices/authSlice';

// const Header: React.FC = () => (
//   <header className="bg-white border-b border-gray-200 px-6 py-3">
//     <div className="flex items-center justify-between">
//       {/* Logo */}
//       <div className="flex items-center">
//         <img src="/V.png" alt="Voxvertex Logo" className="h-8 w-12" />
//       </div>

//       {/* Search Bar */}
//       <div className="flex-1 max-w-md mx-10">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search Speaker"
//             className="w-full py-2 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Search className="h-4 w-4 text-gray-400" />
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex items-center space-x-6">
//         <a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a>
//         <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Speaker</a>
//         <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Events</a>
//         <a href="#" className="text-sm font-medium" style={{ color: '#FF6B35' }}>Pricing</a>
//         <button 
//           className="text-sm text-white px-5 py-2 rounded-full font-medium"
//           style={{ backgroundColor: '#FF6B35' }}
//         >
//           login
//         </button>
//       </nav>
//     </div>
//   </header>
// );

const VoxvertexPricingPage = () => {
  const [isYearly, setIsYearly] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Authentication hooks
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useGetCurrentUserQuery();

  // Helper function to get profile image URL
  const getProfileImageUrl = (profileImage: unknown) => {
    if (!profileImage) return null;
    
    // Handle string URLs
    if (typeof profileImage === 'string') {
      if (profileImage.startsWith('http')) return profileImage;
      return `https://res.cloudinary.com/demo/image/fetch/${profileImage}`;
    }
    
    // Handle object with data and contentType (Buffer)
    if (typeof profileImage === 'object' && (profileImage as any).data && (profileImage as any).contentType) {
      const dataUrl = `data:${(profileImage as any).contentType};base64,${((profileImage as any).data as { toString: (encoding: string) => string }).toString('base64')}`;
      return dataUrl;
    }
    
    // Handle object with url property
    if (typeof profileImage === 'object' && (profileImage as any).url) {
      if ((profileImage as any).url.startsWith('http')) return (profileImage as any).url;
      return `https://res.cloudinary.com/demo/image/fetch/${(profileImage as any).url}`;
    }
    
    return null;
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    "What happens after my 7-day free trial ends?",
    "Can I cancel my subscription at any time?",
    "Do you offer discounts for longer commitments?"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar 
        user={user || undefined}
        currentUserData={currentUserData}
        isAuthenticated={isAuthenticated}
        forceHomepageStyle={true}
        getProfileImageUrl={getProfileImageUrl}
      />

      {/* Main Content */}
      <main className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#FF6B35]/10">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#FF6B35] mb-6">
            One Plan, All the Power
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Get everything you need to run professional events with one simple plan.
          </p>
          <p className="text-lg text-gray-600">
            Start your free 7-day trial today.
          </p>
        </div>

        <div className="flex justify-center items-center mb-12">
          <div className="bg-white rounded-full px-6 py-3 shadow-sm">
            <div className="flex items-center">
              <span className={`mr-4 ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-[#FF6B35]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-4 ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Yearly
              </span>
              {isYearly && (
                <span className="ml-2 bg-[#FF6B35]/20 text-[#FF6B35] px-2 py-0.5 rounded-lg text-sm font-medium">
                  SAVE 17%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#FF6B35] text-white px-4 py-1 rounded-full text-sm font-medium">
                LAUNCH OFFER
              </span>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pro Plan</h2>
              
              <div className="mb-6">
                <span className="text-2xl font-bold text-[#FF6B35]">
                  ₹{isYearly ? '9,999' : '999'}
                </span>
                <span className="text-gray-600 ml-2">
                  / {isYearly ? 'year' : 'month'}
                </span>
              </div>
              
              <div className="text-gray-500 line-through mb-6">
                ₹{isYearly ? '23,988' : '1,999'}
              </div>
              
              <button className="w-full bg-[#FF6B35] text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                Start Your 7-Day Free Trial
              </button>
            </div>

            <div className="space-y-4">
              {[
                'Unlimited Event Creation & Publishing',
                'Event Canvas: Build a stunning event page in 15 mins',
                'Unlimited Speaker Bookings with Escrow',
                'Speaker Pipeline Builder for future bookings',
                'Integrated Lead Capture Tools',
                'Access to Exclusive Organizer Community',
                'Early Access to New Features'
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="text-[#FF6B35] mr-3 mt-1">✓</div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-[#FF6B35] text-center mb-12">
            Fair, Transparent Transactional Fees
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white border-2 border-[#FF6B35]/30 rounded-xl p-8 shadow-sm hover:border-[#FF6B35]/60 transition-colors">
              <h3 className="text-lg font-bold text-[#FF6B35] mb-6">For Speakers</h3>
              <div className="text-3xl font-bold text-[#FF6B35] mb-4">10%</div>
              <p className="text-gray-600">
                A simple platform fee on all successfully completed and paid bookings.
              </p>
            </div>
            
            <div className="bg-white border-2 border-[#FF6B35]/30 rounded-xl p-8 shadow-sm hover:border-[#FF6B35]/60 transition-colors">
              <h3 className="text-lg font-bold text-[#FF6B35] mb-6">For Participants</h3>
              <div className="text-3xl font-bold text-[#FF6B35] mb-4">2%</div>
              <p className="text-gray-600">
                A small, transparent transaction fee added at checkout for every ticket sold.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-[#FF6B35] text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((question, index) => (
              <div key={index}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center py-4 text-left group"
                >
                  <span className="font-medium text-gray-900 group-hover:underline">{question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="pb-4 text-gray-600 border-b border-gray-200">
                    {index === 0 && (
                      <p>After your trial, you&apos;ll be prompted to choose a billing plan (monthly or yearly) to continue using the Pro features. If you choose not to subscribe, your account will be limited to managing one active event.</p>
                    )}
                    {index === 1 && (
                      <p>Yes, absolutely. You can cancel your Pro plan anytime from your billing dashboard. You will retain Pro features until the end of your current billing cycle.</p>
                    )}
                    {index === 2 && (
                      <p>Yes! Our yearly plan offers a 17% discount, equivalent to two months free. We also have 3 and 6-month options; please contact us for details.</p>
                    )}
                  </div>
                )}
                {openFaq !== index && (
                  <div className="border-b border-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#FF6B35] mb-6">
            Ready to Transform Your Events?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust Voxvertex to create memorable experiences.
          </p>
          <button className="bg-[#FF6B35] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-orange-600 transition-colors">
            Start Your Free Trial Today
          </button>
        </div>
      </main>
    </div>
  );
};

export default VoxvertexPricingPage;