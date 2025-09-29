'use client';

import { useState } from 'react';
import { Plus, TrendingUp, Clock, CheckCircle, Info, MoveUpRight, Wallet, X, CreditCard, Building2 } from 'lucide-react';

// Mock PaymentData type
interface PaymentData {
  totalBalance: number;
  availableNow: number;
  pendingClearance: number;
  availableUtilization: number;
  pendingUtilization: number;
  dailyWithdrawalLimit: number;
  dailyTransactionLimit: number;
}

interface OverviewProps {
  data: PaymentData;
}

export default function Overview({ data = sampleData }: OverviewProps) {
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] = useState(false);

  const openAddFundsModal = () => {
    setIsAddFundsModalOpen(true);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeAddFundsModal = () => {
    setIsAddFundsModalOpen(false);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'unset';
    }
    setAmount('');
    setIsAmountFocused(false);
    setIsPaymentMethodSelected(false);
  };

  const openWithdrawModal = () => {
    setIsWithdrawModalOpen(true);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'unset';
    }
  };

  const handleAddFunds = () => {
    console.log('Adding funds:', amount);
    closeAddFundsModal();
  };

  const handleWithdraw = () => {
    console.log('Withdrawing funds');
    closeWithdrawModal();
  };

  // Mock data for withdraw modal
  const clearedEventRevenue = 2500.00;
  const podiumPlatformFee = 250.00;
  const netWithdrawableAmount = clearedEventRevenue - podiumPlatformFee;

  return (
    <div className="space-y-6">
      {/* Total Balance Card */}
      <div className="bg-[#FF6B35] h-70 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
             
            </div>
            <div>
              <h2 className="text-lg font-medium">Total Balance</h2>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Verified Account</span>
              </div>
            </div>
          </div>
          <Info className="w-5 h-5 text-white/60" />
        </div>
        
        <div className="mb-8">
          <div className="text-4xl font-bold mb-2">${data.totalBalance.toLocaleString()}</div>
          <p className="text-white/80">Available across all payment methods</p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={openAddFundsModal}
            className="flex-1 bg-white/30 hover:bg-white/20 transition-colors rounded-xl py-3 flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Funds
          </button>
          <button 
            onClick={openWithdrawModal}
            className="flex-1 bg-white/30 hover:bg-white/20 transition-colors rounded-xl py-3 flex items-center justify-center gap-2 font-medium"
          >
            <MoveUpRight className="w-5 h-5" />
            Withdraw
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
  
        <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-2xl p-6 shadow-sm transform transition duration-200 hover:scale-102">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="font-semibold text-gray-900">Available Now</h3>
          </div>
          
          <div className="mb-6">
            <div className="text-3xl font-bold text-green-600 mb-1">
              ${data.availableNow.toLocaleString()}
            </div>
            <p className="text-gray-600 text-sm">Ready for withdrawal</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Utilization</span>
                <span className="font-medium">{data.availableUtilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#FF6B35] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.availableUtilization}%` }}
                ></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Daily limit: ${data.dailyWithdrawalLimit.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-2xl p-6 shadow-sm transform transition duration-200 hover:scale-102">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-amber-500" />
            <h3 className="font-semibold text-gray-900">Pending Clearance</h3>
          </div>
          
          <div className="mb-6">
            <div className="text-3xl font-bold text-amber-600 mb-1">
              ${data.pendingClearance.toLocaleString()}
            </div>
            <p className="text-gray-600 text-sm">48-hour hold period</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Of total balance</span>
                <span className="font-medium">{data.pendingUtilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#FF6B35] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.pendingUtilization}%` }}
                ></div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Expected clearance in ~24 hours
            </p>
          </div>
        </div>
      </div>

      {/* Account Status & Limits */}
      <div className="bg-white border-[#FF6B35] rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Account Status & Limits</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-[#FF6B35]/10 transform transition duration-200 hover:scale-102 rounded-xl border border-[#FF6B35]">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <h4 className="font-medium text-gray-900">Enhanced Verification</h4>
                <p className="text-sm text-gray-600">Full access to all features</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              Verified
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Daily Transaction Limit</h4>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ${data.dailyTransactionLimit.toLocaleString()}K
                </div>
                <p className="text-sm text-gray-600">Maximum daily transaction amount</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Daily Withdrawal Limit</h4>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ${data.dailyWithdrawalLimit.toLocaleString()}K
                </div>
                <p className="text-sm text-gray-600">Maximum daily withdrawal amount</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Funds Modal */}
      {isAddFundsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#FF6B35]/10"
            onClick={closeAddFundsModal}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-[#FF6B35]">Add Funds to Wallet</h2>
                <p className="text-gray-600 mt-1">
                  Add money to your platform wallet for future payments and bookings.
                </p>
              </div>
              <button 
                onClick={closeAddFundsModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">

              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onFocus={() => setIsAmountFocused(true)}
                  onBlur={() => setIsAmountFocused(false)}
                  className="w-full px-4 py-2 text-lg border-1 border-gray-200 rounded-xl focus:border-[#FF6B35] focus:outline-none transition-colors pl-8"
                  placeholder=" "
                />
                <label className="absolute -top-3 left-4 bg-white px-2 text-[#FF6B35] text-sm font-medium pointer-events-none">
                  Amount (USD)
                </label>
                <div className="absolute left-4 top-3 text-lg text-gray-500 pointer-events-none">
                  $
                </div>
              </div>

              <div className="relative">
                <div 
                  onClick={() => setIsPaymentMethodSelected(!isPaymentMethodSelected)}
                  className={`w-full px-4 py-2 border-1 rounded-xl bg-gray-50 flex items-center gap-3 cursor-pointer transition-colors hover:bg-gray-100 ${
                    isPaymentMethodSelected ? 'border-[#FF6B35]' : 'border-gray-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Visa •••• 4242</div>
                    <div className="text-sm text-gray-600">John Doe</div>
                  </div>
                </div>
                <label className="absolute -top-3 left-4 bg-white px-2 text-[#FF6B35] text-sm font-medium">
                  Payment Method
                </label>
              </div>

              <p className="text-sm text-gray-600">
                Funds will be charged to your default payment method.
              </p>

              <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#FF6B35]">
                  Added funds will be available immediately for platform transactions and bookings.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button 
                onClick={closeAddFundsModal}
                className="px-6 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddFunds}
                className="px-6 py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white rounded-xl font-medium transition-colors"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#FF6B35]/20"
            onClick={closeWithdrawModal}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-[#FF6B35]">Withdraw Funds</h2>
                <p className="text-gray-600 mt-1">
                  Review the withdrawal calculation based on your cleared event revenue.
                </p>
              </div>
              <button 
                onClick={closeWithdrawModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Withdrawal Breakdown</h3>
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Cleared Event Revenue</span>
                    <span className="font-medium text-gray-900">${clearedEventRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Podium Platform Fee (10%)</span>
                    <span className="font-medium text-red-600">-${podiumPlatformFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Net Withdrawable Amount</span>
                      <span className=" text-green-600 text-lg">${netWithdrawableAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Daily Withdrawal Limit</span>
                    <span className="text-gray-900">${(data.dailyWithdrawalLimit * 1000).toLocaleString()}.00</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Destination</h3>
                <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Chase Bank •••• 8901</div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      Checking Account 
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#FF6B35] mt-0.5 flex-shrink-0" />
                <p className="text-sm text-[#FF6B35]">
                  Withdrawals typically take 1-2 business days to appear in your bank account.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button 
                onClick={closeWithdrawModal}
                className="px-6 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleWithdraw}
                className="px-6 py-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white rounded-xl font-medium transition-colors"
              >
                Withdraw ${netWithdrawableAmount.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Demo data for testing 
const sampleData: PaymentData = {
  totalBalance: 15750,
  availableNow: 12500,
  pendingClearance: 3250,
  availableUtilization: 75,
  pendingUtilization: 25,
  dailyWithdrawalLimit: 10,
  dailyTransactionLimit: 50
};