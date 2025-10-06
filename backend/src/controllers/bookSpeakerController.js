import Booking from "../models/bookingSpeaker.js";
import EnhancedProfile from "../models/enhancedProfile.js";
import Availability from "../models/availability.js";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";

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

// Get organizer's bookings grouped by status
export const getOrganizerBookings = async (req, res) => {
  try {
    const organizerId = req.user._id;

    // Find all bookings for this organizer
    const bookings = await Booking.find({ organizer: organizerId })
      .populate({
        path: 'speaker',
        select: 'firstName lastName profileImageUrl role areaOfExpertise professionalTitle bio'
      })
      .sort({ createdAt: -1 }); // Most recent first

    // Helper function to calculate time ago
    const getTimeAgo = (date) => {
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
      return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    };

    // Helper function to format booking data
    const formatBooking = (booking) => ({
      _id: booking._id,
      bookingId: booking.bookingId,
      speaker: {
        _id: booking.speaker._id,
        firstName: booking.speaker.firstName,
        lastName: booking.speaker.lastName,
        profileImageUrl: booking.speaker.profileImageUrl,
        expertise: booking.speaker.areaOfExpertise?.join(', ') || 
                  booking.speaker.professionalTitle || 
                  'General Speaking'
      },
      eventDetails: {
        name: booking.eventDetails.name,
        type: booking.eventDetails.type,
        location: booking.eventDetails.location,
        expectedAttendees: booking.eventDetails.expectedAttendees
      },
      compensationAndArrangements: {
        primaryCompensation: {
          speakerFeeAmount: booking.compensationAndArrangements.primaryCompensation.speakerFeeAmount
        }
      },
      date: booking.date.toISOString().split('T')[0], // YYYY-MM-DD format
      timeSlot: booking.timeSlot,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      timeAgo: getTimeAgo(booking.createdAt)
    });

    // Group bookings by status
    const inProgress = [];
    const confirmed = [];
    const declined = [];

    bookings.forEach(booking => {
      const formattedBooking = formatBooking(booking);
      
      switch (booking.status) {
        case 'pending':
          inProgress.push(formattedBooking);
          break;
        case 'accepted':
          confirmed.push(formattedBooking);
          break;
        case 'declined':
          declined.push(formattedBooking);
          break;
        default:
          // Handle any other statuses
          inProgress.push(formattedBooking);
      }
    });

    // Calculate statistics
    const stats = {
      total: bookings.length,
      inProgress: inProgress.length,
      confirmed: confirmed.length,
      declined: declined.length
    };

    console.log(`📊 Retrieved ${bookings.length} bookings for organizer ${organizerId}`);
    console.log(`📊 Stats: ${stats.inProgress} in progress, ${stats.confirmed} confirmed, ${stats.declined} declined`);

    return res.status(200).json({
      success: true,
      data: {
        inProgress,
        confirmed,
        declined
      },
      stats
    });

  } catch (error) {
    console.error("Error fetching organizer bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching organizer bookings",
      error: error.message
    });
  }
};

