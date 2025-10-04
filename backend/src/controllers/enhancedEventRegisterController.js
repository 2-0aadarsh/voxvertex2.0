import EnhancedEvent from '../models/enhancedEvent.js';
import EnhancedEventRegistration from '../models/enhancedEventRegistration.js';
import EnhancedUser from '../models/enhancedUser.js';
import { createPaymentOrder } from '../services/eventRegisterPaymentService.js';
import { sendConfirmationEmail } from '../services/eventRegisterConfirmationService.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

/**
 * STEP 1: Register for Enhanced Event (ticket selection + user details)
 * Handles ticket quantity management and user validation
 */
export const registerForEnhancedEvent = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const { eventId } = req.params; // Get eventId from URL params
      const { 
        ticketTierId, 
        registrant, 
        additionalParticipants = [] 
      } = req.body; // Get other data from request body

      console.log('🔍 Registration Debug - eventId from params:', eventId);
      console.log('🔍 Registration Debug - ticketTierId from body:', ticketTierId);

      // Validate required fields
      if (!eventId || !ticketTierId) {
        console.log('❌ Missing required fields - eventId:', !!eventId, 'ticketTierId:', !!ticketTierId);
        return res.status(400).json({ 
          success: false,
          error: "Missing eventId or ticketTierId" 
        });
      }

      if (!registrant?.email || !registrant?.name || !registrant?.phone) {
        return res.status(400).json({ 
          success: false,
          error: "Missing registrant details (name, email, phone)" 
        });
      }

      // ✅ 1. Find and validate enhanced event
      const event = await EnhancedEvent.findById(eventId).session(session);
      if (!event) {
        return res.status(404).json({ 
          success: false,
          error: "Enhanced event not found" 
        });
      }

      if (event.status !== 'published') {
        return res.status(400).json({ 
          success: false,
          error: "Event is not available for registration" 
        });
      }

      // ✅ 2. Find and validate ticket tier
      const selectedTicketTier = event.ticketTypes.find(
        tier => tier._id.toString() === ticketTierId
      );

      if (!selectedTicketTier) {
        return res.status(404).json({ 
          success: false,
          error: "Selected ticket tier not found" 
        });
      }

      // ✅ 3. Validate registrant (must be authenticated user in database)
      
      console.log('🔐 Registration Debug - req.user:', req.user);
      console.log('🔐 Registration Debug - req.user._id:', req.user?._id);
      console.log('🔐 Registration Debug - registrant email:', registrant.email);
      
      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        console.log('❌ No authenticated user found');
        return res.status(401).json({
          success: false,
          message: "Authentication required to register for events"
        });
      }

      // Find the authenticated user
      const authenticatedUser = await EnhancedUser.findById(req.user._id).session(session);
      console.log('🔐 Registration Debug - authenticatedUser:', authenticatedUser);
      
      if (!authenticatedUser) {
        console.log('❌ Authenticated user not found in database');
        return res.status(401).json({
          success: false,
          message: "Authenticated user not found in database"
        });
      }

      console.log('🔐 Registration Debug - authenticatedUser.email:', authenticatedUser.email);
      console.log('🔐 Registration Debug - registrant.email:', registrant.email);

      // Validate that registrant email matches authenticated user's email
      if (authenticatedUser.email.toLowerCase().trim() !== registrant.email.toLowerCase().trim()) {
        console.log('❌ Email mismatch - authenticated:', authenticatedUser.email, 'provided:', registrant.email);
        return res.status(400).json({
          success: false,
          message: "Registrant email must match your authenticated account email",
          authenticatedEmail: authenticatedUser.email,
          providedEmail: registrant.email
        });
      }

      // Update registrant with authenticated user's data
      registrant.userId = authenticatedUser._id;
      registrant.name = authenticatedUser.firstName + ' ' + authenticatedUser.lastName;
      registrant.email = authenticatedUser.email;

      // ✅ 4. Validate additional participants (optional validation)
      const processedParticipants = [];
      const invalidParticipants = [];

      for (const participant of additionalParticipants) {
        if (!participant?.email || !participant?.name || !participant?.phone) {
          invalidParticipants.push({
            email: participant?.email || 'unknown',
            error: 'Missing required fields (name, email, phone)'
          });
          continue;
        }

        // Check if participant exists in database (optional)
        const existingParticipant = await EnhancedUser.findOne({
          email: participant.email.toLowerCase().trim()
        }).session(session);

        const processedParticipant = {
          userId: existingParticipant?._id || null,
          name: participant.name.trim(),
          email: participant.email.toLowerCase().trim(),
          phone: participant.phone.trim(),
          isRegisteredUser: !!existingParticipant
        };

        processedParticipants.push(processedParticipant);
      }

      if (invalidParticipants.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some participants have invalid data",
          invalidParticipants
        });
      }

      // ✅ 5. Calculate total participants and validate ticket availability
      const totalParticipants = 1 + processedParticipants.length;
      
      if (selectedTicketTier.quantity < totalParticipants) {
        return res.status(400).json({ 
          success: false,
          error: "Not enough tickets available",
          available: selectedTicketTier.quantity,
          requested: totalParticipants,
          ticketTier: selectedTicketTier.name
        });
      }

      // ✅ 6. Calculate total amount
      const totalAmount = selectedTicketTier.price * totalParticipants;

      // ✅ 7. Reserve tickets (reserve quantity, decrease available)
      selectedTicketTier.reservedQuantity += totalParticipants;
      selectedTicketTier.quantity -= totalParticipants;
      await event.save({ session });

      // ✅ 8. Create registration
      const registration = new EnhancedEventRegistration({
        event: event._id,
        ticketTier: {
          tierId: selectedTicketTier._id,
          name: selectedTicketTier.name,
          price: selectedTicketTier.price,
          quantityBooked: totalParticipants
        },
        registrant: {
          userId: registrant.userId,
          name: registrant.name.trim(),
          email: registrant.email.toLowerCase().trim(),
          phone: registrant.phone.trim()
        },
        additionalParticipants: processedParticipants,
        totalAmount,
        currency: "INR",
        paymentStatus: totalAmount > 0 ? "initiated" : "paid",
        reservationExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        reservationStatus: 'active'
      });

      await registration.save({ session });

      // ✅ 9. Handle free registration (amount = 0)
      if (totalAmount === 0) {
        await sendConfirmationEmail(registration, event);
        registration.confirmationSent = true;
        await registration.save({ session });

        return res.status(201).json({
          success: true,
          message: "Free registration successful",
          data: {
            registrationId: registration._id,
            totalAmount,
            currency: "INR",
            totalParticipants,
            confirmationSent: true
          }
        });
      }

      // ✅ 10. Create payment order for paid events
      const paymentOrder = await createPaymentOrder({
        amount: totalAmount,
        registrationId: registration._id,
        userId: registrant.userId
      });

      // Save orderId into registration
      registration.paymentOrderId = paymentOrder.id;
      await registration.save({ session });

      // ✅ 11. Return response with payment details
      res.status(201).json({
        success: true,
        message: "Registration created successfully. Proceed to payment.",
        data: {
          registrationId: registration._id,
          totalAmount,
          currency: "INR",
          totalParticipants,
          ticketTier: selectedTicketTier.name,
          paymentOrder
        }
      });
    });

  } catch (error) {
    console.error("Enhanced Event Registration Error:", error);
    
    // If registration fails, we need to restore ticket quantity
    // This will be handled by the session rollback automatically
    
    res.status(500).json({ 
      success: false,
      message: "Registration failed",
      error: error.message 
    });
  } finally {
    await session.endSession();
  }
};

