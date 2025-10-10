import Event from "../models/event.js";
import UserRole from "../models/userRole.js";
import EnhancedUser from "../models/enhancedUser.js";
import Profile from "../models/profile.js";

// Helper function to check if user is organizer
const isOrganizer = (event, userId) => {
  return event.organizer.userId.toString() === userId.toString();
};

// Helper function to categorize events
const categorizeEvents = (events) => {
  const now = new Date();
  return {
    past: events.filter(event => new Date(event.eventDate) < now),
    upcoming: events.filter(event => new Date(event.eventDate) >= now)
  };
};

// Create an event
export const createEvent = async (req, res) => {
  let data;
  
  // Handle FormData - all fields come directly in req.body
  data = req.body;
   
  // Debug logging
  console.log('Raw request body:', req.body);
  console.log('Parsed data:', data);
  
  try {
    const {
      topic,
      description,
      totalAudienceCount,
      pricePerHead,
      speakers,
      eventDate,
      eventStartTime,
      eventEndTime,
      eventMode,
      eventLocation,
      venueAddress,
      tickets
    } = data;
    
    // Debug logging for speakers
    console.log('Speakers data:', speakers);
    console.log('Speakers type:', typeof speakers);
    console.log('Speakers is array:', Array.isArray(speakers));


    let validatedTickets = [];
    if (tickets) {
      let ticketArray = typeof tickets === "string" ? JSON.parse(tickets) : tickets;
      if (!Array.isArray(ticketArray)) {
        return res.status(400).json({
          success: false,
          message: "Tickets must be an array"
        });
      }

      validatedTickets = ticketArray.map((ticket, index) => {
        if (!ticket.ticketName) {
          throw new Error(`Ticket ${index + 1} is missing ticketName`);
        }
        if (ticket.ticketType === "paid" && (!ticket.price || ticket.price <= 0)) {
          throw new Error(`Ticket ${index + 1} must have valid price for paid type`);
        }
        if (ticket.quantity <= 0) {
          throw new Error(`Ticket ${index + 1} must have quantity > 0`);
        }
        if (ticket.salesStart && ticket.salesEnd && new Date(ticket.salesStart) > new Date(ticket.salesEnd)) {
          throw new Error(`Ticket ${index + 1} has invalid sales date range`);
        }

        return {
          ticketName: ticket.ticketName,
          ticketType: ticket.ticketType,
          price: ticket.ticketType === "paid" ? ticket.price : 0,
          currency: ticket.currency || "INR",
          quantity: ticket.quantity,
          salesStart: ticket.salesStart ? new Date(ticket.salesStart) : null,
          salesEnd: ticket.salesEnd ? new Date(ticket.salesEnd) : null
        };
      });
    }

    // Event Banner Validation - Made optional for now
    if (req.file) {
      // If banner is provided, validate it
      // Banner validation logic can be added here later
    }

    // Speaker Validation - Simplified for now
    let validatedSpeakers = [];
    
    // Ensure speakers is always an array
    let speakersArray = [];
if (speakers) {
  if (typeof speakers === 'string') {
    try {
      speakersArray = JSON.parse(speakers);
      if (!Array.isArray(speakersArray)) throw new Error();
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid speakers format. Must be a JSON array.'
      });
    }
  } else if (Array.isArray(speakers)) {
    speakersArray = speakers.map(sp => {
      if (typeof sp === 'string') {
        try {
          return JSON.parse(sp);
        } catch (err) {
          return null;
        }
      }
      return sp;
    }).filter(Boolean); // remove nulls
  }
}

// Validate speakers against User collection
const invalidSpeakers = [];

for (const speaker of speakersArray) {
  let email;
  if (typeof speaker === 'string') {
    email = speaker.toLowerCase().trim();
  } else if (speaker && typeof speaker === 'object') {
    email = speaker.email?.toLowerCase().trim();
  } else {
    continue; // Skip invalid entries
  }
  email = speaker.email;
if (!email) continue;
email = email.toString().trim().toLowerCase();

  console.log('Checking speaker in DB:', email);
//  const user = await User.findOne({
//   email: { $regex: `^${email}$`, $options: 'i' },  // ignore case in email
//   role: { $regex: `^speaker$`, $options: 'i' }     // ignore case in role
// });
 // Use case-insensitive email match and role check (normalize role)
  const user = await EnhancedUser.findOne({
    email: { $regex: new RegExp(`^${email}$`, 'i') },
    role: { $in: ['speaker', 'Speaker'] } // Accept either
  });


  console.log('DB user found:', user);
  if (user) {
    validatedSpeakers.push({
      email,
      userId: user._id,
      name: speaker.name || `${user.firstName} ${user.lastName}`.trim(),
      title: speaker.title || '',
      bio: speaker.bio || ''
    });
    console.log('DB user found:', user.email);
  } else {
    invalidSpeakers.push(email);
    console.log('DB user not found for:', email);
  }
}

