import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Monthly / 6 Months / Yearly
  planType: { type: String, enum: ["monthly", "6months", "yearly"], required: true },
  pricePerMonth: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  billingPeriod: { type: String, required: true }, // e.g. "Billed every 6 months"
  discountText: { type: String } // e.g. "Save 25% compared to monthly"
});

export default mongoose.model("Subscription", SubscriptionSchema);
