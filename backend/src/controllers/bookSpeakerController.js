import Booking from "../models/bookingSpeaker.js";
import EnhancedProfile from "../models/enhancedProfile.js";
import Availability from "../models/availability.js";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import mongoose from "mongoose";

// import User from "../models/user.js";

// GET /api/speaker-profile

export const getAllSpeakerProfiles = async (req, res) => {
  try {
    const profiles = await EnhancedProfile.find()
      .populate({
        path: "user",
        match: { role: "speaker" }, // ✅ Only users with speaker role
        select: "firstName lastName email role"
      });

    // Remove profiles with no matching user (null after match)
    const filteredProfiles = profiles.filter(profile => profile.user !== null);

    if (!filteredProfiles.length) {
      return res.status(404).json({ message: "No speaker profiles found" });
    }

    const formattedProfiles = filteredProfiles.map(profile => ({
      username: profile.user?.firstName
        ? `${profile.user.firstName} ${profile.user.lastName}`.trim()
        : "Unknown",
      email: profile.user?.email || null,
      role: profile.user?.role || "N/A",
      bio: profile.bio || null,
      about: profile.about || null,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
      awards: profile.awards,
      videos: profile.featuredVideos || []
    }));

    return res.status(200).json(formattedProfiles);
  } catch (error) {
    console.error("Error fetching speaker profiles:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching speaker profiles"
    });
  }
};

