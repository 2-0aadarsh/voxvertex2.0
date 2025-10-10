// controllers/paymentController.js
import EnhancedUser from '../models/enhancedUser.js';
import Transaction from '../models/transaction.js';
// import mongoose from 'mongoose';
import Razorpay from "razorpay";
import crypto from 'crypto'; 

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Add payment method
 * POST /api/payments/payment-methods/add
 * body: { userId, type, details, isDefault }
 */
export const addPaymentMethod = async (req, res) => {
  try {
    const { userId, type, details, isDefault } = req.body;
    if (!userId || !type || !details) return res.status(400).json({ message: 'Missing fields' });

    const user = await EnhancedUser.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // For development: Allow test bank accounts
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (type === 'bank' && isDevelopment) {
      // In development, auto-verify test bank accounts
      details.verified = true;
      details.isTestAccount = true;
    } else if (type === 'bank' && !isDevelopment) {
      // In production, require proper bank validation
      if (!details.bankName || !details.accountNumber || !details.ifscCode) {
        return res.status(400).json({ 
          message: 'Bank account details incomplete. Please provide Bank Name, Account Number, and IFSC Code.',
          code: 'INCOMPLETE_BANK_DETAILS'
        });
      }
      
      // Here you would integrate with bank verification APIs like:
      // - Razorpay Bank Account Verification
      // - NPCI Bank Account Verification
      // - Third-party KYC services
      
      // For now, set as unverified (requires manual verification)
      details.verified = false;
      details.isTestAccount = false;
    }

    const pm = await user.addPaymentMethod({ type, details, isDefault });
    return res.json({ 
      message: 'Payment method added', 
      paymentMethod: pm,
      requiresVerification: type === 'bank' && !isDevelopment && !details.verified
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * List payment methods
 * GET /api/payments/payment-methods/:userId
 */
export const getPaymentMethods = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await EnhancedUser.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user.paymentMethods);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Update a payment method
 * PUT /api/payments/payment-methods/:userId/:paymentMethodId
 * body: { type?, details?, isDefault? }
 */
// export const updatePaymentMethod = async (req, res) => {
//   try {
//     const { userId, paymentMethodId } = req.params;
//     const { type, details, isDefault } = req.body;

//     if (!userId || !paymentMethodId) return res.status(400).json({ message: 'Missing params' });

//     const user = await EnhancedUser.findById(userId);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     // Find subdoc by id (works if paymentMethods is a subdoc array)
//     const pm = user.paymentMethods.id(paymentMethodId);
//     if (!pm) return res.status(404).json({ message: 'Payment method not found' });

//     // If setting default, clear others
//     if (typeof isDefault === 'boolean' && isDefault) {
//       user.paymentMethods.forEach(item => (item.isDefault = false));
//       pm.isDefault = true;
//     } else if (typeof isDefault === 'boolean') {
//       pm.isDefault = isDefault;
//     }

//     if (type) pm.type = type;
//     if (details) pm.details = details;

//     await user.save();
//     return res.json({ message: 'Payment method updated', paymentMethod: pm });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: err.message });
//   }
// };

/**
 * Delete a payment method
 * DELETE /api/payments/payment-methods/:userId/:paymentMethodId
 */
export const deletePaymentMethod = async (req, res) => {
  try {
    const { userId, paymentMethodId } = req.params;

    if (!userId || !paymentMethodId) return res.status(400).json({ message: 'Missing params' });

    const user = await EnhancedUser.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const index = user.paymentMethods.findIndex(pm => pm._id.toString() === paymentMethodId);
if (index === -1) return res.status(404).json({ message: 'Payment method not found' });

const wasDefault = !!user.paymentMethods[index].isDefault;

// Remove from array
user.paymentMethods.splice(index, 1);

await user.save();

// If deleted PM was default and others exist, make first one default
if (wasDefault && user.paymentMethods.length > 0) {
  user.paymentMethods[0].isDefault = true;
  await user.save();
}

return res.json({ message: 'Payment method deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Add funds (create a pending transaction)
 * POST /api/wallet/add-funds
 * body: { userId, amount, paymentMethodId, gatewayTxnId? }
 *
 * This simulates payment gateway behavior:
 * - create Transaction with status 'pending'
 * - add amount to user's pendingBalance (wallet.pendingBalance)
 */


export const addFunds = async (req, res) => {
  try {
    const { userId, amount, paymentMethodId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!userId || !amount || amount <= 0) 
      return res.status(400).json({ message: 'Invalid payload' });

    const user = await EnhancedUser.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    console.log('User wallet before update:', user.wallet);
    console.log('Amount to add:', amount);
    
    // Ensure wallet exists
    if (!user.wallet) {
      user.wallet = { availableBalance: 0, pendingBalance: 0 };
      console.log('Wallet initialized:', user.wallet);
    }

    // Check daily transaction limit
    if (!user.canMakeTransaction(amount)) {
      const limits = user.checkDailyLimits();
      return res.status(400).json({
        message: `Daily transaction limit exceeded. Limit: ₹${limits.transactionLimit}, Used: ₹${limits.transactionUsed}, Remaining: ₹${limits.transactionRemaining}`,
        code: 'DAILY_TRANSACTION_LIMIT_EXCEEDED',
        limit: limits.transactionLimit,
        used: limits.transactionUsed,
        remaining: limits.transactionRemaining
      });
    }

    // Validate payment method belongs to user
    let pm = null;
    if (paymentMethodId) {
      pm = user.getPaymentMethodById(paymentMethodId);
      if (!pm) return res.status(400).json({ message: 'Invalid payment method' });
    }

    // --- Razorpay signature verification ---
   if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpaySecret) {
    return res.status(500).json({ message: 'Razorpay key secret not configured in environment' });
  }

  const generatedSignature = crypto
    .createHmac('sha256', razorpaySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    return res.status(400).json({ message: 'Razorpay signature verification failed' });
  }
} else {
  return res.status(400).json({ message: 'Payment details missing for Razorpay' });
}


    // Create transaction record (cleared - funds immediately available)
    const transaction = await Transaction.create({
      user: user._id,
      amount,
      type: 'deposit',
      status: 'cleared', // funds are immediately available
      paymentMethodId: pm ? pm._id : undefined,
      paymentMethodSnapshot: pm ? { type: pm.type, details: pm.details } : {},
      gatewayTxnId: razorpayPaymentId,
    });

    // Add to user's transactions and increment availableBalance (direct funds)
    user.transactions.push(transaction._id);
    user.wallet.availableBalance += amount;
    
    // Record daily transaction usage
    await user.recordTransaction(amount);
    
    console.log('Before save - Available balance:', user.wallet.availableBalance);
    console.log('Before save - Pending balance:', user.wallet.pendingBalance);
    
    await user.save();
    
    console.log('After save - Available balance:', user.wallet.availableBalance);
    console.log('After save - Pending balance:', user.wallet.pendingBalance);
    console.log('Funds added - User wallet after update:', user.wallet);

    return res.status(201).json({
      message: 'Funds added successfully to available balance.',
      transaction,
      wallet: user.wallet,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};


/**
 * Get balances
 * GET /api/wallet/balance/:userId
 */
export const getWalletBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await EnhancedUser.findById(userId).select('wallet');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Ensure wallet exists
    if (!user.wallet) {
      user.wallet = { availableBalance: 0, pendingBalance: 0 };
      await user.save();
      console.log('Wallet initialized for user:', userId);
    }
    
    const totalBalance = (user.wallet.availableBalance || 0) + (user.wallet.pendingBalance || 0);
    
    console.log('Getting wallet balance for user:', userId);
    console.log('Available balance:', user.wallet.availableBalance);
    console.log('Pending balance:', user.wallet.pendingBalance);
    console.log('Total balance:', totalBalance);
    
    return res.json({ totalBalance, ...user.wallet });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Withdraw funds to bank account
 * POST /api/payments/withdraw
 * body: { userId, amount, bankAccountId }
 */
export const withdrawFunds = async (req, res) => {
  try {
    const { userId, amount, bankAccountId } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const user = await EnhancedUser.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Enhanced balance validation
    if (user.wallet.availableBalance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Available: ₹${user.wallet.availableBalance}, Requested: ₹${amount}`,
        code: 'INSUFFICIENT_BALANCE',
        availableBalance: user.wallet.availableBalance,
        requestedAmount: amount
      });
    }

    // Check daily withdrawal limit
    if (!user.canMakeWithdrawal(amount)) {
      const limits = user.checkDailyLimits();
      return res.status(400).json({
        message: `Daily withdrawal limit exceeded. Limit: ₹${limits.withdrawalLimit}, Used: ₹${limits.withdrawalUsed}, Remaining: ₹${limits.withdrawalRemaining}`,
        code: 'DAILY_WITHDRAWAL_LIMIT_EXCEEDED',
        limit: limits.withdrawalLimit,
        used: limits.withdrawalUsed,
        remaining: limits.withdrawalRemaining
      });
    }

    // Find the bank account
    const bankAccount = user.paymentMethods.find(pm =>
      pm._id.toString() === bankAccountId && pm.type === 'bank'
    );

    if (!bankAccount) {
      return res.status(400).json({
        message: 'Bank account not found',
        code: 'BANK_ACCOUNT_NOT_FOUND'
      });
    }

    // Check if bank account is verified (for production)
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!isDevelopment && !bankAccount.details.verified) {
      return res.status(400).json({
        message: 'Bank account must be verified before withdrawals',
        code: 'BANK_ACCOUNT_NOT_VERIFIED'
      });
    }

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      user: user._id,
      amount,
      type: 'withdrawal',
      status: 'pending', // Will be processed by bank
      paymentMethodId: bankAccount._id,
      paymentMethodSnapshot: {
        type: bankAccount.type,
        details: bankAccount.details
      },
      notes: `Withdrawal to ${bankAccount.details.bankName}`,
      createdAt: new Date()
    });

    // CRITICAL: Deduct from available balance immediately
    // This prevents double-spending and ensures money is "locked"
    user.wallet.availableBalance -= amount;
    user.wallet.pendingBalance += amount;
    user.transactions.push(transaction._id);
    
    // Record daily withdrawal usage
    await user.recordWithdrawal(amount);
    
    await user.save();

    console.log('Withdrawal initiated - Money locked:', {
      userId,
      amount,
      bankAccount: bankAccount.details.bankName,
      previousAvailableBalance: user.wallet.availableBalance + amount,
      newAvailableBalance: user.wallet.availableBalance,
      newPendingBalance: user.wallet.pendingBalance,
      transactionId: transaction._id
    });

    // TODO: In production, integrate with actual bank transfer APIs:
    // - Razorpay Payouts API
    // - NPCI IMPS/NEFT APIs
    // - Bank-specific APIs
    
    return res.status(201).json({
      message: 'Withdrawal request submitted successfully. Money has been deducted from your available balance.',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        createdAt: transaction.createdAt
      },
      wallet: {
        availableBalance: user.wallet.availableBalance,
        pendingBalance: user.wallet.pendingBalance,
        totalBalance: user.wallet.availableBalance + user.wallet.pendingBalance
      },
      bankAccount: {
        id: bankAccount._id,
        bankName: bankAccount.details.bankName,
        accountNumber: bankAccount.details.accountNumber
      },
      note: isDevelopment 
        ? 'Development mode: No actual bank transfer initiated'
        : 'Bank transfer will be processed within 1-2 business days'
    });

  } catch (err) {
    console.error('Withdrawal error:', err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get transaction history
 * GET /api/wallet/transactions/:userId
 */
export const getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    // populate optional paymentMethodSnapshot
    const txns = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
    return res.json(txns);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Simulate clearance of a pending transaction.
 * For testing only. In production, handle via payment gateway webhook.
 * POST /api/wallet/clear-transaction
 * body: { transactionId }
 */
export const clearTransaction = async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) return res.status(400).json({ message: 'transactionId required' });

    const txn = await Transaction.findById(transactionId);
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    if (txn.status !== 'pending') return res.status(400).json({ message: 'Transaction not pending' });

    // Move to cleared
    txn.status = 'cleared';
    txn.clearedAt = new Date();
    await txn.save();

    // move balances in user
    const user = await EnhancedUser.findById(txn.user);
    // Decrease pending, increase available
    await user.clearPendingToAvailable(txn.amount);

    return res.json({ message: 'Transaction cleared', transaction: txn, wallet: user.wallet });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Simple webhook to capture payment success

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // set this in your backend env
    const signature = req.headers["x-razorpay-signature"];

    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const { payload } = req.body;
    const payment = payload?.payment?.entity;

    if (payment?.status === "captured") {
      const userId = payment.notes?.userId; // we will send this note while creating order
      const amount = payment.amount / 100; // Razorpay stores in paise

      // Update user wallet
      const user = await EnhancedUser.findById(userId);
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + amount;
        await user.save();
      }

      return res.status(200).send("Payment captured and wallet updated");
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency, userId  } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // amount in paise
      currency,
      payment_capture: 1,
    });

    // store mapping so webhook knows which user
    // Example: save in user.pendingOrders = [{ orderId: order.id, amount, createdAt }]
    const user = await EnhancedUser.findById(userId);
    if (user) {
      user.pendingOrders = user.pendingOrders || [];
      user.pendingOrders.push({ orderId: order.id, amount: amount / 100, createdAt: new Date() });
      await user.save();
    }


    res.json(order); // order.id, order.amount, order.currency
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Create or return Razorpay customer for a user
export const ensureRazorpayCustomer = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const user = await EnhancedUser.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If customer already exists, return it
    if (user.razorpayCustomerId) {
      return res.json({ customer_id: user.razorpayCustomerId });
    }

    // Create new customer in Razorpay
    const customer = await razorpayInstance.customers.create({
      name: user.name || user.email,
      email: user.email,
      contact: user.phone || undefined,
    });

    // Save customer id in user document
    user.razorpayCustomerId = customer.id;
    await user.save();

    return res.json({ customer_id: customer.id });
  } catch (err) {
    console.error('ensureRazorpayCustomer error:', err);
    res.status(500).json({ message: err.message });
  }
};