/**
 * STEP 2: Create Payment Order for Enhanced Event Registration
 */
export const createPaymentForEnhancedEvent = async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const { registrationId } = req.params;

    console.log("📌 createPaymentForEnhancedEvent called with ID:", registrationId);

    const registration = await EnhancedEventRegistration.findById(registrationId)
      .populate('event');

    if (!registration) {
      return res.status(404).json({ 
        success: false,
        error: "Registration not found" 
      });
    }

    // Validate that the authenticated user owns this registration
    if (registration.registrant.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        error: "Access denied. You can only make payments for your own registrations." 
      });
    }

    if (registration.paymentStatus === "paid") {
      return res.status(400).json({ 
        success: false,
        error: "Payment already completed" 
      });
    }

    // Load registrant user
    const user = await EnhancedUser.findById(registration.registrant.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "Registrant user not found" 
      });
    }

    if (!user.paymentMethods || user.paymentMethods.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No payment method found. Please add a payment method first." 
      });
    }

    // Find chosen payment method
    const selectedMethod = user.getPaymentMethodById(paymentMethodId);
    if (!selectedMethod) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid or missing payment method" 
      });
    }

    console.log("✅ Payment method selected:", selectedMethod.type);

    // ---- CASE 1: Wallet Payment ----
    if (selectedMethod.type === "wallet") {
      if (user.wallet.availableBalance < registration.totalAmount) {
        return res.status(400).json({ 
          success: false,
          error: "Insufficient wallet balance" 
        });
      }

      // Deduct wallet balance
      user.wallet.availableBalance -= registration.totalAmount;
      await user.save();

      // Mark registration as paid and convert reservation
      registration.paymentStatus = "paid";
      registration.reservationStatus = "converted";
      registration.paymentProvider = "wallet";
      registration.paymentProviderData = {
        paymentMethodId,
        type: "wallet",
        debitedAmount: registration.totalAmount,
        paymentDate: new Date()
      };
      await registration.save();

      // Convert reservation to sale (remove from reserved, keep in quantity)
      const event = await EnhancedEvent.findById(registration.event);
      if (event) {
        const ticketTier = event.ticketTypes.find(
          tier => tier._id.toString() === registration.ticketTier.tierId.toString()
        );
        if (ticketTier) {
          ticketTier.reservedQuantity -= registration.ticketTier.quantityBooked;
          await event.save();
        }
      }

      // Send confirmation email
      await sendConfirmationEmail(registration, registration.event);
      registration.confirmationSent = true;
      await registration.save();

      return res.json({
        success: true,
        message: "Payment successful via wallet",
        data: {
          registrationId: registration._id,
          totalAmount: registration.totalAmount,
          currency: registration.currency,
          paymentMethod: "wallet"
        }
      });
    }

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
          return res.status(500).json({ 
            success: false,
            error: "Failed to create payment order" 
          });
        }

        registration.paymentProvider = "razorpay";
        registration.paymentProviderData = { 
          orderId: order.id, 
          paymentMethodId,
          paymentDate: new Date()
        };
        registration.paymentStatus = "pending"; // until verified
        await registration.save();

        return res.json({
          success: true,
          message: "Payment order created successfully",
          data: {
            registrationId: registration._id,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID || "mock_key"
          }
        });
      } catch (err) {
        console.error("❌ Razorpay order creation failed:", err);
        return res.status(500).json({ 
          success: false,
          error: "Failed to create payment order", 
          details: err.message 
        });
      }
    }

    // ---- CASE 3: Unsupported method ----
    return res.status(400).json({ 
      success: false,
      error: "Payment method not supported yet" 
    });

  } catch (error) {
    console.error("❌ Payment creation error:", error);
    res.status(500).json({ 
      success: false,
      message: "Payment processing failed",
      error: error.message 
    });
  }
};

