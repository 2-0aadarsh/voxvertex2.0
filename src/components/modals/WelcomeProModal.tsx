'use client';
import React from 'react';
import { X, CheckCircle, Star, ArrowRight } from 'lucide-react';

interface SubscriptionData {
  subscription: {
    plan: {
      name: string;
      planType: string;
    };
    trialEndDate: string;
    daysRemaining: number;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface WelcomeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToDashboard: () => void;
  onContinueExploring: () => void;
  subscriptionData: SubscriptionData;
}

export default function WelcomeProModal({
  isOpen,
  onClose,
  onGoToDashboard,
  onContinueExploring,
  subscriptionData
}: WelcomeProModalProps) {
  console.log('=== WelcomeProModal DEBUG ===');
  console.log('isOpen:', isOpen);
  console.log('subscriptionData:', subscriptionData);
  console.log('=============================');
  
  if (!isOpen) return null;

  const formatTrialEndDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const nextSteps = [
    "Check your email for a welcome message with getting started tips",
    "Access your dashboard to create your first event",
    "Explore all Pro features during your trial period"
  ];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Welcome to Voxvertex Pro!</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-orange-600 mb-2">Welcome to Voxvertex Pro!</h3>
            <p className="text-gray-600">Your 7-day free trial has started successfully.</p>
          </div>

          {/* Trial Information */}
          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-orange-800 mb-1">Free Trial Until</p>
              <p className="text-xl font-bold text-orange-600">
                {formatTrialEndDate(subscriptionData.subscription.trialEndDate)}
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4" />
                  {subscriptionData.subscription.plan.name} ({subscriptionData.subscription.plan.planType})
                </span>
              </div>
            </div>
          </div>

          {/* Account Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Account Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{subscriptionData.user.firstName} {subscriptionData.user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{subscriptionData.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Type:</span>
                <span className="font-medium">{subscriptionData.user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{subscriptionData.subscription.plan.name} ({subscriptionData.subscription.plan.planType})</span>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">What's Next?</h4>
            <div className="space-y-3">
              {nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-orange-600" />
                  </div>
                  <p className="text-gray-700 text-sm">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onGoToDashboard}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={onContinueExploring}
              className="w-full border border-orange-500 text-orange-500 py-3 px-6 rounded-lg font-medium hover:bg-orange-50 transition-colors"
            >
              Continue Exploring
            </button>
          </div>

          {/* Important Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              <strong>Remember:</strong> You won't be charged until your trial ends. You can cancel anytime during the trial period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
