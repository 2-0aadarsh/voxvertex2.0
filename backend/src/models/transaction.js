// models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'EnhancedUser', required: true },
  amount: { type: Number, required: true },
  // types: deposit (user added funds), withdrawal, payout, fee, refund etc.
  type: { type: String, enum: ['deposit', 'withdrawal', 'payout', 'fee', 'refund', 'subscription'], required: true },
  status: { type: String, enum: ['pending', 'cleared', 'failed'], default: 'pending' },
  // reference to user's saved payment method (if used)
  paymentMethodId: { type: mongoose.Schema.Types.ObjectId, required: false },
  // snapshot of payment method details for auditing (masked)
  paymentMethodSnapshot: { type: Object },
  // optional gateway charge id / external txn id
  gatewayTxnId: { type: String },
  // dates
  createdAt: { type: Date, default: Date.now },
  clearedAt: { type: Date }
}, {
  timestamps: true
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
export default Transaction;
