// controllers/paymentController.js
import EnhancedUser from '../models/enhancedUser.js';
import Transaction from '../models/Transaction.js';
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

    const pm = await user.addPaymentMethod({ type, details, isDefault });
    return res.json({ message: 'Payment method added', paymentMethod: pm });
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


    // Create transaction record (pending)
    const transaction = await Transaction.create({
      user: user._id,
      amount,
      type: 'deposit',
      status: 'pending', // still pending, can update to 'success' after backend confirmation
      paymentMethodId: pm ? pm._id : undefined,
      paymentMethodSnapshot: pm ? { type: pm.type, details: pm.details } : {},
      gatewayTxnId: razorpayPaymentId,
    });

    // Add to user's transactions and increment pendingBalance
    user.transactions.push(transaction._id);
    await user.creditPending(amount);

    return res.status(201).json({
      message: 'Funds added (pending). Awaiting clearance.',
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
    const totalBalance = (user.wallet.availableBalance || 0) + (user.wallet.pendingBalance || 0);
    return res.json({ totalBalance, ...user.wallet });
  } catch (err) {
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