export const createSpeakerBooking = async (req, res) => {
  try {
    const organizerId = req.user._id;

    // Destructure request body
    const {
      speakerId,
      date,
      startTime,
      endTime,
      eventName,
      eventType,
      location,
      attendees,
      offerAmount,
      currency,
      specialRequests,
      personalMessage
    } = req.body;

    // Validate required fields
    if (!speakerId || !date || !startTime || !endTime || !eventName || !eventType || !location || !attendees) {
      return res.status(400).json({
        success: false,
        message: "Speaker ID, date, time, event name, type, location, and attendees are required"
      });
    }

    if (!offerAmount || offerAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Offer amount must be greater than 0"
      });
    }

    // Validate Speaker
    const speakerProfile = await EnhancedProfile.findOne({ user: speakerId });
    if (!speakerProfile) {
      return res.status(404).json({ success: false, message: "Speaker not found" });
    }

    // Check availability for selected date
    const selectedDate = new Date(date);
    selectedDate.setUTCHours(0, 0, 0, 0);
    console.log("🔍 selectedDate:", selectedDate);
    console.log("🔍 speakerId:", speakerId);
    console.log("🔍 date from frontend:", date);
    
    // Debug: Check all availability for this speaker
    const allAvailabilities = await Availability.find({ userId: speakerId });
    console.log("🔍 All availabilities for speaker:", allAvailabilities.length);
    allAvailabilities.forEach((avail, index) => {
      console.log(`📅 Availability ${index + 1}:`, {
        _id: avail._id,
        date: avail.date,
        dateISO: avail.date.toISOString(),
        timeSlots: avail.timeSlots?.length || 0
      });
    });
    
    const availability = await Availability.findOne({
      userId: speakerId,
      date: selectedDate
    });

    if (!availability) {
      console.log("❌ No availability found for selected date:", selectedDate.toISOString());
      return res.status(404).json({
        success: false,
        message: "Speaker not available on selected date"
      });
    }
    
    console.log("✅ Found availability:", availability._id);

    // Find the slot being booked
    const slotMatch = availability.timeSlots.find(
      slot => startTime >= slot.startTime && endTime <= slot.endTime
    );

    if (!slotMatch) {
      return res.status(400).json({
        success: false,
        message: "Selected date/time is not available for this speaker"
      });
    }

    // Create bookingId
    const count = await Booking.countDocuments();
    const bookingId = `BK-${String(count + 1).padStart(5, "0")}`;

    // Create or get conversation between organizer and speaker
    let conversation = await Conversation.findBetweenUsers(organizerId, speakerId, 'direct');
    
    if (!conversation) {
      conversation = new Conversation({
        participants: [
          {
            user: organizerId,
            role: req.user.role,
            joinedAt: new Date(),
            lastReadAt: new Date(),
            isActive: true
          },
          {
            user: speakerId,
            role: 'speaker',
            joinedAt: new Date(),
            lastReadAt: new Date(),
            isActive: true
          }
        ],
        type: 'direct',
        context: { bookingRequest: true },
        status: 'active'
      });
      await conversation.save();
    }

    // Create Booking
    const booking = new Booking({
      bookingId,
      organizer: organizerId,
      speaker: speakerId,
      date: new Date(date),
      timeSlot: `${startTime}-${endTime}`,
      eventDetails: {
        name: eventName,
        type: eventType,
        location: location,
        expectedAttendees: attendees,
        specialRequirement: specialRequests || "",
        personalMessage: personalMessage || ""
      },
      compensationAndArrangements: {
        primaryCompensation: {
          speakerFeeAmount: offerAmount,
          honorariumFeeAmount: 0
        },
        travel: {
          travelMode: "",
          arrangements: "",
          offeredAmount: 0
        },
        lodging: {
          accommodationType: "",
          lodgingArrangement: "",
          checkInDate: null,
          checkOutDate: null
        },
        additionalArrangements: {
          localTransportation: "",
          meals: "",
          additionalExpenses: specialRequests || ""
        }
      },
      status: 'pending',
      conversationId: conversation._id
    });

    await booking.save();

    // --- Update availability by removing the booked time slot ---
    const newTimeSlots = [];

    for (let slot of availability.timeSlots) {
      if (slot.startTime === slotMatch.startTime && slot.endTime === slotMatch.endTime) {
        // Partial slot before booking
        if (startTime > slot.startTime) {
          newTimeSlots.push({ ...slot, endTime: startTime });
        }
        // Partial slot after booking
        if (endTime < slot.endTime) {
          newTimeSlots.push({ ...slot, startTime: endTime });
        }
      } else {
        newTimeSlots.push(slot); // unaffected slots
      }
    }

    availability.timeSlots = newTimeSlots;

    // Remove the entire availability document if no slots left
    if (availability.timeSlots.length === 0) {
      await Availability.deleteOne({ _id: availability._id });
    } else {
      // Save updated availability
      await availability.save();
    }

    // Create booking request message with action buttons
    const bookingMessage = new Message({
      content: personalMessage || `Dear Speaker,

I hope this message finds you well. I am reaching out to invite you to speak at our upcoming "${eventName}" ${eventType} based on your exceptional expertise.

SPEAKING OPPORTUNITY DETAILS:
📍 Event: ${eventName}
📍 Location: ${location}
👥 Audience: ${attendees} attendees
⏰ Duration: ${startTime} - ${endTime}
📅 Date: ${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
💰 Compensation: ${currency || '$'}${offerAmount.toLocaleString()}
🚗 Special Arrangements: ${specialRequests || 'None specified'}

WHAT WE OFFER:
• Professional speaking fee/honorarium as outlined
• Travel and accommodation arrangements (if applicable)
• Professional event production and support
• Networking opportunities with industry leaders
• Post-event content and marketing materials

We believe your insights would provide tremendous value to our audience, and we would be honored to have you as our speaker.

Please review the detailed proposal below and let me know if you would like to:
✅ ACCEPT - Confirm your participation
❌ DECLINE - Politely decline this opportunity
🤝 NEGOTIATE - Discuss modifications to the proposal

Looking forward to your response!

Best regards,
${req.user.firstName} ${req.user.lastName}`,
      messageType: 'booking_request',
      sender: organizerId,
      conversation: conversation._id,
      metadata: {
        bookingId: booking._id,
        eventId: null,
        amount: offerAmount,
        currency: currency || 'USD',
        proposalType: 'initial'
      }
    });

    await bookingMessage.save();

    // Update booking with message reference
    booking.messageId = bookingMessage._id;
    await booking.save();

    // Update conversation's last message
    conversation.lastMessage = {
      content: bookingMessage.content,
      sender: organizerId,
      timestamp: bookingMessage.createdAt,
      messageType: 'booking_request'
    };
    await conversation.save();

    // Populate the response data
    await booking.populate([
      { path: 'organizer', select: 'firstName lastName email' },
      { path: 'speaker', select: 'firstName lastName email' }
    ]);

    return res.status(201).json({
      success: true,
      message: "Booking request sent successfully",
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        date: booking.date,
        timeSlot: booking.timeSlot,
        eventDetails: booking.eventDetails,
        compensationAndArrangements: booking.compensationAndArrangements,
        organizer: booking.organizer,
        speaker: booking.speaker,
        conversationId: booking.conversationId,
        messageId: booking.messageId,
        createdAt: booking.createdAt
      },
      conversation: {
        _id: conversation._id,
        participants: conversation.participants,
        lastMessage: conversation.lastMessage
      }
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Error while booking speaker",
      error: error.message
    });
  }
};









