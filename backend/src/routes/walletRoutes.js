import { Router } from "express";
import { 
  addWallet, 
  verifyPayment, 
  walletWebhook, 
  getWalletBalance, 
  withdrawRequest, 
  verifyPin 
} from "../controllers/walletController.js";

const router = Router();

// Initiate wallet top-up
router.post("/add", addWallet);

// Verify payment after top-up
router.post("/verify", verifyPayment);

// Razorpay will hit this route for webhook events
router.post("/webhook", walletWebhook);

// Get current wallet balance (authenticated route, ensure req.user is available)
router.get("/balance", getWalletBalance);

// Submit a withdrawal request (requires wallet PIN verification)
router.post("/withdraw", withdrawRequest);

// Verify withdrawal PIN
router.post("/verify-pin", verifyPin);

export default router;