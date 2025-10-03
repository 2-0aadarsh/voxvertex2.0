'use client';

import { 
  Calendar, CreditCard, CheckCircle, AlertCircle, Settings, Crown, Zap, BarChart3, Shield, Users, Globe, MessageSquare, Award, TrendingUp, X, ChevronDown, Clock } from 'lucide-react';
import { useState } from 'react';
import { useGetPlansQuery, SubscriptionPlan, 
        useGetPaymentMethodsQuery, PaymentMethod
 } from "../../../store/api/paymentApi";
 import { useAuth } from "@/store/hooks";

interface Plan {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  total?: string;
  savings?: string;
  savePercent?: string;
  badge?: string;
  selected?: boolean;
}

interface PaymentOption {
  id: string;
  number: string;
  type: string;
  label?: string;
}

export default function Subscription() {
   const { user } = useAuth(); // get the logged-in user
  const userId = user?._id;
 

  // const plans: Plan[] = [
  //   {
  //     id: '1month',
  //     title: 'Monthly',
  //     subtitle: 'Billed monthly',
  //     price: '$9.99/mo',
  //     selected: false
  //   },
  //   {
  //     id: '6months',
  //     title: '6 Months',
  //     subtitle: 'Billed every 6 months',
  //     price: '$8.49/mo',
  //     total: '$50.95 total',
  //     savings: 'Save $8.99',
  //     savePercent: 'Save 15% compared to monthly',
  //     badge: 'Most Popular',
  //     selected: false
  //   },
  //   {
  //     id: '12months',
  //     title: 'Yearly',
  //     subtitle: 'Billed every 12 months',
  //     price: '$7.49/mo',
  //     total: '$89.91 total',
  //     savings: 'Save $29.97',
  //     savePercent: 'Save 25% compared to monthly',
  //     selected: false
  //   }
  // ];

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('1month');
  const [showPaymentOptions, setShowPaymentOptions] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<string>();
  const [autoRenewal, setAutoRenewal] = useState<boolean>(true);
  const [showTrialStatus, setShowTrialStatus] = useState<boolean>(false);

 const { data: plansData, isLoading: plansLoading, isError: plansError } = useGetPlansQuery();
const { data: paymentMethods, isLoading: paymentsLoading, isError: paymentsError } = useGetPaymentMethodsQuery(userId!, {
  skip: !userId,
});

   

 if (plansLoading || paymentsLoading) return <div>Loading...</div>;
if (plansError || paymentsError) return <div>Error loading data</div>;

  console.log("userId:", userId); // must print the actual id
console.log("paymentMethods:", paymentMethods); // will now show array or undefined


  // Map API response to UI-friendly structure
const plans: Plan[] =
  plansData?.map((plan: SubscriptionPlan) => ({
    id: plan._id,
    title: plan.name,
    subtitle: plan.billingPeriod,
    price: `$${plan.pricePerMonth.toFixed(2)}/mo`,
    total:
      plan.totalAmount !== plan.pricePerMonth
        ? `$${plan.totalAmount.toFixed(2)} total`
        : undefined,
    savePercent: plan.discountText || undefined,
    badge: plan.planType === "6months" ? "Most Popular" : undefined, // Example rule
  })) || [];


  const handleStartTrial = () => {
    // Add the trial start logic here
    setShowModal(false);
    setShowTrialStatus(true);
  };

  const getSelectedPlanInfo = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    return plan || plans[0];
  };

  const getBillingPeriodText = () => {
    switch(selectedPlan) {
      case '6months': return '6 Months';
      case '12months': return 'Yearly';
      default: return 'Monthly';
    }
  };

  const getDiscountText = () => {
    switch(selectedPlan) {
      case '6months': return '-15%';
      case '12months': return '-25%';
      default: return '';
    }
  };
  
  // const paymentOptions: PaymentOption[] = [
  //   {
  //     id: '4242',
  //     number: '**** **** **** 4242',
  //     type: 'VISA',
  //     label: 'Default'
  //   },
  //   {
  //     id: '5555',
  //     number: '**** **** **** 5555',
  //     type: 'Mastercard',
  //     label: ''
  //   }
  // ];
  
  const paymentOptions: PaymentOption[] =
    paymentMethods?.map((method) => ({
      id: method._id,
      number: method.details?.last4 ? `**** **** **** ${method.details.last4}` : "**** **** **** ****",
      type: method.type,
      label: method.isDefault ? "Default" : "",
    })) || [];
    console.log("log from subscription, payment method", paymentMethods)
  return (
    <div className="space-y-6">
      {showTrialStatus ? (
        <div className="max-w-full mx-auto bg-white rounded-lg border border-[#FF6B35]/30 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">Pro Plan</h2>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">Trial</span>
                </div>
                <p className="text-sm text-gray-600">7 days left in trial</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-2xl font-bold text-[#FF6B35]">{getSelectedPlanInfo().price.split('/')[0]}</span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="flex items-center justify-end gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Launch Offer</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Subscription Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Billing Period:</span>
                    <span className="font-medium text-gray-900">{getBillingPeriodText()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Auto Renewal:</span>
                    <div className="flex items-center gap-2">
                      <div className={`relative w-10 h-6 rounded-full transition-colors ${
                        autoRenewal ? 'bg-[#FF6B35]' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          autoRenewal ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </div>
                      <span className="font-medium text-gray-900">Enabled</span>
                    </div>
                  </div>
                  
                  {getDiscountText() && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">{getDiscountText()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Method</h4>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="font-mono text-sm">•••• •••• •••• 4242</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">VISA</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Unlimited Events</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Advanced Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Premium Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Custom Branding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">API Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">Team Collaboration</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="text-sm text-gray-600">+2 more features</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setShowModal(true)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Change Plan
              </button>
              <button 
                onClick={() => {
                  setShowTrialStatus(false);
                  setSelectedPlan('1month');
                }}
                className="px-6 py-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-[#FF6B35]/10 rounded-lg overflow-hidden max-w-full mx-auto bg-white shadow-sm">
          {/* Top section with orange background */}
          <div className="bg-orange-50 px-6 py-8 text-center">
            <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-6 h-6 text-white" />
            </div>
            
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Upgrade to Pro</h2>
            <p className="text-sm text-gray-600 mb-6">Unlock powerful features to grow your events business</p>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                <CheckCircle className="w-4 h-4" />
                Limited Time Offer
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                <AlertCircle className="w-4 h-4" />
                7-Day Free Trial
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg text-gray-400 line-through">$19.99</span>
              <span className="text-lg font-bold text-[#FF6B35]">$9.99</span>
              <span className="text-sm text-gray-600">/month</span>
            </div>
            
            <p className="text-sm text-green-600 font-medium">Save 50% with our launch offer</p>
          </div>

          <div className="p-6 bg-white">
            <div className="grid grid-cols-4 gap-6 mb-6 max-w-4xl mx-auto">
              <div className="text-center">
                <Zap className="w-5 h-5 text-[#FF6B35] mx-auto mb-2" />
                <p className="text-sm text-gray-700">Unlimited Events</p>
              </div>
              <div className="text-center">
                <BarChart3 className="w-5 h-5 text-[#FF6B35] mx-auto mb-2" />
                <p className="text-sm text-gray-700">Advanced Analytics</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 text-[#FF6B35] mx-auto mb-2" />
                <p className="text-sm text-gray-700">Premium Support</p>
              </div>
              <div className="text-center">
                <Users className="w-5 h-5 text-[#FF6B35] mx-auto mb-2" />
                <p className="text-sm text-gray-700">Team Collaboration</p>
              </div>
              <div className="text-center">
                <Globe className="w-5 h-5 text-[#FF6B35] mx-auto mb-2" />
                <p className="text-sm text-gray-700">API Access</p>
              </div>
              <div className="text-center">
                <MessageSquare className="w-5 h-5 text-[#FF6B35] mx-auto mb-2" />
                <p className="text-sm text-gray-700">Priority Processing</p>
              </div>
              <div className="text-center">
                <Award className="w-5 h-5 text-[#FF6B35] mx-auto mb-2" />
                <p className="text-sm text-gray-700">Custom Branding</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-5 h-5 text-[#FF6B35] mx-auto mb-2" />
                <p className="text-sm text-gray-700">Advanced Reporting</p>
              </div>
            </div>
            
            <div className="max-w-sm mx-auto">
              <button 
                onClick={() => setShowModal(true)}
                className="w-full bg-[#FF6B35] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#FF6B35]/90 transition-colors mb-3"
              >
                Start Free Trial
              </button>
              
              <p className="text-sm text-gray-500 text-center">
                No credit card required for trial. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 ">
              <div>
                <h2 className="text-lg font-semibold text-[#FF6B35]">Subscribe to Pro Plan</h2>
                <p className="text-sm text-gray-600">Choose your billing period and payment method. Your trial starts immediately.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-[#FF6B35] mb-4">Choose Billing Period</h3>
              <div className="space-y-3 mb-8">
                {plans.map((plan: Plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? 'border-[#FF6B35] bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2 left-4 bg-[#FF6B35] text-white text-sm px-2 py-1 rounded">
                        {plan.badge}
                      </span>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan === plan.id ? 'border-[#FF6B35]' : 'border-gray-300'
                        }`}>
                          {selectedPlan === plan.id && (
                            <div className="w-2 h-2 bg-[#FF6B35] rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{plan.title}</p>
                          <p className="text-sm text-gray-600">{plan.subtitle}</p>
                          {plan.savePercent && (
                            <p className="text-sm text-green-600 font-medium">{plan.savePercent}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#FF6B35]">{plan.price}</p>
                        {plan.total && (
                          <p className="text-sm text-gray-600">{plan.total}</p>
                        )}
                        {plan.savings && (
                          <p className="text-sm text-green-600 font-medium">{plan.savings}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-medium text-[#FF6B35] mb-4">Payment Method</h3>
              <div className="mb-4">
                <button 
                  onClick={() => setShowPaymentOptions(!showPaymentOptions)}
                  className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-between text-left hover:border-gray-400"
                >
                  <span className="text-sm text-gray-600">
                    {selectedPayment ? paymentOptions.find(opt => opt.id === selectedPayment)?.number : 'Select a payment method'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showPaymentOptions ? 'rotate-180' : ''}`} />
                </button>

                {showPaymentOptions && (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                    {paymentOptions.map((option: PaymentOption) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSelectedPayment(option.id);
                          setShowPaymentOptions(false);
                        }}
                        className={`w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          selectedPayment === option.id ? 'border-[#FF6B35] bg-orange-50' : ''
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-mono">{option.number}</span>
                        <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">{option.type}</span>
                        {option.label && (
                          <span className="text-sm text-gray-500">{option.label}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setAutoRenewal(!autoRenewal)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoRenewal ? 'bg-[#FF6B35]' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    autoRenewal ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
                <span className="text-sm font-medium text-gray-700">Enable auto-renewal (recommended)</span>
              </div>

              <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#FF6B35]">Free Trial:</p>
                    <p className="text-sm text-[#FF6B35]">
                      Try Pro for 7 days at no cost. Cancel anytime during the trial and you won't be charged. 
                      After the trial, you'll be charged $9.99 per month.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStartTrial}
                  className="flex-1 px-4 py-3 bg-[#FF6B35] text-white rounded-lg text-sm font-medium hover:bg-[#FF6B35]/90"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}