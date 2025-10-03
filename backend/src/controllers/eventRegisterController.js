import express from "express";
import Registration from "../models/eventRegister.js";
import Event from "../models/event.js";
import { createPaymentOrder } from "../services/eventRegisterPaymentService.js";
import { sendConfirmationEmail } from "../services/eventRegisterConfirmationService.js";
import crypto from "crypto";
import mongoose from "mongoose";
import EnhancedUser from "../models/enhancedUser.js"; 

const router = express.Router();

/**
 * STEP 1: Create Registration (ticket selection + user details)
 * No payment created here, just store registrant info in DB
 */


export const registerEvent = async (req, res) => {
  try {
    const { eventId, ticketId, registrant, extras = [] } = req.body;

    if (!eventId || !ticketId) {
      return res.status(400).json({ error: "Missing eventId or ticketId" });
    }

    if (!registrant?.email || !registrant?.name || !registrant?.phone) {
      return res.status(400).json({ error: "Missing registrant details" });
    }

    // ✅ Validate registrant in EnhancedUser collection
    const existingRegistrant = await EnhancedUser.findOne({
      email: registrant.email.toLowerCase().trim()
    });
    if (!existingRegistrant) {
      return res.status(400).json({
        success: false,
        message: "Registrant is not a registered user",
        invalidUser: registrant.email
      });
    }
    registrant.userId = existingRegistrant._id;

    // ✅ Validate extras if provided
    const invalidExtras = [];
    for (const extra of extras) {
      if (!extra?.email) continue;

      const user = await EnhancedUser.findOne({ email: extra.email.toLowerCase().trim() });
      if (!user) {
        invalidExtras.push(extra.email);
      } else {
        extra.userId = user._id;
      }
    }

    if (invalidExtras.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some extras are not registered users",
        invalidUsers: invalidExtras
      });
    }

    // ✅ 1. Find event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (!Array.isArray(event.tickets) || event.tickets.length === 0) {
      return res.status(400).json({ error: "No tickets available for this event" });
    }

    // ✅ 2. Find selected ticket
    const selectedTicket = event.tickets.find(ticket => ticket._id.toString() === ticketId);
    if (!selectedTicket) return res.status(404).json({ error: "Selected ticket not found" });

    // ✅ 3. Calculate total participants
    const participantCount = 1 + (extras?.length || 0);
    if (selectedTicket.quantity < participantCount) {
      return res.status(400).json({ error: "Not enough tickets available" });
    }

    // ✅ 4. Calculate total amount
    const totalAmount = (selectedTicket.price || 0) * participantCount;

    // ✅ Reserve tickets
    selectedTicket.quantity -= participantCount;
    await event.save();

    // ✅ 5. Create registration (status = initiated if payment required)
    const registration = await Registration.create({
      event: event._id,
      ticket: {
        ticketId: selectedTicket._id,
        ticketName: selectedTicket.ticketName,
        price: selectedTicket.price,
      },
      registrant,
      participantCount,
      extras,
      totalAmount,
      currency: "INR",
      paymentStatus: totalAmount > 0 ? "initiated" : "paid",
    });

    // ✅ 6. If free registration (amount 0) → confirm immediately
    if (totalAmount === 0) {
      await sendConfirmationEmail(registration, event);
      registration.confirmationSent = true;
      await registration.save();
      return res.json({
        message: "Free registration successful",
        registrationId: registration._id,
        totalAmount,
        currency: "INR"
      });
    }

    // ✅ 7. Otherwise → Create Razorpay payment order
    const paymentOrder = await createPaymentOrder({
      amount: totalAmount,
      registrationId: registration._id,
      userId: registrant.userId
    });

    // Save orderId into registration
    registration.paymentOrderId = paymentOrder.id;
    await registration.save();

    // ✅ 8. Return response with payment details
    res.json({
      message: "Registration created successfully. Proceed to payment.",
      registrationId: registration._id,
      totalAmount,
      currency: "INR",
      paymentOrder
    });

  } catch (err) {
    console.error("Register Event Error:", err);
    res.status(500).json({ error: err.message });
  }
};


/**
 * STEP 2: Create Razorpay Order for Payment
 * This endpoint is called after user confirms details and clicks "Pay"
 */
