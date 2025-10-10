// import Razorpay from "razorpay";
// import dotenv from "dotenv";
// dotenv.config();

// console.log("🔑 Razorpay Key ID Loaded:", process.env.RAZORPAY_KEY_ID ? "✅ Present" : "❌ Missing");
// console.log("🔑 Razorpay Key Secret Loaded:", process.env.RAZORPAY_KEY_SECRET ? "✅ Present" : "❌ Missing");


// let razorpay = null;
// if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
//   razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
//   });
// }

// export async function createPaymentOrder(amount, currency = "INR", receiptId) {
//   if (!razorpay) {
//     console.warn("⚠️ Razorpay not configured. Using mock order.");
//     return {
//       provider: "mock",
//       orderId: `mock_${Date.now()}`,
//       amount,
//       currency
//     };
//   }

//   try {
//     const options = {
//       amount,
//       currency,
//       receipt: receiptId,
//       payment_capture: 1
//     };

//     const order = await razorpay.orders.create(options);
//     return {
//       provider: "razorpay",
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency
//     };
//   } catch (error) {
//     console.error("❌ Razorpay order creation failed:", error);
//     throw new Error(error.error?.description || "Failed to create Razorpay order");
//   }
// }


// export { razorpay };


import Razorpay from "razorpay";

// Check if Razorpay credentials are available
const hasRazorpayCredentials = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "✅ Present" : "❌ Missing");
console.log("🔑 Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "✅ Present" : "❌ Missing");

let razorpay = null;

if (hasRazorpayCredentials) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log("✅ Razorpay initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Razorpay:", error);
  }
} else {
  console.warn("⚠️ Razorpay credentials missing. Using mock payment service.");
}

export async function createPaymentOrder({ amount, registrationId, userId }) {
  // If Razorpay is not available, use mock order
  if (!razorpay) {
    console.log("🎭 Creating mock payment order for testing");
    return {
      id: `mock_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `mock_reg_${registrationId}`,
      status: "created",
      created_at: Date.now(),
      provider: "mock"
    };
  }

  try {
    const shortUserId = String(userId).slice(-6); // take last 6 chars only
    const shortTime = Date.now().toString().slice(-6); // last 6 digits of timestamp
    const receipt = `reg_${registrationId}_${shortUserId}_${shortTime}`.slice(0, 40);

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt
    };

    console.log("💳 Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay order created:", order.id);
    return order;
  } catch (error) {
    console.error("❌ Payment order creation failed:", error);
    throw error;
  }
}