/**
 * STEP 3: Verify Payment for Enhanced Event Registration
 */
export const verifyEnhancedEventPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;
    
    const { registrationId } = req.params;
    
    const registration = await EnhancedEventRegistration.findById(registrationId)
      .populate('event');
      
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        error: "Registration not found" 
      });
    }

    // Validate that the authenticated user owns this registration
    if (registration.registrant.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        error: "Access denied. You can only verify payments for your own registrations." 
      });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Payment verification failed - restore ticket quantity and cancel reservation
      await restoreTicketQuantityAndCancelReservation(registration);
      
      registration.paymentStatus = "failed";
      registration.reservationStatus = "cancelled";
      await registration.save();
      
      return res.status(400).json({ 
        success: false,
        error: "Invalid signature, tickets restored" 
      });
    }

    // Mark as paid and convert reservation
    registration.paymentStatus = "paid";
    registration.reservationStatus = "converted";
    registration.paymentProviderData = {
      ...(registration.paymentProviderData || {}),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentDate: new Date()
    };
    await registration.save();

    // Convert reservation to sale (remove from reserved, keep in quantity)
    const event = await EnhancedEvent.findById(registration.event);
    if (event) {
      const ticketTier = event.ticketTypes.find(
        tier => tier._id.toString() === registration.ticketTier.tierId.toString()
      );
      if (ticketTier) {
        ticketTier.reservedQuantity -= registration.ticketTier.quantityBooked;
        await event.save();
      }
    }

    // Send confirmation email
    await sendConfirmationEmail(registration, registration.event);
    registration.confirmationSent = true;
    await registration.save();

    res.json({ 
      success: true,
      message: "Payment verified successfully",
      data: {
        registrationId: registration._id,
        paymentStatus: "paid"
      }
    });
    
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ 
      success: false,
      message: "Payment verification failed",
      error: error.message 
    });
  }
};

/**
 * STEP 4: Get Enhanced Event Registration Summary
 */
