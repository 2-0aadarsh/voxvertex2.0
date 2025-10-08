"use client";

import { 
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Settings,
  Crown,
  Zap,
  BarChart3,
  Shield,
  Users,
  Globe,
  MessageSquare,
  Award,
  TrendingUp,
  X,
  ChevronDown,
  Clock,
  Plus,
} from "lucide-react";
import { useState } from "react";
import {
  useGetPlansQuery,
  SubscriptionPlan,
  useGetPaymentMethodsQuery,
  PaymentMethod,
  useAddPaymentMethodMutation,
  useSubscribePlanMutation,
  useGetSubscriptionStatusQuery,
  useCancelSubscriptionMutation,
  useChangeSubscriptionPlanMutation,
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
  const [selectedPlan, setSelectedPlan] = useState<string>("1month");
  const [showPaymentOptions, setShowPaymentOptions] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<string>();
  const [activePaymentTab, setActivePaymentTab] = useState<
    "saved" | "new" | "digital"
  >("saved");
  const [autoRenewal, setAutoRenewal] = useState<boolean>(true);
  const [showTrialStatus, setShowTrialStatus] = useState<boolean>(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<string>("");

  // New card form state
  const [newCardHolder, setNewCardHolder] = useState<string>("");
  const [newCardNumber, setNewCardNumber] = useState<string>("");
  const [newCardMonth, setNewCardMonth] = useState<string>("");
  const [newCardYear, setNewCardYear] = useState<string>("");
  const [newCardCVV, setNewCardCVV] = useState<string>("");

  // Digital pay form state
  const [selectedPaymentType, setSelectedPaymentType] =
    useState<string>("UPI (India)");
  const [upiId, setUpiId] = useState<string>("user@upi");
  const [showPaymentTypeDropdown, setShowPaymentTypeDropdown] =
    useState<boolean>(false);

  const {
    data: plansData,
    isLoading: plansLoading,
    isError: plansError,
  } = useGetPlansQuery();
  const {
    data: paymentMethods,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useGetPaymentMethodsQuery(userId!, {
  skip: !userId,
});

  const [addPaymentMethod, { isLoading: isAdding }] =
    useAddPaymentMethodMutation();
  const [subscribePlan, { isLoading: isSubscribing }] =
    useSubscribePlanMutation();
  const [cancelSubscription, { isLoading: isCancelling }] =
    useCancelSubscriptionMutation();
  const [changeSubscriptionPlan, { isLoading: isChangingPlan }] =
    useChangeSubscriptionPlanMutation();

  // Get subscription status
  const {
    data: subscriptionStatus,
    isLoading: subscriptionLoading,
    refetch: refetchSubscription,
  } = useGetSubscriptionStatusQuery(userId!, {
    skip: !userId,
  });

 if (plansLoading || paymentsLoading) return <div>Loading...</div>;
if (plansError || paymentsError) return <div>Error loading data</div>;

  console.log("userId:", userId); // must print the actual id
console.log("paymentMethods:", paymentMethods); // will now show array or undefined
  console.log("plansData:", plansData); // Debug plans data structure
  console.log("plansData.plans:", plansData?.plans); // Debug plans array
  console.log("plansData.plans length:", plansData?.plans?.length); // Debug plans count
  console.log(
    "plansData.plans details:",
    plansData?.plans?.map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      isActive: p.isActive,
    }))
  ); // Debug plan details

  // Map API response to UI-friendly structure
