'use client';
import React, { useState } from 'react';
import { X, CreditCard, User, MapPin } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { subscriptionApi } from '@/store/slices/subscriptionSlice';

interface SubscriptionPlan {
  _id: string;
  name: string;
  billingCycle: string;
  price: number;
  originalPrice?: number;
  currency: string;
  features: string[];
  trialDays: number;
  discountText?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface CompleteSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (subscriptionData: unknown) => void;
  user: User;
  selectedPlan: SubscriptionPlan;
  isYearly: boolean;
}

// Razorpay types (use unknown cast to avoid conflicts)
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  customer_id?: string;
  prefill?: {
    name: string;
    email: string;
    contact: string;
  };
  theme?: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

export default function CompleteSubscriptionModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  user,
  selectedPlan,
  isYearly
}: CompleteSubscriptionModalProps) {
  
  // Debug logging
  console.log('=== CompleteSubscriptionModal DEBUG ===');
  console.log('selectedPlan:', selectedPlan);
  console.log('isYearly:', isYearly);
  console.log('user:', user);
  console.log('=====================================');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // For cache invalidation
  const dispatch = useDispatch();

  const calculateTotal = () => {
    if (!selectedPlan || !selectedPlan.price) {
      return 0;
    }
    // Use the price from the plan directly (it's already calculated with discounts)
    return selectedPlan.price;
  };

  const handleStartTrial = async () => {
    setIsProcessing(true);
    
    try {
      // Validate user data
      if (!user._id) {
        setErrors({ general: 'User ID is required. Please ensure you are logged in.' });
        setIsProcessing(false);
        return;
      }

      console.log('🚀 Starting Razorpay payment validation flow...');

      // Step 1: Create ₹1 validation order from backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const validationResponse = await fetch(`${API_URL}/subscriptions/validate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user._id,
          planId: selectedPlan._id
        })
      });

      const validationData = await validationResponse.json();

      if (!validationData.success) {
        setErrors({ general: validationData.error || 'Failed to create validation order' });
        setIsProcessing(false);
        return;
      }

      console.log('✅ Validation order created:', validationData);

      // Step 2: Load Razorpay SDK dynamically
      const loadRazorpayScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrors({ general: 'Failed to load Razorpay SDK. Please try again.' });
        setIsProcessing(false);
        return;
      }

      // Step 3: Open Razorpay Checkout for ₹1 validation
      const options = {
        key: validationData.keyId,
        amount: validationData.amount, // ₹1 in paise
        currency: validationData.currency,
        name: 'Voxvertex Pro Subscription',
        description: `Validate payment method for ${selectedPlan.name}`,
        order_id: validationData.orderId,
        customer_id: validationData.customerId,
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: user.email // Use email if mobile not available
        },
        theme: {
          color: '#FF6B35'
        },
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          // Payment successful - verify and start trial
          console.log('✅ Razorpay payment successful:', response);
          
          try {
            // Step 4: Verify payment and start trial
            const verifyResponse = await fetch(`${API_URL}/subscriptions/verify-and-start-trial`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                userId: user._id,
                planId: selectedPlan._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              console.log('✅ Trial started successfully with validated payment');
              
              // Invalidate subscription cache to refresh subscription status
              dispatch(subscriptionApi.util.invalidateTags(['Subscription']));
              
              onPaymentSuccess(verifyData);
              // Let parent handle modal transitions
            } else {
              setErrors({ general: verifyData.error || 'Failed to start trial' });
            }
          } catch (verifyError) {
            console.error('❌ Verification error:', verifyError);
            setErrors({ general: 'Failed to verify payment. Please contact support.' });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('⚠️ Razorpay checkout dismissed');
            setIsProcessing(false);
            setErrors({ general: 'Payment cancelled. Please try again to start your trial.' });
          }
        }
      };

      // Open Razorpay Checkout
      const RazorpayClass = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;
      const razorpay = new RazorpayClass(options);
      razorpay.on('payment.failed', function (response: RazorpayErrorResponse) {
        console.error('❌ Payment failed:', response.error);
        setIsProcessing(false);
        setErrors({ 
          general: response.error.description || 'Payment failed. Please check your card details and try again.' 
        });
      });
      
      razorpay.open();

    } catch (error: unknown) {
      console.error('Trial start error:', error);
      setErrors({ 
        general: (error as { data?: { message?: string }; message?: string })?.data?.message || (error as { message?: string })?.message || 'Failed to start trial. Please try again.' 
      });
      setIsProcessing(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Complete Your Subscription</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.general}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Order Summary & Account Details */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3">
                  {selectedPlan ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{selectedPlan.name}:</span>
                        <span className="font-semibold">₹{calculateTotal().toFixed(0)}</span>
                      </div>
                      
                      {selectedPlan.originalPrice && selectedPlan.originalPrice > selectedPlan.price && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 line-through">Original Price:</span>
                          <span className="text-gray-500 line-through">₹{selectedPlan.originalPrice.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total (including taxes):</span>
                          <span>₹{calculateTotal().toFixed(0)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-red-600 text-sm">
                      Error: Subscription plan not found
                    </div>
                  )}
                </div>

                {/* Trial Notice */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">7-Day Free Trial Included</p>
                  <p className="text-xs text-green-600 mt-1">
                    You won&apos;t be charged until your trial ends. Cancel anytime during the trial.
                  </p>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Event Organizer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Payment Info */}
            <div className="space-y-6">
              {/* Payment Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  Payment Information
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 mt-0.5">🔒</div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Secure Payment Processing</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Your payment is processed securely through Razorpay. We&apos;ll validate your payment method with a ₹1 authorization (immediately released).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <div className="text-green-600 mt-0.5">✓</div>
                      <div>
                        <p className="text-sm font-medium text-green-900">7-Day Free Trial</p>
                        <p className="text-xs text-green-700 mt-1">
                          Start with a free trial. You&apos;ll be charged ₹{selectedPlan.price} after the trial period ends.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  Billing Address
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="Street address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                      <option value="">Select state</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      placeholder="123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Pay Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Auto-Pay Notice</h4>
                <p className="text-sm text-gray-700">
                  After your 7-day free trial, your subscription will automatically renew at ₹{selectedPlan.price} per {selectedPlan.billingCycle === 'monthly' ? 'month' : 'year'}. 
                  You can cancel anytime during the trial period from your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartTrial}
              disabled={isProcessing}
              className="px-8 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Start Free Trial'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