// Accept booking request
export const acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const speakerId = req.user._id;

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('speaker', 'firstName lastName email role');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Debug: Log booking details
    console.log("🔍 DEBUG booking details:");
    console.log("🔍 booking._id:", booking._id);
    console.log("🔍 booking.speaker:", booking.speaker);
    console.log("🔍 booking.organizer:", booking.organizer);
    console.log("🔍 booking.status:", booking.status);

    // Debug: Log booking and speaker IDs
    console.log("🔍 DEBUG acceptBooking:");
    console.log("🔍 bookingId:", bookingId);
    console.log("🔍 booking.speaker:", booking.speaker);
    console.log("🔍 booking.speaker._id:", booking.speaker._id);
    console.log("🔍 booking.speaker._id.toString():", booking.speaker._id.toString());
    console.log("🔍 speakerId (req.user._id):", speakerId);
    console.log("🔍 speakerId.toString():", speakerId.toString());
    
    // Handle both populated and non-populated speaker objects
    const bookingSpeakerId = booking.speaker._id ? booking.speaker._id.toString() : booking.speaker.toString();
    console.log("🔍 bookingSpeakerId (final):", bookingSpeakerId);
    console.log("🔍 IDs match:", bookingSpeakerId === speakerId.toString());

    // Verify the speaker is the one being booked
    if (bookingSpeakerId !== speakerId.toString()) {
      console.log("❌ Speaker ID mismatch - booking not for this speaker");
      console.log("❌ Expected:", speakerId.toString());
      console.log("❌ Found:", bookingSpeakerId);
      return res.status(403).json({
        success: false,
        message: "You can only accept bookings sent to you"
      });
    }

    // Check if booking is still pending
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`
      });
    }

    // Update booking status
    booking.status = 'accepted';
    booking.acceptedAt = new Date();
    await booking.save();

    // Block availability slot for confirmed booking
    try {
      const availability = await Availability.findOne({ 
        userId: booking.speaker,
        date: booking.date 
      });

      if (availability) {
        // Check if slot is already blocked for this booking
        const existingBlock = availability.blockedSlots.find(
          block => block.bookingId.toString() === booking._id.toString()
        );

        if (!existingBlock) {
          // Add blocked slot
          availability.blockedSlots.push({
            bookingId: booking._id,
            date: booking.date,
            timeSlot: booking.timeSlot,
            reason: 'booking_confirmed'
          });
          
          await availability.save();
          console.log(`🚫 Blocked availability slot for speaker ${booking.speaker} on ${booking.date} at ${booking.timeSlot}`);
        } else {
          console.log(`⚠️ Availability slot already blocked for booking ${booking._id}`);
        }
      } else {
        console.log(`⚠️ No availability record found for speaker ${booking.speaker} on ${booking.date}`);
      }
    } catch (availabilityError) {
      console.error('❌ Error blocking availability slot:', availabilityError);
      // Don't fail the entire operation if availability blocking fails
    }

    // Find the conversation
    const conversation = await Conversation.findById(booking.conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    // Create acceptance message
    const acceptanceMessage = new Message({
      content: `✅ **BOOKING ACCEPTED**

Great news! I'm excited to accept your speaking invitation for "${booking.eventDetails.name}".