if (invalidSpeakers.length > 0) {
  return res.status(400).json({
    success: false,
    message: 'Some speakers are not registered users',
    invalidSpeakers
  });
}

console.log('Validated speakers:', validatedSpeakers);


    // Event Mode Validation
    if (eventMode === 'online' && !eventLocation) {
      return res.status(400).json({
        success: false,
        message: 'Online events require platform selection',
        validOptions: ['zoom pro', 'google meet', 'personal link']
      });
    }

    if (eventMode === 'offline' && !venueAddress) {
      return res.status(400).json({
        success: false,
        message: 'Physical venue address required',
        requirements: {
          maxLength: '500 characters',
          example: '123 Main St, City, Country'
        }
      });
    }

    // Event Creation
    const eventData = {
      topic,
      description,
      totalAudienceCount: parseInt(totalAudienceCount),
      pricePerHead: parseFloat(pricePerHead),
      speakers: validatedSpeakers,
      organizer: {
        email: req.user.email,
        userId: req.user._id
      },
      eventDate: new Date(eventDate),
      eventStartTime,
      eventEndTime,
      eventMode,
      eventLocation: eventMode === 'online' ? eventLocation : undefined,
      venueAddress: eventMode === 'offline' ? venueAddress : undefined,
      tickets: validatedTickets,
      createdBy: req.user._id
    };

    // Add banner if provided
    if (req.file) {
      eventData.eventBanner = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const newEvent = new Event(eventData);

    // Save event
    await newEvent.validate();
    const savedEvent = await newEvent.save();

    // Update all speakers' profiles (only if userId exists)
    const speakerUpdates = savedEvent.speakers
      .filter(speaker => speaker.userId) // Only update profiles for speakers with userId
      .map(async (speaker) => {
        try {
          await Profile.findOneAndUpdate(
            { user: speaker.userId },
            { $addToSet: { expertEvents: savedEvent._id } },
            { new: true, upsert: true }
          );
        } catch (err) {
          console.error(`Failed to update profile for ${speaker.email}:`, err);
        }
      });

    if (speakerUpdates.length > 0) {
      await Promise.all(speakerUpdates);
    }

    const eventWithStatus = {
      ...savedEvent.toObject(),
      status: savedEvent.eventDate < new Date() ? 'past' : 'upcoming'
    };

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        ...eventWithStatus,
        speakerCount: validatedSpeakers.length,
        organizerInfo: {
          name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Unknown',
          email: req.user.email
        }
      }
    });

  } catch (error) {
    console.error('Event Creation Error:', error);

    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate event detected',
        fields: Object.keys(error.keyPattern)
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      systemMessage: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all events - ADMIN ONLY (not used by frontend)
// This endpoint returns ALL events from ALL organizers
// Frontend uses getUserEvents() which only returns current user's events
export const getAllEvents = async (req, res) => {
  try {
    // TODO: Add admin role check here if needed
    // For now, this endpoint is protected by ensureAuthenticated but accessible to all authenticated users
    
    const events = await Event.find()
      // .populate('speakers.userId', 'name email profileImage')
      .populate('organizer.userId', 'name email')
      .sort({ eventDate: 1 }) // Sort by event date
      .lean();

    const categorized = categorizeEvents(events);
// console.log("event from line 319",JSON.Stringify(events))
console.log("event from line 320",events);

    res.status(200).json({
      success: true,
      data: {
        past: categorized.past.map(event => ({
          ...event,
          status: 'past'
        })),
        upcoming: categorized.upcoming.map(event => ({
          ...event,
          status: 'upcoming'
        })),
        count: {
          total: events.length,
          past: categorized.past.length,
          upcoming: categorized.upcoming.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching events',
      error: error.message
    });
  }
};

// get events for a particular organizer or speaker
export const getUserEvents = async (req, res) => {
  try {
    // Get events where user is organizer or speaker
    const [organizedEvents, speakerEvents] = await Promise.all([
      Event.find({ 'organizer.userId': req.user._id }).lean(),
      Event.find({ 'speakers.userId': req.user._id }).lean()
    ]);

    // Combine and deduplicate
    const allEvents = [...organizedEvents, ...speakerEvents]
      .filter((event, index, self) => 
        index === self.findIndex(e => e._id.toString() === event._id.toString())
      );

    const categorized = categorizeEvents(allEvents);

    res.status(200).json({
      success: true,
      data: {
        past: categorized.past,
        upcoming: categorized.upcoming,
        count: {
          total: allEvents.length,
          past: categorized.past.length,
          upcoming: categorized.upcoming.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching user events'
    });
  }
};

// Get an event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
  .lean();


    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
if (!req.user || !req.user._id) {
  return res.status(401).json({ success: false, message: 'User not authenticated' });
}
    // Check if user is authorized to view this event
    // User can view if they are the organizer or a speaker
    // Handle both populated and unpopulated organizer.userId cases
    //commented below code because there is nothing like userId._id. there is only userId
    // let eventOrganizerId;
    // if (typeof event.organizer.userId === 'object' && event.organizer.userId._id) {
    //   // If populated, use the _id field
    //   eventOrganizerId = event.organizer.userId._id;
    // } else {
    //   // If not populated, use the userId directly
    //   eventOrganizerId = event.organizer.userId;
    // }
    const eventOrganizerId = event.organizer?.userId; // no ._id

console.log("speaker from getevent by id is", event.speakers);
    
    // const eventOrganizerIdStr = eventOrganizerId.toString();
    const reqUserIdStr = req.user._id.toString();

    //commented below code because there is nothing like userId._id. there is only userId
    
    // const isAuthorized = eventOrganizerIdStr === reqUserIdStr || 
    //                     event.speakers.some(speaker => {
    //                       let speakerId;
    //                       if (typeof speaker.userId === 'object' && speaker.userId._id) {
    //                         speakerId = speaker.userId._id;
    //                       } else {
    //                         speakerId = speaker.userId;
    //                       }
    //                       return speakerId && speakerId.toString() === reqUserIdStr;
    //                     });

 const isAuthorized =
  (eventOrganizerId && eventOrganizerId.toString() === reqUserIdStr) ||
  event.speakers.some(
    speaker => speaker.userId && speaker.userId.toString() === reqUserIdStr
  );

    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this event'
      });
    }
  // Format speakers: keep userId as ObjectId
    const formattedSpeakers = event.speakers.map(speaker => ({
      ...speaker,
      userId: speaker.userId?._id || speaker.userId || null, // ensures ObjectId
    }));
    console.log("formatspeaker line 450", formattedSpeakers);
    
    // Add status field
    const eventWithStatus = {
      ...event,
      speakers:formattedSpeakers,
      status: event.eventDate < new Date() ? 'past' : 'upcoming'
    };
    console.log("eventWithStatus line 458", eventWithStatus);
    

    res.status(200).json({
      success: true,
      data: eventWithStatus
    });
  } catch (error) {
     console.error('getEventById error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching event'
    });
  }
};