export const createPaymentForEventRegistration = async (req, res) => {
  try {
    const { paymentMethodId } = req.body; // frontend must send chosen method
    console.log("📌 createPaymentForEventRegistration called with ID:", req.params.id);

    const registration = await Registration.findById(req.params.id).populate("event");
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    if (registration.paymentStatus === "paid") {
      return res.status(400).json({ error: "Payment already completed" });
    }

    // Load registrant user
    const user = await EnhancedUser.findById(registration.registrant.userId);
    if (!user) {
      return res.status(404).json({ error: "Registrant user not found" });
    }
    if (!user.paymentMethods || user.paymentMethods.length === 0) {
    return res.status(400).json({ 
        message: "No payment method found. Please add a payment method first." 
    });
}
    // Find chosen payment method
    const selectedMethod = user.getPaymentMethodById(paymentMethodId);
    if (!selectedMethod) {
      return res.status(400).json({ error: "Invalid or missing payment method" });
    }

    console.log("✅ Payment method selected:", selectedMethod.type);

    // ---- CASE 1: Wallet Payment ----
    if (selectedMethod.type === "wallet") {
      if (user.wallet.availableBalance < registration.totalAmount) {
        return res.status(400).json({ error: "Insufficient wallet balance" });
      }

      // Deduct wallet balance
      user.wallet.availableBalance -= registration.totalAmount;
      await user.save();

      // Mark registration as paid
      registration.paymentStatus = "paid";
      registration.paymentProvider = "wallet";
      registration.paymentProviderData = {
        paymentMethodId,
        type: "wallet",
        debitedAmount: registration.totalAmount,
      };
      await registration.save();

      // Send confirmation email
      await sendConfirmationEmail(registration, registration.event);
      registration.confirmationSent = true;
      await registration.save();

      return res.json({
        message: "Payment successful via wallet",
        registrationId: registration._id,
        totalAmount: registration.totalAmount,
        currency: registration.currency,
      });
    }

    // ---- CASE 2: Razorpay ----
 // ---- CASE 2: Razorpay ----
if (selectedMethod.type === "upi" || selectedMethod.type === "card" || selectedMethod.type === "netbanking") {
  try {
    const order = await createPaymentOrder({
      amount: registration.totalAmount,
      registrationId: registration._id,
      userId: registration.registrant.userId
    });

    console.log("Razorpay order created:", order);

    if (!order || !order.id) {
      return res.status(500).json({ error: "Failed to create payment order" });
    }

    registration.paymentProvider = "razorpay";
    registration.paymentProviderData = { orderId: order.id, paymentMethodId };
    registration.paymentStatus = "pending"; // until verified
    await registration.save();

    return res.json({
      message: "Payment order created successfully",
      registrationId: registration._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "mock_key"
    });
  } catch (err) {
    console.error("❌ Razorpay order creation failed:", err); // log full error
    return res.status(500).json({ error: "Failed to create payment order", details: err.message });
  }
}


    // ---- CASE 3: Unsupported method ----
    return res.status(400).json({ error: "Payment method not supported yet" });

  } catch (err) {
    console.error("❌ Payment creation error:", err);
    res.status(500).json({ error: err.message });
  }
};


/**
 * STEP 3: Verify Payment after Razorpay success
 */
export const verifyPayment =  async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const registration = await Registration.findById(req.params.id).populate("event");
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        if (registration.ticket && registration.ticket.ticketId) {
        await Event.findOneAndUpdate(
          { _id: registration.event._id, "tickets._id": registration.ticket.ticketId },
          { $inc: { "tickets.$.quantity": registration.participantCount } }
        );
      }
      registration.paymentStatus = "failed";
      await registration.save();
      return res.status(400).json({ error: "Invalid signature, tickets restored" });
    }

    // Mark as paid
    registration.paymentStatus = "paid";
    registration.paymentProviderData = {
      ...(registration.paymentProviderData || {}),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };
    await registration.save();

    // Send confirmation email
    await sendConfirmationEmail(registration, registration.event);
    registration.confirmationSent = true;
    await registration.save();

    res.json({ ok: true, registration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * STEP 4: Registration Summary
 */
export const getRegistrationSummary = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).populate("event");
    if (!reg) return res.status(404).json({ error: "Registration not found" });

    const event = reg.event;
    const summary = {
      topic: event.topic,
      description: event.description,
      date: event.eventDate,
      startTime: event.eventStartTime,
      endTime: event.eventEndTime,
      eventMode: event.eventMode,
      location: event.eventLocation,
      venueAddress: event.venueAddress,
      totalAmount: reg.totalAmount,
      paymentStatus: reg.paymentStatus,
      registrant: reg.registrant,
      extras: reg.extras,
      meetLink: event.eventMode === "online" ? event.eventLocation : null,
      passDownloadUrl: event.eventMode === "offline" ? `${process.env.DOMAIN}/passes/${reg._id}` : null
    };

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// controllers/eventRegisterController.js
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const registrations = await Registration.find({ event: eventId })
      .select('registrant extras')
      .lean();

    // Flatten extras as individual participants if you want them listed separately
  const participants = registrations.flatMap(reg => [
      {
        name: reg.registrant.name,
        email: reg.registrant.email,
        phone: reg.registrant.phone,
        userId: reg.registrant.userId,
      },
      ...(reg.extras?.map(ex => ({
        name: ex.name,
        email: ex.email,
        phone: ex.phone,
        userId: ex.userId,
      })) || [])
    ]);

    res.json({ participants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export default router;