**Confirmed Details:**
📅 Date: ${new Date(booking.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
🕐 Time: ${booking.timeSlot}
📍 Location: ${booking.eventDetails.location}
👥 Audience: ${booking.eventDetails.expectedAttendees} attendees
💰 Compensation: ${booking.compensationAndArrangements.primaryCompensation.speakerFeeAmount ? `$${booking.compensationAndArrangements.primaryCompensation.speakerFeeAmount.toLocaleString()}` : 'As discussed'}

I'm looking forward to delivering value to your audience and making this event a success!

Please let me know if there are any additional details or preparations needed from my end.

Best regards,
${req.user.firstName} ${req.user.lastName}`,
      messageType: 'booking_accepted',
      sender: speakerId,
      conversation: booking.conversationId,
      metadata: {
        bookingId: booking._id,
        eventId: null,
        amount: booking.compensationAndArrangements.primaryCompensation.speakerFeeAmount,
        currency: 'USD',
        proposalType: 'accepted'
      }
    });

    await acceptanceMessage.save();

    // Update conversation's last message
    conversation.lastMessage = {
      content: `✅ Booking accepted for ${booking.eventDetails.name}`,
      sender: speakerId,
      timestamp: acceptanceMessage.createdAt,
      messageType: 'booking_accepted'
    };
    await conversation.save();

    // Import socketService for real-time updates
    const socketService = (await import('../services/socketService.js')).default;

    // Populate conversation data for broadcast
    await conversation.populate([
      { path: 'participants.user', select: 'firstName lastName profileImageUrl role' },
      { path: 'lastMessage.sender', select: 'firstName lastName profileImageUrl' }
    ]);

    // Broadcast booking acceptance to both participants
    console.log(`📡 Broadcasting booking acceptance to organizer: user_${booking.organizer}`);
    socketService.io.to(`user_${booking.organizer}`).emit('booking_status_changed', {
      type: 'booking_accepted',
      booking: booking,
      conversation: conversation,
      message: acceptanceMessage,
      timestamp: new Date()
    });
    
    console.log(`📡 Broadcasting booking acceptance to speaker: user_${speakerId}`);
    socketService.io.to(`user_${speakerId}`).emit('booking_status_changed', {
      type: 'booking_accepted',
      booking: booking,
      conversation: conversation,
      message: acceptanceMessage,
      timestamp: new Date()
    });

    // Also broadcast new message to conversation
    socketService.io.to(`conversation_${booking.conversationId}`).emit('new_message', {
      message: acceptanceMessage,
      conversationId: booking.conversationId,
      timestamp: new Date()
    });

    console.log(`✅ Booking ${bookingId} accepted by speaker ${speakerId}`);

    return res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        acceptedAt: booking.acceptedAt
      },
      conversation: {
        _id: conversation._id,
        lastMessage: conversation.lastMessage
      }
    });

  } catch (error) {
    console.error("Error accepting booking:", error);
    return res.status(500).json({
      success: false,
      message: "Error while accepting booking",
      error: error.message
    });
  }
};

// Decline booking request
export const declineBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const speakerId = req.user._id;
    const { reason } = req.body; // Optional decline reason

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Handle both populated and non-populated speaker objects
    const bookingSpeakerId = booking.speaker._id ? booking.speaker._id.toString() : booking.speaker.toString();
    
    // Verify the speaker is the one being booked
    if (bookingSpeakerId !== speakerId.toString()) {
      console.log("❌ Speaker ID mismatch in decline - booking not for this speaker");
      console.log("❌ Expected:", speakerId.toString());
      console.log("❌ Found:", bookingSpeakerId);
      return res.status(403).json({
        success: false,
        message: "You can only decline bookings sent to you"
      });
    }

    // Check if booking is still pending
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`
      });
    }

    // Update booking status
    booking.status = 'declined';
    booking.declinedAt = new Date();
    booking.declineReason = reason || 'No reason provided';
    await booking.save();

    // Find the conversation
    const conversation = await Conversation.findById(booking.conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }

    // Create decline message
    const declineMessage = new Message({
      content: `❌ **BOOKING DECLINED**

Thank you for considering me for your speaking opportunity "${booking.eventDetails.name}".

I regret to inform you that I'm unable to accept this invitation at this time.

**Event Details:**
📅 Date: ${new Date(booking.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
🕐 Time: ${booking.timeSlot}
📍 Location: ${booking.eventDetails.location}

**Reason for declining:** ${reason || 'Scheduling conflict'}

I appreciate your interest in having me speak at your event, and I hope we can collaborate on future opportunities.

Thank you for understanding.

Best regards,
${req.user.firstName} ${req.user.lastName}`,
      messageType: 'booking_declined',
      sender: speakerId,
      conversation: booking.conversationId,
      metadata: {
        bookingId: booking._id,
        eventId: null,
        declineReason: reason || 'Scheduling conflict',
        proposalType: 'declined'
      }
    });

    await declineMessage.save();

    // Update conversation's last message
    conversation.lastMessage = {
      content: `❌ Booking declined for ${booking.eventDetails.name}`,
      sender: speakerId,
      timestamp: declineMessage.createdAt,
      messageType: 'booking_declined'
    };
    await conversation.save();

    // Import socketService for real-time updates
    const socketService = (await import('../services/socketService.js')).default;

    // Populate conversation data for broadcast
    await conversation.populate([
      { path: 'participants.user', select: 'firstName lastName profileImageUrl role' },
      { path: 'lastMessage.sender', select: 'firstName lastName profileImageUrl' }
    ]);

    // Broadcast booking decline to both participants
    console.log(`📡 Broadcasting booking decline to organizer: user_${booking.organizer}`);
    socketService.io.to(`user_${booking.organizer}`).emit('booking_status_changed', {
      type: 'booking_declined',
      booking: booking,
      conversation: conversation,
      message: declineMessage,
      timestamp: new Date()
    });
    
    console.log(`📡 Broadcasting booking decline to speaker: user_${speakerId}`);
    socketService.io.to(`user_${speakerId}`).emit('booking_status_changed', {
      type: 'booking_declined',
      booking: booking,
      conversation: conversation,
      message: declineMessage,
      timestamp: new Date()
    });

    // Also broadcast new message to conversation
    socketService.io.to(`conversation_${booking.conversationId}`).emit('new_message', {
      message: declineMessage,
      conversationId: booking.conversationId,
      timestamp: new Date()
    });

    console.log(`❌ Booking ${bookingId} declined by speaker ${speakerId}`);

    return res.status(200).json({
      success: true,
      message: "Booking declined successfully",
      booking: {
        _id: booking._id,
        bookingId: booking.bookingId,
        status: booking.status,
        declinedAt: booking.declinedAt,
        declineReason: booking.declineReason
      },
      conversation: {
        _id: conversation._id,
        lastMessage: conversation.lastMessage
      }
    });

  } catch (error) {
    console.error("Error declining booking:", error);
    return res.status(500).json({
      success: false,
      message: "Error while declining booking",
      error: error.message
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

    // No time slot validation - allow booking for any time
    // The speaker can decide to accept or decline based on their own schedule
    console.log("📅 Booking request for time:", startTime, "-", endTime);
    console.log("📅 Speaker availability on this date:", availability.timeSlots);

    // Create bookingId
    const count = await Booking.countDocuments();
    const bookingId = `BK-${String(count + 1).padStart(5, "0")}`;

    // Create or get conversation between organizer and speaker
    // First, try to find existing conversation without context restrictions
    let conversation = await Conversation.findOne({
      type: 'direct',
      status: 'active',
      $and: [
        { participants: { $elemMatch: { user: organizerId, isActive: true } } },
        { participants: { $elemMatch: { user: speakerId, isActive: true } } }
      ]
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      console.log("🆕 Creating new conversation between organizer and speaker");
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
        context: { 
          topic: eventName, // Use event name as topic for better organization
          bookingRequest: true 
        },
        status: 'active'
      });
      await conversation.save();
      console.log("✅ New conversation created:", conversation._id);
    } else {
      console.log("♻️ Reusing existing conversation:", conversation._id);
      // Update context with new event info if needed
      if (!conversation.context?.topic || conversation.context.topic !== eventName) {
        conversation.context = {
          ...conversation.context,
          topic: eventName,
          bookingRequest: true
        };
        await conversation.save();
      }
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

    // --- No availability modification needed ---
    // Since we're not validating time slots, we don't need to modify availability
    // The speaker's availability remains unchanged and they can decide to accept/decline
    console.log("📅 Availability unchanged - speaker can accept/decline based on their preference");

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
ACCEPT - Confirm your participation
DECLINE - Politely decline this opportunity
NEGOTIATE - Discuss modifications to the proposal

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

    // Import socketService at the top if not already imported
    const socketService = (await import('../services/socketService.js')).default;

    // Populate conversation data for broadcast
    await conversation.populate([
      { path: 'participants.user', select: 'firstName lastName profileImageUrl role' },
      { path: 'lastMessage.sender', select: 'firstName lastName profileImageUrl' }
    ]);

    // Broadcast conversation creation to participants only
    console.log(`📡 Broadcasting to organizer room: user_${organizerId}`);
    socketService.io.to(`user_${organizerId}`).emit('conversation_created', {
      conversation: conversation,
      timestamp: new Date()
    });
    
    console.log(`📡 Broadcasting to speaker room: user_${speakerId}`);
    socketService.io.to(`user_${speakerId}`).emit('conversation_created', {
      conversation: conversation,
      timestamp: new Date()
    });

    console.log(`📡 Broadcasted conversation creation to participants: ${organizerId}, ${speakerId}`);
    console.log(`📡 Conversation data being sent:`, {
      id: conversation._id,
      participants: conversation.participants.map(p => ({ userId: p.user._id, role: p.role })),
      context: conversation.context
    });

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









