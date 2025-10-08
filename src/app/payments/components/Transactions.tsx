"use client";

import React, { useState, useMemo } from "react";
import {
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronRight,
  ChevronDown,
  Search,
  Eye,
  DollarSign,
  FileText,
  Calendar,
  ArrowUpDown,
} from "lucide-react";
import { useGetTransactionsQuery } from "../../../store/api/paymentApi";
import { useAuth } from "@/store/hooks";

type TransactionType = "income" | "expense";
type TransactionStatus = "cleared" | "pending";

interface Participant {
  name: string;
  id: string;
  amount: number;
}

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  paymentMethodSnapshot?: {
    type: string;
    details: any;
  };
  gatewayTxnId?: string;
  clearedAt?: string;
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
  const { user, id } = useAuth();
  const userId = id;

  // Fetch transactions from API
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useGetTransactionsQuery(userId!, { skip: !userId });

  const [typeFilter, setTypeFilter] = useState<"all" | string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(
    null
  );
  const [sortField, setSortField] = useState<
    "date" | "amount" | "type" | "status"
  >("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Helper functions to process transaction data
  const getTransactionTitle = (type: string) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Withdrawal";
      case "subscription":
        return "Subscription";
      case "event_revenue":
        return "Event Revenue";
      case "speaker_booking":
        return "Speaker Booking";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.paymentMethodSnapshot?.details?.bankName) {
      return `Bank: ${transaction.paymentMethodSnapshot.details.bankName}`;
    }
    if (transaction.gatewayTxnId) {
      return `ID: ${transaction.gatewayTxnId}`;
    }
    return "N/A";
  };

  const getTransactionType = (type: string) => {
    return ["deposit", "event_revenue"].includes(type) ? "income" : "expense";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate totals from real data
  const { totalIncome, totalExpenses, pendingAmount } = useMemo(() => {
    const income = transactions
      .filter((t) => getTransactionType(t.type) === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => getTransactionType(t.type) === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const pending = transactions
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      pendingAmount: pending,
    };
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
      const typeMatch =
        typeFilter === "all" ||
        getTransactionType(transaction.type) === typeFilter;
      const statusMatch =
        statusFilter === "all" || transaction.status === statusFilter;
      const searchMatch =
        searchTerm === "" ||
        getTransactionTitle(transaction.type)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        getTransactionDescription(transaction)
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const dateMatch = (() => {
        if (!fromDate && !toDate) return true;
        const transactionDate = new Date(transaction.createdAt);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        if (from && to) {
          return transactionDate >= from && transactionDate <= to;
        } else if (from) {
          return transactionDate >= from;
        } else if (to) {
          return transactionDate <= to;
        }
        return true;
      })();

      return typeMatch && statusMatch && searchMatch && dateMatch;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "date":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "type":
          aValue = getTransactionTitle(a.type);
          bValue = getTransactionTitle(b.type);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    transactions,
    typeFilter,
    statusFilter,
    searchTerm,
    fromDate,
    toDate,
    sortField,
    sortDirection,
  ]);

  const getStatusBadge = (status: string) => {
    if (status === "cleared" || status === "success") {
      return (
        <span className="inline-flex items-center px-4 py-1 rounded-lg text-xs border border-[#FF6B35] font-medium bg-[#FF6B35]/20 text-[#FF6B36]">
          Cleared
        </span>
      );
    } else if (status === "pending") {
      return (
        <span className="inline-flex items-center px-4 py-1 rounded-lg text-xs border border-[#FF6B35] font-medium bg-[#FF6B35]/30 text-[#FF6B36]">
          Pending
        </span>
      );
    } else if (status === "failed") {
      return (
        <span className="inline-flex items-center px-4 py-1 rounded-lg text-xs border border-red-300 font-medium bg-red-100 text-red-600">
          Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-4 py-1 rounded-lg text-xs border border-gray-300 font-medium bg-gray-100 text-gray-600">
        {status}
      </span>
    );
  };
  const formatAmount = (amount: number, type: string) => {
    const transactionType = getTransactionType(type);
    const formatted = `₹${amount
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    if (transactionType === "income") {
      return `+${formatted}`;
    } else {
      return `-${formatted}`;
    }
  };

  const getAmountColor = (type: string) => {
    const transactionType = getTransactionType(type);
    return transactionType === "income" ? "text-green-600" : "text-red-600";
  };

  // View modal handlers
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedTransaction(null);
  };

  const generatePDFReceipt = (transaction: Transaction) => {
    // Create HTML content for the receipt
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Transaction Receipt</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #FF6B35, #FF8A65);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
          }
          .content {
            padding: 30px;
          }
          .transaction-summary {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid #FF6B35;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          .summary-row:last-child {
            margin-bottom: 0;
          }
          .summary-label {
            font-weight: 600;
            color: #374151;
          }
          .summary-value {
            color: #1f2937;
            font-weight: 500;
          }
          .amount {
            font-size: 24px;
            font-weight: bold;
            color: ${
              getTransactionType(transaction.type) === "income"
                ? "#10b981"
                : "#ef4444"
            };
          }
          .details-section {
            margin-bottom: 30px;
          }
          .details-section h3 {
            color: #374151;
            font-size: 18px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 500;
            color: #6b7280;
          }
          .detail-value {
            color: #1f2937;
            font-weight: 500;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            ${
              transaction.status === "cleared" ||
              transaction.status === "success"
                ? "background: #d1fae5; color: #065f46;"
                : transaction.status === "pending"
                ? "background: #fef3c7; color: #92400e;"
                : "background: #fee2e2; color: #991b1b;"
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <div style="width: 50px; height: 50px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #FF6B35, #FF8A65); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">V</div>
              </div>
              <div>
                <h1 style="margin: 0; font-size: 32px; font-weight: bold;">VoxVertex</h1>
                <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Transaction Receipt</p>
              </div>
            </div>
            <p style="margin: 0; opacity: 0.8; font-size: 14px;">Transaction ID: ${
              transaction._id
            }</p>
          </div>
          
          <div class="content">
            <div class="transaction-summary">
              <div class="summary-row">
                <span class="summary-label">Transaction Type:</span>
                <span class="summary-value">${getTransactionTitle(
                  transaction.type
                )}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Date:</span>
                <span class="summary-value">${formatDate(
                  transaction.createdAt
                )}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Amount:</span>
                <span class="summary-value amount">${formatAmount(
                  transaction.amount,
                  transaction.type
                )}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Status:</span>
                <span class="summary-value">
                  <span class="status-badge">${transaction.status}</span>
                </span>
              </div>
            </div>

            <div class="details-section">
              <h3>Transaction Details</h3>
              <div class="detail-row">
                <span class="detail-label">Transaction ID</span>
                <span class="detail-value">${transaction._id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date & Time</span>
                <span class="detail-value">${formatDate(
                  transaction.createdAt
                )}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Type</span>
                <span class="detail-value">${getTransactionTitle(
                  transaction.type
                )}</span>
              </div>
              ${
                transaction.paymentMethodSnapshot?.details?.bankName
                  ? `
              <div class="detail-row">
                <span class="detail-label">Bank</span>
                <span class="detail-value">${transaction.paymentMethodSnapshot.details.bankName}</span>
              </div>
              `
                  : ""
              }
              ${
                transaction.paymentMethodSnapshot?.details?.accountNumber
                  ? `
              <div class="detail-row">
                <span class="detail-label">Account</span>
                <span class="detail-value">****${transaction.paymentMethodSnapshot.details.accountNumber.slice(
                  -4
                )}</span>
              </div>
              `
                  : ""
              }
              ${
                (transaction as any).gatewayTxnId
                  ? `
              <div class="detail-row">
                <span class="detail-label">Gateway ID</span>
                <span class="detail-value">${
                  (transaction as any).gatewayTxnId
                }</span>
              </div>
              `
                  : ""
              }
              ${
                (transaction as any).clearedAt
                  ? `
              <div class="detail-row">
                <span class="detail-label">Cleared At</span>
                <span class="detail-value">${formatDate(
                  (transaction as any).clearedAt
                )}</span>
              </div>
              `
                  : ""
              }
            </div>
          </div>
          
          <div class="footer">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #FF6B35, #FF8A65); border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                <div style="color: white; font-weight: bold; font-size: 12px;">V</div>
              </div>
              <span style="font-weight: 600; color: #374151;">VoxVertex</span>
            </div>
            <p style="margin: 0 0 8px 0; font-size: 12px;">Generated on ${new Date().toLocaleString()}</p>
            <p style="margin: 0; font-size: 12px;">This is an automated receipt. Please keep this for your records.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a new window with the HTML content
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Close the window after printing
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };
    }
  };

  const handleDownloadReceipt = () => {
    if (selectedTransaction) {
      generatePDFReceipt(selectedTransaction);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">
          Error loading transactions. Please try again.
        </div>
      </div>
    );
  }

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
          <div className="text-xl font-bold text-gray-900">
            ₹{totalIncome.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>

        <div className="bg-orange-50 border-[#FF6B35] rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Total Expenses</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            ₹{totalExpenses.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>

        <div className="bg-orange-50 border-[#FF6B35] rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Pending Amount</span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            ₹{pendingAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900">
                Transaction Management
              </h2>
            </div>
            <button className="flex items-center gap-2 px-6 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg border transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              >
                <option value="all">All Status</option>
                <option value="cleared">Cleared</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                placeholder="From Date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                placeholder="To Date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
              />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-gray-900"
              onClick={() => {
                setSortField("date");
                setSortDirection(
                  sortField === "date" && sortDirection === "desc"
                    ? "asc"
                    : "desc"
                );
              }}
            >
              Date
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-gray-900"
              onClick={() => {
                setSortField("type");
                setSortDirection(
                  sortField === "type" && sortDirection === "desc"
                    ? "asc"
                    : "desc"
                );
              }}
            >
              Type
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>Description</div>
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-gray-900"
              onClick={() => {
                setSortField("amount");
                setSortDirection(
                  sortField === "amount" && sortDirection === "desc"
                    ? "asc"
                    : "desc"
                );
              }}
            >
              Amount
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div
              className="flex items-center gap-1 cursor-pointer hover:text-gray-900"
              onClick={() => {
                setSortField("status");
                setSortDirection(
                  sortField === "status" && sortDirection === "desc"
                    ? "asc"
                    : "desc"
                );
              }}
            >
              Status
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-md font-medium text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters to see more results.
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="border-b border-gray-100 last:border-b-0"
              >
                <div
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() =>
                    setExpandedTransaction(
                      expandedTransaction === transaction._id
                        ? null
                        : transaction._id
                    )
                  }
                >
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="text-sm text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          getTransactionType(transaction.type) === "income"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {getTransactionType(transaction.type) === "income" ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {getTransactionTitle(transaction.type)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {getTransactionDescription(transaction)}
                    </div>
                    <div
                      className={`text-sm font-semibold ${getAmountColor(
                        transaction.type
                      )}`}
                    >
                      {formatAmount(transaction.amount, transaction.type)}
                    </div>
                    <div>{getStatusBadge(transaction.status)}</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTransaction(transaction);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          generatePDFReceipt(transaction);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {expandedTransaction === transaction._id && (
                  <div className="px-6 pb-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">
                          Transaction Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Date:</span>
                            <span className="text-sm text-gray-900">
                              {formatDate(transaction.createdAt)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">ID:</span>
                            <span className="text-sm text-gray-900">
                              {transaction._id}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Status:
                            </span>
                            <span
                              className={`text-sm ${
                                transaction.status === "cleared"
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {transaction.status === "cleared"
                                ? "Cleared"
                                : transaction.status}
                            </span>
                          </div>
                          {(transaction as any).gatewayTxnId && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Gateway ID:
                              </span>
                              <span className="text-sm text-gray-900">
                                {(transaction as any).gatewayTxnId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-semibold text-gray-900 mb-4">
                          Amount Breakdown
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Base Amount:
                            </span>
                            <span className="text-sm text-gray-900">
                              ₹
                              {transaction.amount
                                .toFixed(2)
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            </span>
                          </div>
                          {(transaction as any).clearedAt && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Cleared At:
                              </span>
                              <span className="text-sm text-gray-900">
                                {formatDate((transaction as any).clearedAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select className="px-2 py-1 border border-gray-300 rounded text-sm">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing 1 to {filteredTransactions.length} of{" "}
            {filteredTransactions.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm text-gray-500 bg-gray-200 rounded disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button
              className="px-3 py-1 text-sm text-gray-500 bg-gray-200 rounded disabled:opacity-50"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Transaction Modal */}
      {showViewModal && selectedTransaction && (
        <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#FF6B35]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Transaction Receipt
                  </h3>
                  <p className="text-sm text-gray-500">
                    Transaction ID: {selectedTransaction._id}
                  </p>
                </div>
              </div>
              <button
                onClick={closeViewModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Transaction Summary Card */}
              <div className="bg-gradient-to-r from-[#FF6B35]/5 to-[#FF6B35]/10 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        getTransactionType(selectedTransaction.type) ===
                        "income"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {getTransactionType(selectedTransaction.type) ===
                      "income" ? (
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {getTransactionTitle(selectedTransaction.type)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedTransaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${getAmountColor(
                        selectedTransaction.type
                      )}`}
                    >
                      {formatAmount(
                        selectedTransaction.amount,
                        selectedTransaction.type
                      )}
                    </div>
                    <div className="mt-1">
                      {getStatusBadge(selectedTransaction.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Transaction Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Transaction ID
                        </span>
                        <span className="text-sm text-gray-900 font-mono">
                          {selectedTransaction._id}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Date & Time
                        </span>
                        <span className="text-sm text-gray-900">
                          {formatDate(selectedTransaction.createdAt)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Type
                        </span>
                        <span className="text-sm text-gray-900">
                          {getTransactionTitle(selectedTransaction.type)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Status
                        </span>
                        <div>{getStatusBadge(selectedTransaction.status)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Payment Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-600">
                          Amount
                        </span>
                        <span
                          className={`text-lg font-semibold ${getAmountColor(
                            selectedTransaction.type
                          )}`}
                        >
                          {formatAmount(
                            selectedTransaction.amount,
                            selectedTransaction.type
                          )}
                        </span>
                      </div>
                      {selectedTransaction.paymentMethodSnapshot?.details
                        ?.bankName && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">
                            Bank
                          </span>
                          <span className="text-sm text-gray-900">
                            {
                              selectedTransaction.paymentMethodSnapshot.details
                                .bankName
                            }
                          </span>
                        </div>
                      )}
                      {selectedTransaction.paymentMethodSnapshot?.details
                        ?.accountNumber && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">
                            Account
                          </span>
                          <span className="text-sm text-gray-900 font-mono">
                            ****
                            {selectedTransaction.paymentMethodSnapshot.details.accountNumber.slice(
                              -4
                            )}
                          </span>
                        </div>
                      )}
                      {(selectedTransaction as any).gatewayTxnId && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">
                            Gateway ID
                          </span>
                          <span className="text-sm text-gray-900 font-mono">
                            {(selectedTransaction as any).gatewayTxnId}
                          </span>
                        </div>
                      )}
                      {(selectedTransaction as any).clearedAt && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-600">
                            Cleared At
                          </span>
                          <span className="text-sm text-gray-900">
                            {formatDate((selectedTransaction as any).clearedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Transaction Description
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {getTransactionDescription(selectedTransaction)}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-4 p-8 border-t border-gray-200 bg-gray-50/50">
              <button
                onClick={closeViewModal}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownloadReceipt}
                className="px-6 py-3 text-sm font-medium text-white bg-[#FF6B35] rounded-xl hover:bg-[#FF6B35]/90 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
