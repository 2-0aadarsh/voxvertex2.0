// routes/paymentRoutes.js
import express from 'express';
import {
  addPaymentMethod,
  getPaymentMethods,
  addFunds,
  withdrawFunds,
  getWalletBalance,
  getTransactions,
  clearTransaction,
  razorpayWebhook,
  createRazorpayOrder,
  deletePaymentMethod, ensureRazorpayCustomer
} from '../controllers/paymentController.js';

const router = express.Router();

// Payment method management
router.post('/payment-methods/add', addPaymentMethod);
router.get('/payment-methods/:userId', getPaymentMethods);

// Wallet operations
router.post('/add-funds', addFunds);
router.post('/withdraw', withdrawFunds);
router.get('/balance/:userId', getWalletBalance);
router.get('/transactions/:userId', getTransactions);

// Testing / webhook endpoint (simulate payment gateway clearing)
router.post('/clear-transaction', clearTransaction);

router.post("/razorpay/webhook", razorpayWebhook);

// ✅ New route for Razorpay order
router.post("/razorpay/create-order", createRazorpayOrder);
// delete payment method
router.delete('/payment-methods/:userId/:paymentMethodId', deletePaymentMethod);
router.post('/razorpay/customer', ensureRazorpayCustomer);


export default router;