// Update an event

export const updateEvent = async (req, res) => {
  try {
    // 1. Find the event
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // 2. Verify organizer permissions
    if (!isOrganizer(event, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    // 3. Capture original speakers for tracking changes
    const originalSpeakerIds = event.speakers.map(s => s.userId.toString());

    // 4. Parse update data (handles both JSON and form-data)
    const updateData = req.body.data ? JSON.parse(req.body.data) : req.body;

    if (updateData.tickets) {
  try {
    let ticketArray = Array.isArray(updateData.tickets)
      ? updateData.tickets
      : JSON.parse(updateData.tickets);

    event.tickets = ticketArray.map((ticket, index) => {
      if (!ticket.ticketName) throw new Error(`Ticket ${index + 1} missing name`);
      if (ticket.ticketType === "paid" && (!ticket.price || ticket.price <= 0)) {
        throw new Error(`Ticket ${index + 1} must have valid price`);
      }
      if (ticket.quantity <= 0) {
        throw new Error(`Ticket ${index + 1} must have quantity > 0`);
      }
      return {
        ...ticket,
        price: ticket.ticketType === "paid" ? ticket.price : 0,
        currency: ticket.currency || "INR"
      };
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: "Invalid tickets format or data: " + e.message
    });
  }
}


    // 5. Process numeric fields
    if (updateData.totalAudienceCount) {
      updateData.totalAudienceCount = parseInt(updateData.totalAudienceCount);
    }
    if (updateData.pricePerHead) {
      updateData.pricePerHead = parseFloat(updateData.pricePerHead);
    }

    // 6. Process date fields
    if (updateData.eventDate) {
      updateData.eventDate = new Date(updateData.eventDate);
    }

    // 7. Process speakers array
    if (updateData.speakers) {
      try {
        updateData.speakers = Array.isArray(updateData.speakers)
          ? updateData.speakers
          : JSON.parse(updateData.speakers);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid speakers format. Use JSON array format'
        });
      }
    }

    // 8. Apply updates to event document
    const updatableFields = [
      'topic', 'description', 'totalAudienceCount', 'pricePerHead',
      'eventDate', 'eventStartTime', 'eventEndTime', 'eventMode',
      'eventLocation', 'venueAddress'
    ];

    updatableFields.forEach(field => {
      if (updateData[field] !== undefined) {
        event[field] = updateData[field];
      }
    });

    // 9. Handle speakers update
    if (updateData.speakers !== undefined) {
      const validatedSpeakers = [];
      const invalidSpeakers = [];

      await Promise.all(updateData.speakers.map(async (email) => {
        try {
          const normalizedEmail = email.toLowerCase().trim();
          const expertRole = await UserRole.findOne({
            workEmail: normalizedEmail,
            role: 'Expert'
          }).populate('userId');

          if (expertRole?.userId) {
            validatedSpeakers.push({
              email: normalizedEmail,
              userId: expertRole.userId
            });
          } else {
            invalidSpeakers.push(email);
          }
        } catch (err) {
          invalidSpeakers.push(email);
        }
      }));

      if (invalidSpeakers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Speaker validation failed',
          invalidSpeakers
        });
      }
      event.speakers = validatedSpeakers;
    }

    // 10. Handle location based on mode
    if (updateData.eventMode === 'online') {
      if (updateData.eventLocation) {
        event.eventLocation = updateData.eventLocation;
      }
      event.venueAddress = undefined;
    } else if (updateData.eventMode === 'offline') {
      if (updateData.venueAddress) {
        event.venueAddress = updateData.venueAddress;
      }
      event.eventLocation = undefined;
    }

    // 11. Handle file upload
    if (req.file) {
      event.eventBanner = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    // 12. Validate and save
    await event.validate();
    const updatedEvent = await event.save();

    // 13. Update speaker profiles (add/remove as needed)
    const updatedSpeakerIds = updatedEvent.speakers.map(s => s.userId.toString());
    
    const addedSpeakers = updatedSpeakerIds.filter(
      id => !originalSpeakerIds.includes(id)
    );
    
    const removedSpeakers = originalSpeakerIds.filter(
      id => !updatedSpeakerIds.includes(id)
    );

    // Execute updates in parallel
    await Promise.all([
      ...addedSpeakers.map(userId => 
        Profile.findOneAndUpdate(
          { user: userId },
          { $addToSet: { expertEvents: updatedEvent._id } },
          { upsert: true }
        ).catch(err => console.error(`Update failed for ${userId}:`, err))
      ,
      ...removedSpeakers.map(userId => 
        Profile.findOneAndUpdate(
          { user: userId },
          { $pull: { expertEvents: updatedEvent._id } }
        ).catch(err => console.error(`Removal failed for ${userId}:`, err))
      ))
    ]);

    // 14. Prepare response with virtual status field
    const responseEvent = {
      ...updatedEvent.toObject(),
      status: updatedEvent.eventDate < new Date() ? 'past' : 'upcoming'
    };

    // 15. Return successful response
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: responseEvent
    });

  } catch (error) {
    console.error('Event Update Error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Server error updating event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Verify requester is the organizer
    if (!isOrganizer(event, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    // Remove from all speakers' profiles
    await Profile.updateMany(
      { expertEvents: event._id },
      { $pull: { expertEvents: event._id } }
    );

    await Event.findByIdAndDelete(event._id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting event'
    });
  }
};