export const getEnhancedEventRegistrationSummary = async (req, res) => {
  try {
    const { registrationId } = req.params;
    
    const registration = await EnhancedEventRegistration.findById(registrationId)
      .populate('event', 'eventName startDate endDate location eventMode eventUrl description bannerImage');

    if (!registration) {
      return res.status(404).json({ 
        success: false,
        error: "Registration not found" 
      });
    }

    // Validate that the authenticated user owns this registration
    if (registration.registrant.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        error: "Access denied. You can only view your own registrations." 
      });
    }

    const event = registration.event;
    const summary = {
      registrationId: registration._id,
      event: {
        name: event.eventName,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        mode: event.eventMode,
        location: event.location,
        eventUrl: event.eventUrl,
        bannerImage: event.bannerImage
      },
      ticketTier: {
        name: registration.ticketTier.name,
        price: registration.ticketTier.price,
        quantityBooked: registration.ticketTier.quantityBooked
      },
      registrant: registration.registrant,
      additionalParticipants: registration.additionalParticipants,
      totalAmount: registration.totalAmount,
      currency: registration.currency,
      paymentStatus: registration.paymentStatus,
      registrationDate: registration.registrationDate,
      confirmationSent: registration.confirmationSent
    };

    res.json({ 
      success: true,
      data: { summary } 
    });
    
  } catch (error) {
    console.error("Registration summary error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch registration summary",
      error: error.message 
    });
  }
};

/**
 * Get Enhanced Event Participants (for organizers)
 */
export const getEnhancedEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const registrations = await EnhancedEventRegistration.find({ 
      event: eventId, 
      status: 'active',
      paymentStatus: 'paid'
    })
    .select('registrant additionalParticipants registrationDate ticketTier')
    .sort({ registrationDate: -1 });

    // Flatten participants
    const participants = registrations.flatMap(reg => [
      {
        registrationId: reg._id,
        name: reg.registrant.name,
        email: reg.registrant.email,
        phone: reg.registrant.phone,
        userId: reg.registrant.userId,
        isPrimaryRegistrant: true,
        ticketTier: reg.ticketTier.name,
        registrationDate: reg.registrationDate
      },
      ...(reg.additionalParticipants?.map(participant => ({
        registrationId: reg._id,
        name: participant.name,
        email: participant.email,
        phone: participant.phone,
        userId: participant.userId,
        isPrimaryRegistrant: false,
        isRegisteredUser: participant.isRegisteredUser,
        ticketTier: reg.ticketTier.name,
        registrationDate: reg.registrationDate
      })) || [])
    ]);

    res.json({ 
      success: true,
      data: { 
        participants,
        totalParticipants: participants.length,
        totalRegistrations: registrations.length
      } 
    });
    
  } catch (error) {
    console.error("Get participants error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch event participants",
      error: error.message 
    });
  }
};

/**
 * Get User's Enhanced Event Registrations
 */
export const getUserEnhancedEventRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const registrations = await EnhancedEventRegistration.find({ 
      'registrant.userId': userId,
      status: 'active'
    })
    .populate('event', 'eventName startDate endDate location eventMode bannerImage')
    .sort({ registrationDate: -1 });

    res.json({ 
      success: true,
      data: { 
        registrations,
        totalRegistrations: registrations.length
      } 
    });
    
  } catch (error) {
    console.error("Get user registrations error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch user registrations",
      error: error.message 
    });
  }
};

/**
 * Helper function to restore ticket quantity and cancel reservation when payment fails
 */
const restoreTicketQuantityAndCancelReservation = async (registration) => {
  try {
    const event = await EnhancedEvent.findById(registration.event);
    if (!event) return;

    const ticketTier = event.ticketTypes.find(
      tier => tier._id.toString() === registration.ticketTier.tierId.toString()
    );

    if (ticketTier) {
      // Remove from reserved and restore to available
      ticketTier.reservedQuantity -= registration.ticketTier.quantityBooked;
      ticketTier.quantity += registration.ticketTier.quantityBooked;
      await event.save();
      console.log(`✅ Restored ${registration.ticketTier.quantityBooked} tickets for tier ${ticketTier.name}`);
    }
  } catch (error) {
    console.error("❌ Failed to restore ticket quantity:", error);
  }
};

/**
 * Helper function to cleanup expired reservations
 */
export const cleanupExpiredReservations = async () => {
  try {
    const expiredReservations = await EnhancedEventRegistration.find({
      reservationStatus: 'active',
      reservationExpiresAt: { $lt: new Date() }
    });

    console.log(`🧹 Found ${expiredReservations.length} expired reservations to cleanup`);

    for (const registration of expiredReservations) {
      await restoreTicketQuantityAndCancelReservation(registration);
      registration.reservationStatus = 'expired';
      await registration.save();
    }

    console.log(`✅ Cleaned up ${expiredReservations.length} expired reservations`);
  } catch (error) {
    console.error("❌ Failed to cleanup expired reservations:", error);
  }
};
