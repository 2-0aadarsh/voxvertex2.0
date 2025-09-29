'use client';

import React, { useState } from 'react';
import { Filter, Download, TrendingUp, TrendingDown, Clock, ChevronRight, ChevronDown } from 'lucide-react';

type TransactionType = 'income' | 'expense';
type TransactionStatus = 'cleared' | 'pending';

interface Participant {
  name: string;
  id: string;
  amount: number;
}

interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  description: string;
  date: string;
  status: TransactionStatus;
  amount: number;
  fee?: number;
  participants?: Participant[];
}

interface PaymentData {
  totalBalance: number;
  availableNow: number;
  pendingClearance: number;
  dailyTransactionLimit: number;
  dailyWithdrawalLimit: number;
  availableUtilization: number;
  pendingUtilization: number;
  isVerified: boolean;
}

interface TransactionHistoryProps {
  data?: PaymentData;
}

export default function TransactionHistory({ data }: TransactionHistoryProps) {
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'income',
      title: 'Event Revenue',
      description: 'Tech Conference 2025',
      date: 'Aug 21, 2025',
      status: 'cleared',
      amount: 2500.00,
      participants: [
        { name: 'John Doe', id: 'tx_1a2b3c', amount: 150.00 },
        { name: 'Jane Smith', id: 'tx_4d5e6f', amount: 150.00 },
        { name: 'Mike Johnson', id: 'tx_7g8h9i', amount: 150.00 }
      ]
    },
    {
      id: '2',
      type: 'income',
      title: 'Event Revenue',
      description: 'Marketing Workshop',
      date: 'Aug 22, 2025',
      status: 'pending',
      amount: 1800.00
    },
    {
      id: '3',
      type: 'expense',
      title: 'Speaker Booking',
      description: '',
      date: 'Aug 20, 2025',
      status: 'cleared',
      amount: 500.00,
      fee: 50.00
    },
    {
      id: '4',
      type: 'expense',
      title: 'Subscription',
      description: '',
      date: 'Aug 19, 2025',
      status: 'cleared',
      amount: 99.00,
      fee: 9.90
    },
    {
      id: '5',
      type: 'expense',
      title: 'Withdrawal',
      description: '',
      date: 'Aug 18, 2025',
      status: 'cleared',
      amount: 1500.00
    },
    {
      id: '6',
      type: 'income',
      title: 'Deposit',
      description: '',
      date: 'Aug 17, 2025',
      status: 'cleared',
      amount: 1000.00
    }
  ];

  const totalIncome = 3500.00;
  const totalExpenses = 2099.00;
  const pendingAmount = 1800.00;

  const filteredTransactions = mockTransactions.filter(transaction => {
    const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
    const statusMatch = statusFilter === 'all' || transaction.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const getStatusBadge = (status: TransactionStatus) => {
    if (status === 'cleared') {
      return <span className="inline-flex items-center px-4 py-1 rounded-lg text-xs border border-[#FF6B35] font-medium bg-[#FF6B35]/20 text-[#FF6B36]">Cleared</span>;
    } else if (status === 'pending') {
      return <span className="inline-flex items-center px-4 py-1 rounded-lg text-xs border border-[#FF6B35] font-medium bg-[#FF6B35]/30 text-[#FF6B36] ">Pending</span>;
    }
  };

  const formatAmount = (amount: number, type: TransactionType) => {
    const formatted = `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    if (type === 'income') {
      return `+${formatted}`;
    } else {
      return `-${formatted}`;
    }
  };

  const getAmountColor = (type: TransactionType) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 border-[#FF6B35] rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Total Income</span>
          </div>
          <div className="text-xl font-bold text-gray-900">${totalIncome.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
        </div>

        <div className="bg-orange-50 border-[#FF6B35] rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Total Expenses</span>
          </div>
          <div className="text-xl font-bold text-gray-900">${totalExpenses.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
        </div>

        <div className="bg-orange-50 border-[#FF6B35] rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Pending Amount</span>
          </div>
          <div className="text-xl font-bold text-gray-900">${pendingAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
            </div>
            <button className="flex items-center gap-2 px-6 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg border transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Type:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    typeFilter === 'all' 
                      ? 'bg-[#FF6B36] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter('income')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    typeFilter === 'income' 
                      ? 'bg-[#FF6B36] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setTypeFilter('expense')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    typeFilter === 'expense' 
                      ? 'bg-[#FF6B36] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Expenses
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'all' 
                      ? 'bg-[#FF6B36] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('cleared')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'cleared' 
                      ? 'bg-[#FF6B36] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Cleared
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === 'pending' 
                      ? 'bg-[#FF6B36] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-md font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border-b border-gray-100 last:border-b-0">
                <div
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.title}
                          {transaction.description && (
                            <span className="text-gray-500 ml-2">· {transaction.description}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">{transaction.date}</span>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-md font-semibold ${getAmountColor(transaction.type)}`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </div>
                        {transaction.fee && (
                          <div className="text-sm text-gray-500">Fee: ${transaction.fee}</div>
                        )}
                      </div>
                      {expandedTransaction === transaction.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
 
                {expandedTransaction === transaction.id && (
                  <div className="px-6 pb-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Transaction Details</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Date:</span>
                            <span className="text-sm text-gray-900">Thursday, {transaction.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">ID:</span>
                            <span className="text-sm text-gray-900">{transaction.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Status:</span>
                            <span className={`text-sm ${transaction.status === 'cleared' ? 'text-green-600' : 'text-orange-600'}`}>
                              {transaction.status === 'cleared' ? 'Cleared' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Amount Breakdown</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Base Amount:</span>
                            <span className="text-sm text-gray-900">${transaction.amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                          </div>
                          {transaction.fee && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Fee:</span>
                              <span className="text-sm text-gray-900">${transaction.fee.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {transaction.participants && (
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Event Participants ({transaction.participants.length})</h4>
                        <div className="space-y-3">
                          {transaction.participants.map((participant, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">{participant.name}</div>
                                <div className="text-sm text-gray-500">ID: {participant.id}</div>
                              </div>
                              <div className="text-green-600 font-medium">+${participant.amount.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}