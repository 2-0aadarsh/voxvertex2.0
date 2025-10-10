export interface PaymentData {
  totalBalance: number;
  availableNow: number;
  pendingClearance: number;
  dailyTransactionLimit: number;
  dailyWithdrawalLimit: number;
  availableUtilization: number;
  pendingUtilization: number;
  isVerified: boolean;
}
export type TabType = 'overview' | 'transactions' | 'subscription' | 'payment-methods';
export interface TabProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}