const plans: Plan[] =
    plansData?.plans?.map((plan: SubscriptionPlan) => ({
    id: plan._id,
      title: plan.name || "Unnamed Plan",
      subtitle: plan.billingPeriod || "Monthly",
      price: `$${(plan.price || 0).toFixed(2)}/mo`,
    total:
        plan.originalPrice && plan.originalPrice !== plan.price
          ? `$${(plan.originalPrice || 0).toFixed(2)} total`
        : undefined,
    savePercent: plan.discountText || undefined,
      badge: plan.billingCycle === "6months" ? "Most Popular" : undefined, // Example rule
  })) || [];

  const handleStartTrial = async () => {
    if (!userId) return alert("User not found");

    try {
      // Resolve plan id from selection
      const planId = (plans.find((p) => p.id === selectedPlan) || plans[0])?.id;
      if (!planId) return alert("Plan not available");

      let paymentMethodId: string | undefined = undefined;

      if (activePaymentTab === "saved") {
        if (!selectedPayment) {
          return alert("Please select a saved payment method");
        }
        paymentMethodId = selectedPayment;
      } else if (activePaymentTab === "new") {
        // Create the new card first, then use its id
        if (
          !newCardHolder ||
          !newCardNumber ||
          !newCardMonth ||
          !newCardYear ||
          !newCardCVV
        ) {
          return alert("Please complete the new card form");
        }
        const details = {
          name: newCardHolder,
          number: newCardNumber.replace(/\s/g, ""),
          last4: newCardNumber.replace(/\s/g, "").slice(-4),
          expiry: `${newCardMonth}/${newCardYear}`,
          addedAt: new Date().toISOString(),
        };
        const created: any = await addPaymentMethod({
          userId,
          type: "card",
          details,
        }).unwrap();
        paymentMethodId = created?._id || created?.id || created?.data?._id;
        if (!paymentMethodId) {
          // fallback: refresh list and pick the most recent last4 match
          const match = (paymentMethods || []).find(
            (m) => m.details?.last4 === details.last4
          );
          paymentMethodId = match?._id;
        }
      } else if (activePaymentTab === "digital") {
        // Create or reuse a UPI payment method for the user
        if (!upiId) return alert("Please enter your UPI ID");
        const details = { upiId, addedAt: new Date().toISOString() } as any;
        const created: any = await addPaymentMethod({
          userId,
          type: "upi",
          details,
        }).unwrap();
        paymentMethodId = created?._id || created?.id || created?.data?._id;
        if (!paymentMethodId) {
          const match = (paymentMethods || []).find(
            (m) => m.type === "upi" && (m as any).details?.upiId === upiId
          );
          paymentMethodId = match?._id;
        }
      }

      if (!paymentMethodId) return alert("Could not resolve payment method");

      console.log("Starting subscription with:", {
        userId,
        planId,
        paymentMethodId,
      });
      const result = await subscribePlan({
        userId,
        planId,
        paymentMethodId,
      }).unwrap();
      console.log("Subscription result:", result);

    setShowModal(false);
    setShowTrialStatus(true);
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err?.data?.message || "Failed to start trial. Please try again.";
      const errorCode = err?.data?.code;

      // Show specific error messages based on error codes
      if (errorCode === "INVALID_CARD_NUMBER") {
        alert("Invalid card number. Please check your card details.");
      } else if (errorCode === "CARD_EXPIRED") {
        alert("Your card has expired. Please use a different payment method.");
      } else if (errorCode === "INSUFFICIENT_FUNDS") {
        alert(
          "Insufficient funds in your wallet. Please add more funds or use a different payment method."
        );
      } else if (errorCode === "INVALID_UPI_ID") {
        alert("Invalid UPI ID format. Please check your UPI ID.");
      } else if (errorCode === "INVALID_TEST_CARD") {
        alert(
          "For testing, please use these test card numbers:\n\n• Visa: 4111111111111111\n• Mastercard: 5555555555554444\n• Amex: 378282246310005\n\nUse any future expiry date (e.g., 12/25) and any CVV."
        );
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleAddNewCard = async () => {
    if (!userId) return;

    try {
      const details = {
        name: newCardHolder,
        number: newCardNumber.replace(/\s/g, ""),
        last4: newCardNumber.replace(/\s/g, "").slice(-4),
        expiry: `${newCardMonth}/${newCardYear}`,
        addedAt: new Date().toISOString(),
      };

      await addPaymentMethod({
        userId,
        type: "card",
        details,
      }).unwrap();

      // Reset form
      setNewCardHolder("");
      setNewCardNumber("");
      setNewCardMonth("");
      setNewCardYear("");
      setNewCardCVV("");

      // Switch back to saved cards tab
      setActivePaymentTab("saved");
    } catch (err) {
      console.error("Failed to add credit card", err);
    }
  };

  const getSelectedPlanInfo = () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    return plan || plans[0];
  };

  const getBillingPeriodText = () => {
    switch (selectedPlan) {
      case "6months":
        return "6 Months";
      case "12months":
        return "Yearly";
      default:
        return "Monthly";
    }
  };

  const getDiscountText = () => {
    switch (selectedPlan) {
      case "6months":
        return "-15%";
      case "12months":
        return "-25%";
      default:
        return "";
    }
  };

  const handleCancelSubscription = async () => {
    if (!userId) return;

    try {
      await cancelSubscription({ userId }).unwrap();
      setShowCancelModal(false);
      refetchSubscription();
      alert(
        "Subscription cancelled successfully. You will not be charged after the trial period."
      );
    } catch (err: any) {
      console.error(err);
      alert(
        err?.data?.message || "Failed to cancel subscription. Please try again."
      );
    }
  };

  const handleChangePlan = async () => {
    if (!userId || !selectedNewPlan) return;

    try {
      console.log("Changing plan with:", {
        userId,
        newPlanId: selectedNewPlan,
      });
      // Use the dedicated change plan API
      const result = await changeSubscriptionPlan({
        userId,
        newPlanId: selectedNewPlan,
      }).unwrap();
      console.log("Change plan result:", result);

      setShowChangePlanModal(false);
      setSelectedNewPlan("");
      refetchSubscription();

      alert(
        "Plan changed successfully! Your trial continues with the new plan."
      );
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err?.data?.message || "Failed to change plan. Please try again.";
      const errorCode = err?.data?.code;

      // Show specific error messages based on error codes
      if (errorCode === "INVALID_CARD_NUMBER") {
        alert("Invalid card number. Please check your card details.");
      } else if (errorCode === "CARD_EXPIRED") {
        alert("Your card has expired. Please use a different payment method.");
      } else if (errorCode === "INSUFFICIENT_FUNDS") {
        alert(
          "Insufficient funds in your wallet. Please add more funds or use a different payment method."
        );
      } else if (errorCode === "INVALID_UPI_ID") {
        alert("Invalid UPI ID format. Please check your UPI ID.");
      } else if (errorCode === "INVALID_TEST_CARD") {
        alert(
          "For testing, please use these test card numbers:\n\n• Visa: 4111111111111111\n• Mastercard: 5555555555554444\n• Amex: 378282246310005\n\nUse any future expiry date (e.g., 12/25) and any CVV."
        );
      } else {
        alert(errorMessage);
      }
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
      number: method.details?.last4
        ? `**** **** **** ${method.details.last4}`
        : "**** **** **** ****",
      type: method.type,
      label: method.isDefault ? "Default" : "",
    })) || [];
  console.log("log from subscription, payment method", paymentMethods);
  return (
    <div className="space-y-6">
      {/* Initial Subscription Offer - Show when no active subscription */}
      {!subscriptionStatus?.hasSubscription ||
      !subscriptionStatus?.subscription?.isActive ? (
        <div className="max-w-full mx-auto bg-white rounded-lg border border-[#FF6B35]/30 shadow-sm">
          <div className="text-center p-8">
            {/* Crown Icon */}
            <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Upgrade to Pro
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Unlock powerful features to grow your events business.
            </p>

            {/* Badges */}
            <div className="flex justify-center gap-3 mb-6">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Limited Time Offer
              </span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                7-Day Free Trial
              </span>
            </div>

            {/* Pricing */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl text-gray-400 line-through">
                  $19.99
                </span>
                <span className="text-4xl font-bold text-[#FF6B35]">
                  $9.99/month
                </span>
              </div>
              <p className="text-green-600 font-medium">
                Save 50% with our launch offer
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col items-center p-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Unlimited Events
                </span>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Advanced Analytics
                </span>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Premium Support
                </span>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Team Collaboration
                </span>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <Globe className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  API Access
                </span>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                  <MessageSquare className="w-4 h-4 text-pink-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Priority Processing
                </span>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                  <Crown className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Custom Branding
                </span>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Advanced Reporting
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#FF6B35] text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-[#FF6B35]/90 transition-colors mb-4"
            >
              Start Free Trial
            </button>

            {/* Disclaimer */}
            <p className="text-sm text-gray-500">
              No credit card required for trial. Cancel anytime.
            </p>
          </div>
        </div>
      ) : subscriptionStatus?.hasSubscription &&
        subscriptionStatus?.subscription ? (
        <div className="max-w-full mx-auto bg-white rounded-lg border border-[#FF6B35]/30 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {subscriptionStatus.subscription.plan?.name || "Pro Plan"}
                  </h2>
                  {subscriptionStatus.subscription.isTrialActive ? (
                    <>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Trial
                      </span>
                      <span className="text-sm text-gray-600">
                        {subscriptionStatus.subscription.daysRemaining} days
                        left in trial
                      </span>
                    </>
                  ) : subscriptionStatus.subscription.cancelledAt ? (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                      Canceled
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                      Active
                    </span>
                  )}
                </div>
                {subscriptionStatus.subscription.cancelledAt && (
                  <p className="text-sm text-gray-600">
                    Next billing:{" "}
                    {new Date(
                      subscriptionStatus.subscription.endDate
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-2xl font-bold text-[#FF6B35]">
                  $
                  {(
                    subscriptionStatus.subscription.plan?.pricePerMonth || 9.99
                  ).toFixed(2)}
                  /month
                </span>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Subscription Details
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Billing Period:</span>
                    <span className="font-medium text-gray-900">
                      {subscriptionStatus.subscription.plan?.billingPeriod ||
                        "Monthly"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Auto Renewal:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          subscriptionStatus.subscription.autoRenew
                            ? "bg-[#FF6B35]"
                            : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            subscriptionStatus.subscription.autoRenew
                              ? "translate-x-4"
                              : "translate-x-0.5"
                          }`}
                        />
                      </div>
                      <span className="font-medium text-gray-900">
                        {subscriptionStatus.subscription.autoRenew
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Payment Method
                  </h4>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="font-mono text-sm">
                      •••• •••• •••• 4242
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                      VISA
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column - Plan Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Plan Features
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`relative w-10 h-6 rounded-full transition-colors ${
                      subscriptionStatus.subscription.autoRenew
                        ? "bg-[#FF6B35]"
                        : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        subscriptionStatus.subscription.autoRenew
                          ? "translate-x-4"
                          : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <span className="font-medium text-gray-900">Monthly</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Unlimited Events
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Advanced Analytics
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Premium Support
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Custom Branding
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">API Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Team Collaboration
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">+2 more features</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setShowChangePlanModal(true)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Change Plan
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      ) : showTrialStatus ? (
        <div className="max-w-full mx-auto bg-white rounded-lg border border-[#FF6B35]/30 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pro Plan
                  </h2>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                    Trial
                  </span>
                </div>
                <p className="text-sm text-gray-600">7 days left in trial</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-2xl font-bold text-[#FF6B35]">
                  {getSelectedPlanInfo().price.split("/")[0]}
                </span>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Subscription Details
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Billing Period:</span>
                    <span className="font-medium text-gray-900">
                      {getBillingPeriodText()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Auto Renewal:</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          autoRenewal ? "bg-[#FF6B35]" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            autoRenewal ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                      <span className="font-medium text-gray-900">Enabled</span>
                    </div>
                  </div>
                  
                  {getDiscountText() && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">
                        {getDiscountText()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Payment Method
                  </h4>
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="font-mono text-sm">
                      •••• •••• •••• 4242
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-medium">
                      VISA
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Plan Features
                </h3>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Unlimited Events
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Advanced Analytics
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Premium Support
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Custom Branding
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">API Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Team Collaboration
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="text-sm text-gray-600">
                    +2 more features
                  </span>
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
                  setSelectedPlan("1month");
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
            
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Upgrade to Pro
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Unlock powerful features to grow your events business
            </p>
            
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
            
            <p className="text-sm text-green-600 font-medium">
              Save 50% with our launch offer
            </p>
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Subscribe to Pro Plan
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choose your billing period and payment method. Your trial
                  starts immediately.
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Choose Billing Period */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Choose Billing Period
                </h3>
                <div className="space-y-4">
                {plans.map((plan: Plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                          ? "border-[#FF6B35] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {plan.badge && (
                        <span className="absolute -top-2 left-4 bg-[#FF6B35] text-white text-xs px-2 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              selectedPlan === plan.id
                                ? "border-[#FF6B35]"
                                : "border-gray-300"
                            }`}
                          >
                          {selectedPlan === plan.id && (
                            <div className="w-2 h-2 bg-[#FF6B35] rounded-full" />
                          )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                              {plan.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {plan.subtitle}
                            </p>
                          {plan.savePercent && (
                              <p className="text-sm text-green-600 font-medium">
                                {plan.savePercent}
                              </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                          <p className="text-lg font-bold text-[#FF6B35]">
                            {plan.price}
                          </p>
                        {plan.total && (
                            <p className="text-sm text-gray-600">
                              {plan.total}
                            </p>
                        )}
                        {plan.savings && (
                            <p className="text-sm text-green-600 font-medium">
                              {plan.savings}
                            </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Method
                </h3>

                {/* Payment Method Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActivePaymentTab("saved")}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                      activePaymentTab === "saved"
                        ? "border-[#FF6B35] text-[#FF6B35]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Saved Cards
                  </button>
                  <button
                    onClick={() => setActivePaymentTab("new")}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                      activePaymentTab === "new"
                        ? "border-[#FF6B35] text-[#FF6B35]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    New Card
                  </button>
                  <button
                    onClick={() => setActivePaymentTab("digital")}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
                      activePaymentTab === "digital"
                        ? "border-[#FF6B35] text-[#FF6B35]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Digital Pay
                  </button>
                </div>

                {/* Payment Method Selection */}
                {activePaymentTab === "saved" && (
                  <div className="border border-gray-300 rounded-lg p-3">
                <button 
                  onClick={() => setShowPaymentOptions(!showPaymentOptions)}
                      className="w-full flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">
                        {selectedPayment
                          ? paymentOptions.find(
                              (opt) => opt.id === selectedPayment
                            )?.number
                          : "Select a payment method"}
                  </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          showPaymentOptions ? "rotate-180" : ""
                        }`}
                      />
                </button>

                    {showPaymentOptions && paymentOptions.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                    {paymentOptions.map((option: PaymentOption) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSelectedPayment(option.id);
                          setShowPaymentOptions(false);
                        }}
                        className={`w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                              selectedPayment === option.id
                                ? "bg-orange-50"
                                : ""
                            }`}
                          >
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-mono">
                              {option.number}
                            </span>
                            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                              {option.type}
                            </span>
                        {option.label && (
                              <span className="text-xs text-gray-500">
                                {option.label}
                              </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                    {paymentOptions.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          No saved payment methods
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Add a payment method in the Payment Methods tab
                        </p>
              </div>
                    )}
                  </div>
                )}

                {activePaymentTab === "new" && (
                  <div className="space-y-4">
                    {/* Cardholder Name */}
                    <div className="relative">
                      <input
                        type="text"
                        id="newCardHolder"
                        value={newCardHolder}
                        onChange={(e) => setNewCardHolder(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                        placeholder=" "
                      />
                      <label
                        htmlFor="newCardHolder"
                        className="absolute left-4 -top-2.5 bg-white px-2 text-xs text-[#FF6B35] font-medium"
                      >
                        Cardholder Name
                      </label>
                    </div>

                    {/* Card Number */}
                    <div className="relative">
                      <input
                        type="text"
                        id="newCardNumber"
                        value={newCardNumber}
                        onChange={(e) =>
                          setNewCardNumber(
                            e.target.value
                              .replace(/\s/g, "")
                              .replace(/(.{4})/g, "$1 ")
                              .trim()
                          )
                        }
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                        placeholder=" "
                        maxLength={19}
                      />
                      <label
                        htmlFor="newCardNumber"
                        className="absolute left-4 -top-2.5 bg-white px-2 text-xs text-[#FF6B35] font-medium"
                      >
                        Card Number
                      </label>
                    </div>

                    {/* Month, Year, CVV */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="relative">
                        <select
                          id="newCardMonth"
                          value={newCardMonth}
                          onChange={(e) => setNewCardMonth(e.target.value)}
                          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] appearance-none bg-white"
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option
                              key={i + 1}
                              value={String(i + 1).padStart(2, "0")}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <label
                          htmlFor="newCardMonth"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-xs text-[#FF6B35] font-medium"
                        >
                          Month
                        </label>
                      </div>

                      <div className="relative">
                        <select
                          id="newCardYear"
                          value={newCardYear}
                          onChange={(e) => setNewCardYear(e.target.value)}
                          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] appearance-none bg-white"
                        >
                          <option value="">YYYY</option>
                          {Array.from({ length: 10 }, (_, i) => (
                            <option key={i} value={2024 + i}>
                              {2024 + i}
                            </option>
                          ))}
                        </select>
                        <label
                          htmlFor="newCardYear"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-xs text-[#FF6B35] font-medium"
                        >
                          Year
                        </label>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          id="newCardCVV"
                          value={newCardCVV}
                          onChange={(e) =>
                            setNewCardCVV(
                              e.target.value.replace(/\D/g, "").slice(0, 4)
                            )
                          }
                          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                          placeholder=" "
                          maxLength={4}
                        />
                        <label
                          htmlFor="newCardCVV"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-xs text-[#FF6B35] font-medium"
                        >
                          CVV
                        </label>
                      </div>
                    </div>

                    {/* Add Card Button */}
                    <button
                      onClick={handleAddNewCard}
                      disabled={
                        isAdding ||
                        !newCardHolder ||
                        !newCardNumber ||
                        !newCardMonth ||
                        !newCardYear ||
                        !newCardCVV
                      }
                      className="w-full bg-[#FF6B35] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAdding ? "Adding..." : "Add Card"}
                    </button>
                  </div>
                )}

                {activePaymentTab === "digital" && (
                  <div className="space-y-4">
                    {/* Payment Type Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowPaymentTypeDropdown(!showPaymentTypeDropdown)
                        }
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg flex items-center justify-between text-left hover:border-gray-400"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                            <CreditCard className="w-3 h-3 text-blue-600" />
                          </div>
                          <span className="text-gray-900">
                            {selectedPaymentType}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            showPaymentTypeDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {showPaymentTypeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 border border-gray-200 rounded-lg bg-white shadow-lg z-10">
                          <button
                            onClick={() => {
                              setSelectedPaymentType("UPI (India)");
                              setShowPaymentTypeDropdown(false);
                            }}
                            className="w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 border-b border-gray-100"
                          >
                            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                              <CreditCard className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              UPI (India)
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPaymentType("PayPal");
                              setShowPaymentTypeDropdown(false);
                            }}
                            className="w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50 border-b border-gray-100"
                          >
                            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                              <CreditCard className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              PayPal
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPaymentType("Google Pay");
                              setShowPaymentTypeDropdown(false);
                            }}
                            className="w-full p-3 flex items-center gap-3 text-left hover:bg-gray-50"
                          >
                            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                              <CreditCard className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              Google Pay
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* UPI ID Field */}
                    <div className="relative">
                      <input
                        type="text"
                        id="upiId"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                        placeholder=" "
                      />
                      <label
                        htmlFor="upiId"
                        className="absolute left-4 -top-2.5 bg-white px-2 text-xs text-[#FF6B35] font-medium"
                      >
                        UPI ID
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-renewal Toggle */}
              <div className="flex items-center gap-3 mb-8">
                <button
                  onClick={() => setAutoRenewal(!autoRenewal)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    autoRenewal ? "bg-[#FF6B35]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoRenewal ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Enable auto-renewal (recommended)
                </span>
              </div>

              {/* Free Trial Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Free Trial:</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Try Pro for 7 days at no cost. Cancel anytime during the
                      trial and you won't be charged. After the trial, you'll be
                      charged $9.99 per month.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleStartTrial}
                  disabled={isSubscribing}
                  className="flex-1 px-6 py-3 bg-[#FF6B35] text-white rounded-lg text-sm font-medium hover:bg-[#FF6B35]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? "Processing..." : "Start Free Trial"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangePlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Change Billing Period
              </h2>
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Update your billing period to save more with longer commitments.
            </p>

            <div className="space-y-4">
              {plansData?.plans?.map((plan: SubscriptionPlan) => (
                <div
                  key={plan._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedNewPlan === plan._id
                      ? "border-[#FF6B35] bg-[#FF6B35]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedNewPlan(plan._id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {plan.billingPeriod}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${(plan.price || 0).toFixed(2)}/mo
                      </div>
                      {plan.discountText && (
                        <div className="text-sm text-green-600">
                          {plan.discountText}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedNewPlan === plan._id && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#FF6B35] rounded-full"></div>
                      <span className="text-sm text-[#FF6B35] font-medium">
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                disabled={!selectedNewPlan || isChangingPlan}
                className="flex-1 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 disabled:opacity-50"
              >
                {isChangingPlan ? "Changing..." : "Change Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Cancel Subscription
              </h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="font-semibold text-gray-900">
                  Are you sure you want to cancel?
                </h3>
              </div>

              <p className="text-gray-600 mb-4">
                You will lose access to all premium features and your
                subscription will end immediately.
              </p>

              {subscriptionStatus?.subscription?.isTrialActive && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-800">
                      You're currently in your free trial period
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Cancelling now means you won't be charged after the trial
                    ends.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
