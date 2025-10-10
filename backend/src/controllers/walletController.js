import Razorpay from "razorpay";
import crypto from "crypto";

// const Wallet = require("../models/wallet.js"); // Uncomment if needed

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route: POST /api/wallet/add
export const addWallet = async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: amount * 100, // convert to paise
    currency: "INR",
    receipt: `wallet_topup_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error("Error creating wallet top-up order:", error);
    res.status(500).json({ error: "Unable to create order" });
  }
};

// Route: POST /api/wallet/verify
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;
  
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = hmac.digest("hex");

  if (digest === razorpay_signature) {
    // Update wallet here if needed
    res.status(200).json({ message: "Payment verified successfully" });
  } else {
    res.status(400).json({ error: "Payment signature verification failed" });
  }
};

// Route: POST /api/wallet/webhook
export const walletWebhook = (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== req.headers["x-razorpay-signature"]) {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const event = req.body.event;
  if (event === "payment.captured") {
    const payment = req.body.payload.payment.entity;
    // await Wallet.creditFromPayment(payment);
  }

  res.status(200).json({ status: "Webhook received" });
};

// Route: GET /api/wallet/balance
export const getWalletBalance = async (req, res) => {
  try {
    // const wallet = await Wallet.findOne({ user: req.user._id });
    res.status(200).json({ balance: 5000 }); // Mocked balance
  } catch (error) {
    console.error("Error retrieving wallet balance:", error);
    res.status(500).json({ error: "Unable to fetch wallet balance" });
  }
};

// Route: POST /api/wallet/withdraw
export const withdrawRequest = async (req, res) => {
  try {
    const { amount, pin } = req.body;
    // Validate pin and balance here
    res.status(200).json({ message: "Withdrawal request submitted" });
  } catch (error) {
    console.error("Error creating withdrawal request:", error);
    res.status(500).json({ error: "Unable to process withdrawal request" });
  }
};

// Route: POST /api/wallet/verify-pin
export const verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const isValid = (pin === "1234"); // Replace with real verification logic
    if (isValid) {
      res.status(200).json({ message: "PIN verification successful" });
    } else {
      res.status(400).json({ error: "Invalid PIN" });
    }
  } catch (error) {
    console.error("Error verifying PIN:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
