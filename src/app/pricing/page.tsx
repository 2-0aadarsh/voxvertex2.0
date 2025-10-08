'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/store/hooks';
import { useGetCurrentUserQuery, useGetSubscriptionStatusQuery } from '@/store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { 
  showSignupModal, 
  showLoginModal, 
  showCompleteSubscriptionModal,
  showWelcomeModal,
  hideAllModals,
  transitionToWelcome,
  setSelectedPlan,
  setIsYearly,
  selectModalStates,
  selectSelectedPlanFromRedux,
  selectIsYearly,
  selectPlans,
  useGetSubscriptionPlansQuery
} from '@/store/slices/subscriptionSlice';
import OrganizerSignupModal from '@/components/modals/OrganizerSignupModal';
import OrganizerLoginModal from '@/components/modals/OrganizerLoginModal';
import CompleteSubscriptionModal from '@/components/modals/CompleteSubscriptionModal';
import WelcomeProModal from '@/components/modals/WelcomeProModal';

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Redux hooks
  const dispatch = useDispatch();
  const modalStates = useSelector(selectModalStates);
  const selectedPlanFromRedux = useSelector(selectSelectedPlanFromRedux);
  const isYearly = useSelector(selectIsYearly);
  const plans = useSelector(selectPlans);

  // Authentication hooks
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData, isLoading: userLoading } = useGetCurrentUserQuery();
  
  // Get subscription status if user is authenticated
  const { 
    data: subscriptionData, 
    isLoading: subscriptionLoading 
  } = useGetSubscriptionStatusQuery(user?._id || '', {
    skip: !user?._id || !isAuthenticated
  });

  // Fetch subscription plans from API
  const { data: plansData, isLoading: plansLoading, error: plansError } = useGetSubscriptionPlansQuery();

  console.log("plansData:", plansData);

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

  // Get current plan based on billing cycle (monthly/yearly)
  const getCurrentPlan = () => {
    if (!plansData?.data || plansData.data.length === 0) return null;
    
    // Find plan based on current billing cycle selection
    const targetCycle = isYearly ? 'yearly' : 'monthly';
    return plansData.data.find((plan) => plan.billingCycle === targetCycle) || plansData.data[0];
  };

  const currentPlan = getCurrentPlan();

  // Handle pricing button clicks
  const handleStartTrial = () => {
    console.log('=== handleStartTrial DEBUG ===');
    console.log('currentPlan:', currentPlan);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('user.role:', user?.role);
    console.log('currentUserData:', currentUserData);
    console.log('subscriptionData:', subscriptionData);
    console.log('=============================');

    if (!currentPlan) {
      alert('No subscription plans available. Please try again later.');
      return;
    }

    // Check if user data is still loading
    if (userLoading || subscriptionLoading) {
      alert('User data is still loading. Please wait a moment and try again.');
      return;
    }

    // Check if user is authenticated and has valid data
    if (!isAuthenticated || !user || !user._id) {
      // User not logged in - show signup modal
      dispatch(showSignupModal());
      return;
    }

    // Check if user role is available and correct
    if (!user.role) {
      alert('User role is not available. Please refresh the page and try again.');
      return;
    }

    if (user.role !== 'organizer') {
      // User logged in but not organizer - show error or redirect
      alert('Only organizers can subscribe to Pro plans');
      return;
    }

    // 🚨 NEW: Check if user already has active subscription or trial
    if (subscriptionData?.success && subscriptionData.subscription) {
      const subscription = subscriptionData.subscription;
      
      if (subscription.isActive || subscription.isTrialActive) {
        if (subscription.isTrialActive) {
          const daysRemaining = subscription.trialDaysRemaining;
          alert(`You already have an active trial with ${daysRemaining} days remaining. Your trial will automatically convert to a paid subscription.`);
        } else {
          alert('You already have an active subscription. Please manage your subscription from your dashboard.');
        }
        return;
      }
    }

    // User is organizer with no active subscription - proceed to subscription flow
    console.log('Setting selected plan:', currentPlan);
    dispatch(setSelectedPlan(currentPlan));
    dispatch(showCompleteSubscriptionModal());
  };

  // Handle signup success
  const handleSignupSuccess = () => {
    if (!currentPlan) {
      alert('No subscription plans available. Please try again later.');
      return;
    }
    dispatch(hideAllModals());
    dispatch(setSelectedPlan(currentPlan));
    dispatch(showCompleteSubscriptionModal());
  };

  // Handle login success
  const handleLoginSuccess = () => {
    if (!currentPlan) {
      alert('No subscription plans available. Please try again later.');
      return;
    }
    dispatch(hideAllModals());
    dispatch(setSelectedPlan(currentPlan));
    dispatch(showCompleteSubscriptionModal());
  };

  // Handle subscription success
  const handleSubscriptionSuccess = () => {
    console.log('=== handleSubscriptionSuccess called ===');
    console.log('Current modal states:', modalStates);
    dispatch(transitionToWelcome());
    console.log('Called transitionToWelcome()');
    console.log('===============================');
  };

  // Handle welcome modal actions
  const handleGoToDashboard = () => {
    dispatch(hideAllModals());
    window.location.href = '/dashboard';
  };

  const handleContinueExploring = () => {
    dispatch(hideAllModals());
  };

  // Handle modal switches
  const handleSwitchToSignup = () => {
    dispatch(showSignupModal());
  };

  // Toggle yearly/monthly
  const handleToggleYearly = (yearly: boolean) => {
    dispatch(setIsYearly(yearly));
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
                onClick={() => handleToggleYearly(!isYearly)}
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

        {/* Loading State */}
        {plansLoading && (
          <div className="flex justify-center mb-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading subscription plans...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {plansError && (
          <div className="flex justify-center mb-20">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <p className="text-red-600 mb-4">Failed to load subscription plans</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plans Display */}
        {!plansLoading && !plansError && currentPlan && (
          <div className="flex justify-center mb-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full relative">
              {currentPlan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#FF6B35] text-white px-4 py-1 rounded-full text-sm font-medium">
                    POPULAR
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{currentPlan.name}</h2>
                
                <div className="mb-6">
                  <span className="text-2xl font-bold text-[#FF6B35]">
                    ₹{currentPlan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 ml-2">
                    / {currentPlan.billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                
                {currentPlan.originalPrice && currentPlan.originalPrice > currentPlan.price && (
                  <div className="text-gray-500 line-through mb-6">
                    ₹{currentPlan.originalPrice.toLocaleString()}
                  </div>
                )}
                
                {currentPlan.discountText && (
                  <div className="text-green-600 text-sm mb-4 font-medium">
                    {currentPlan.discountText}
                  </div>
                )}
                
                <button 
                  onClick={handleStartTrial}
                  className="w-full bg-[#FF6B35] text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  {subscriptionData?.subscription?.isTrialActive 
                    ? `Trial Active (${subscriptionData.subscription.trialDaysRemaining} days left)`
                    : subscriptionData?.subscription?.isActive
                    ? 'Subscription Active'
                    : `Start Your ${currentPlan.trialDays}-Day Free Trial`
                  }
                </button>
              </div>

              <div className="space-y-4">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="text-[#FF6B35] mr-3 mt-1">✓</div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Plans Available */}
        {!plansLoading && !plansError && !currentPlan && (
          <div className="flex justify-center mb-20">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <p className="text-gray-600 mb-4">No subscription plans available</p>
                <p className="text-sm text-gray-500">Please contact support or try again later.</p>
              </div>
            </div>
          </div>
        )}

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
          <button 
            onClick={handleStartTrial}
            className="bg-[#FF6B35] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-orange-600 transition-colors"
          >
            {subscriptionData?.subscription?.isTrialActive 
              ? `Trial Active (${subscriptionData.subscription.trialDaysRemaining} days left)`
              : subscriptionData?.subscription?.isActive
              ? 'Subscription Active'
              : 'Start Your Free Trial Today'
            }
          </button>
        </div>
      </main>

      {/* Subscription Flow Modals */}
      {modalStates.showCompleteSubscriptionModal && (
        <>
          {console.log('=== MODAL PROPS DEBUG ===')}
          {console.log('selectedPlanFromRedux:', selectedPlanFromRedux)}
          {console.log('currentPlan:', currentPlan)}
          {console.log('Final selectedPlan:', selectedPlanFromRedux || currentPlan)}
          {console.log('isYearly:', isYearly)}
          {console.log('=========================')}
        </>
      )}
      <OrganizerSignupModal
        isOpen={modalStates.showSignupModal}
        onClose={() => dispatch(hideAllModals())}
        onSignupSuccess={handleSignupSuccess}
      />

      <OrganizerLoginModal
        isOpen={modalStates.showLoginModal}
        onClose={() => dispatch(hideAllModals())}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={handleSwitchToSignup}
      />

      <CompleteSubscriptionModal
        isOpen={modalStates.showCompleteSubscriptionModal}
        onClose={() => dispatch(hideAllModals())}
        onPaymentSuccess={handleSubscriptionSuccess}
        user={user || { _id: '', firstName: '', lastName: '', email: '', role: '' }}
        selectedPlan={(selectedPlanFromRedux || currentPlan) as any}
        isYearly={isYearly}
      />

      <WelcomeProModal
        isOpen={modalStates.showWelcomeModal}
        onClose={() => dispatch(hideAllModals())}
        onGoToDashboard={handleGoToDashboard}
        onContinueExploring={handleContinueExploring}
        subscriptionData={{
          subscription: {
            plan: (currentPlan || { name: 'Pro Plan', planType: 'monthly' }) as any,
            trialEndDate: currentPlan ? new Date(Date.now() + currentPlan.trialDays * 24 * 60 * 60 * 1000).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            daysRemaining: currentPlan?.trialDays || 7
          },
          user: user || { firstName: '', lastName: '', email: '', role: '' }
        }}
      />
    </div>
  );
};

export default VoxvertexPricingPage;