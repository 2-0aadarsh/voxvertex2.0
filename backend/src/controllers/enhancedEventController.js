import EnhancedEvent from '../models/enhancedEvent.js';
import Booking from '../models/bookingSpeaker.js';
import { uploadToCloudinary } from '../configs/cloudinary.config.js';
import postponementValidationService from '../services/postponementValidationService.js';

// Create a new enhanced event
export const createEnhancedEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id
    };
    console.log("Event Data in createEnhancedEvent:", eventData);
    
    // Log new online platform fields if present
    if (eventData.eventMode === 'online' || eventData.eventMode === 'hybrid') {
      console.log("🌐 Online/Hybrid Event Platform Details:", {
        meetingPlatform: eventData.meetingPlatform,
        meetingLink: eventData.meetingLink,
        meetingId: eventData.meetingId,
        passcode: eventData.passcode ? '[PROVIDED]' : '[NOT PROVIDED]',
        dialInNumbers: eventData.dialInNumbers ? '[PROVIDED]' : '[NOT PROVIDED]',
        participantInstructions: eventData.participantInstructions ? '[PROVIDED]' : '[NOT PROVIDED]'
      });
    }

    // Validate required fields for basic event creation
    if (!eventData.eventName || !eventData.startDate || !eventData.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: eventName, startDate, endDate'
      });
    }

    // Validate online/hybrid event platform requirements
    if (eventData.eventMode === 'online' || eventData.eventMode === 'hybrid') {
      if (!eventData.meetingPlatform) {
        return res.status(400).json({
          success: false,
          message: 'Meeting platform is required for online/hybrid events'
        });
      }
      if (!eventData.meetingLink) {
        return res.status(400).json({
          success: false,
          message: 'Meeting link is required for online/hybrid events'
        });
      }
      
      // Validate Zoom-specific requirements
      if (eventData.meetingPlatform === 'Zoom') {
        if (!eventData.meetingId) {
          return res.status(400).json({
            success: false,
            message: 'Meeting ID is required when Zoom is selected as platform'
          });
        }
        if (!eventData.passcode) {
          return res.status(400).json({
            success: false,
            message: 'Passcode is required when Zoom is selected as platform'
          });
        }
      }
    }

    // Process and validate policies if provided
    if (eventData.policies) {
      console.log("📋 Processing policies for event creation:", eventData.policies);
      
      // Log policy changes for debugging
      if (eventData.policies.participantRefund) {
        console.log("💰 Participant Refund Policy:", {
          allowRefunds: eventData.policies.participantRefund.allowRefunds,
          refundDeadline: eventData.policies.participantRefund.refundDeadline,
          refundPercentage: eventData.policies.participantRefund.refundPercentage,
          processingTime: eventData.policies.participantRefund.processingTime
        });
      }
      
      if (eventData.policies.eventCancellation) {
        console.log("❌ Event Cancellation Policy:", {
          allowCancellation: eventData.policies.eventCancellation.allowCancellation,
          fullRefundDeadline: eventData.policies.eventCancellation.fullRefundDeadline,
          partialRefundPercentage: eventData.policies.eventCancellation.partialRefundPercentage,
          refundMethod: eventData.policies.eventCancellation.refundMethod,
          processingTime: eventData.policies.eventCancellation.processingTime
        });
      }
      
      // Initialize policy metadata
      if (!eventData.policies.metadata) {
        eventData.policies.metadata = {
          version: "1.0",
          lastUpdated: new Date(),
          updatedBy: req.user._id,
          isCompliant: true,
          complianceNotes: "Initial policy configuration"
        };
      } else {
        eventData.policies.metadata.lastUpdated = new Date();
        eventData.policies.metadata.updatedBy = req.user._id;
      }

      // Validate policies using the model's validation method
      const event = new EnhancedEvent(eventData);
      const policyValidation = event.validatePolicies();
      
      if (!policyValidation.isCompliant) {
        return res.status(400).json({
          success: false,
          message: 'Policy validation failed',
          errors: policyValidation.errors,
          policyValidation: {
            isCompliant: policyValidation.isCompliant,
            errors: policyValidation.errors,
            notes: policyValidation.notes
          }
        });
      }

      // Update compliance status in metadata
      eventData.policies.metadata.isCompliant = policyValidation.isCompliant;
      eventData.policies.metadata.complianceNotes = policyValidation.notes.join('; ');
    }

    const event = new EnhancedEvent(eventData);
    await event.save();

    // Populate organizer data for response
    await event.populate('organizer', 'firstName lastName email profileImageUrl');

    res.status(201).json({
      success: true,
      message: 'Enhanced event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating enhanced event:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create enhanced event',
      error: error.message
    });
  }
};

// Get all enhanced events (with filters)
export const getAllEnhancedEvents = async (req, res) => {
  try {
    const { 
      status = 'published', 
      eventMode, 
      page = 1, 
      limit = 10,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // If no user is authenticated, only show published events
    if (!req.user && status !== 'published') {
      query.status = 'published';
    }
    
    // Filter by event mode
    if (eventMode) {
      query.eventMode = eventMode;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const events = await EnhancedEvent.find(query)
      .populate('organizer', 'firstName lastName email profileImageUrl')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EnhancedEvent.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Enhanced events retrieved successfully',
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting enhanced events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enhanced events',
      error: error.message
    });
  }
};

// Get upcoming enhanced events (live tickets, future dates)
export const getUpcomingEnhancedEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      sortBy = 'startDate',
      sortOrder = 'asc',
      eventMode,
      search
    } = req.query;

    // Build query for upcoming events
    const query = {
      status: 'published', // Only published events
      startDate: { $gt: new Date() }, // Future start date
      'ticketTypes.quantity': { $gt: 0 } // Has available tickets
    };
    
    // Filter by event mode
    if (eventMode) {
      query.eventMode = eventMode;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { meetingPlatform: { $regex: search, $options: 'i' } },
        { meetingLink: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const events = await EnhancedEvent.find(query)
      .populate('organizer', 'firstName lastName email profileImageUrl')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EnhancedEvent.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Upcoming enhanced events retrieved successfully',
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting upcoming enhanced events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve upcoming enhanced events',
      error: error.message
    });
  }
};

// Get promoted events (featured on home page)
export const getPromotedEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      sortBy = 'startDate',
      sortOrder = 'asc',
      eventMode,
      search
    } = req.query;

    // Build query for promoted events
    const query = {
      status: 'published', // Only published events
      'addons.featureOnHome': true, // Must be featured on home page
      startDate: { $gt: new Date() } // Future start date
    };
    
    // Filter by event mode
    if (eventMode) {
      query.eventMode = eventMode;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { meetingPlatform: { $regex: search, $options: 'i' } },
        { meetingLink: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const events = await EnhancedEvent.find(query)
      .populate('organizer', 'firstName lastName email profileImageUrl')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EnhancedEvent.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Promoted events retrieved successfully',
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting promoted events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve promoted events',
      error: error.message
    });
  }
};

// Get enhanced event by ID
export const getEnhancedEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EnhancedEvent.findById(id)
      .populate('organizer', 'firstName lastName email profileImageUrl')
      .populate('speakers.platformSpeakers.speakerId', 'firstName lastName profileImageUrl professionalTitle')
      .populate('speakers.platformSpeakers.bookingId', 'bookingId status compensationAndArrangements');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Enhanced event not found'
      });
    }

    // Check if user has access to this event
    // If no user is authenticated, only allow access to published events
    if (!req.user && event.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only published events are publicly accessible'
      });
    }

    // If user is authenticated, check draft access
    if (req.user && event.status === 'draft' && event.organizer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to draft event'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enhanced event retrieved successfully',
      data: event
    });
  } catch (error) {
    console.error('Error getting enhanced event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enhanced event',
      error: error.message
    });
  }
};

// Update enhanced event
export const updateEnhancedEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log("🔄 Updating event:", id, "with data:", updateData);

    const event = await EnhancedEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Enhanced event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the organizer can update this event'
      });
    }

    // Validate online/hybrid event platform requirements if being updated
    if (updateData.eventMode === 'online' || updateData.eventMode === 'hybrid' || 
        (event.eventMode === 'online' && updateData.meetingPlatform) || 
        (event.eventMode === 'hybrid' && updateData.meetingPlatform)) {
      
      const currentEventMode = updateData.eventMode || event.eventMode;
      
      if (currentEventMode === 'online' || currentEventMode === 'hybrid') {
        const meetingPlatform = updateData.meetingPlatform || event.meetingPlatform;
        const meetingLink = updateData.meetingLink || event.meetingLink;
        const meetingId = updateData.meetingId || event.meetingId;
        const passcode = updateData.passcode || event.passcode;
        
        if (!meetingPlatform) {
          return res.status(400).json({
            success: false,
            message: 'Meeting platform is required for online/hybrid events'
          });
        }
        if (!meetingLink) {
          return res.status(400).json({
            success: false,
            message: 'Meeting link is required for online/hybrid events'
          });
        }
        
        // Validate Zoom-specific requirements
        if (meetingPlatform === 'Zoom') {
          if (!meetingId) {
            return res.status(400).json({
              success: false,
              message: 'Meeting ID is required when Zoom is selected as platform'
            });
          }
          if (!passcode) {
            return res.status(400).json({
              success: false,
              message: 'Passcode is required when Zoom is selected as platform'
            });
          }
        }
      }
    }

    // Process and validate policies if provided in update
    if (updateData.policies) {
      console.log("📋 Processing policies update for event:", id);
      
      // Ensure metadata exists for policy updates
      if (!updateData.policies.metadata) {
        updateData.policies.metadata = event.policies?.metadata || {};
      }
      
      // Update policy metadata
      updateData.policies.metadata.lastUpdated = new Date();
      updateData.policies.metadata.updatedBy = req.user._id;

      // Create temporary event object for validation
      const tempEvent = new EnhancedEvent({ ...event.toObject(), ...updateData });
      const policyValidation = tempEvent.validatePolicies();
      
      if (!policyValidation.isCompliant) {
        return res.status(400).json({
          success: false,
          message: 'Policy validation failed',
          errors: policyValidation.errors,
          policyValidation: {
            isCompliant: policyValidation.isCompliant,
            errors: policyValidation.errors,
            notes: policyValidation.notes
          }
        });
      }

      // Update compliance status in metadata
      updateData.policies.metadata.isCompliant = policyValidation.isCompliant;
      updateData.policies.metadata.complianceNotes = policyValidation.notes.join('; ');
    }

    const updatedEvent = await EnhancedEvent.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName email profileImageUrl');

    res.status(200).json({
      success: true,
      message: 'Enhanced event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating enhanced event:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update enhanced event',
      error: error.message
    });
  }
};

// Delete enhanced event
export const deleteEnhancedEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EnhancedEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Enhanced event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the organizer can delete this event'
      });
    }

    // Prevent deletion of published events with ticket sales
    if (event.status === 'published' && event.totalTicketsSold > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete published event with ticket sales. Consider cancelling instead'
      });
    }

    await EnhancedEvent.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Enhanced event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enhanced event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enhanced event',
      error: error.message
    });
  }
};

// Get user's enhanced events
export const getUserEnhancedEvents = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const organizerId = req.user._id;

    const query = { organizer: organizerId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const events = await EnhancedEvent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EnhancedEvent.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'User enhanced events retrieved successfully',
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting user enhanced events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user enhanced events',
      error: error.message
    });
  }
};

// Publish enhanced event
export const publishEnhancedEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EnhancedEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Enhanced event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the organizer can publish this event'
      });
    }

    // Validate event can be published
    const validation = event.canBePublished();
    if (!validation.canPublish) {
      return res.status(400).json({
        success: false,
        message: 'Event cannot be published',
        errors: validation.errors
      });
    }

    // Update event status to published
    event.status = 'published';
    event.publishedAt = new Date();
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Enhanced event published successfully',
      data: event
    });
  } catch (error) {
    console.error('Error publishing enhanced event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish enhanced event',
      error: error.message
    });
  }
};

// Validate enhanced event
export const validateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EnhancedEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Enhanced event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const validation = event.canBePublished();

    res.status(200).json({
      success: true,
      message: 'Event validation completed',
      data: {
        canPublish: validation.canPublish,
        errors: validation.errors,
        warnings: []
      }
    });
  } catch (error) {
    console.error('Error validating enhanced event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate enhanced event',
      error: error.message
    });
  }
};

// Get available speakers for event (confirmed bookings)
export const getEventSpeakers = async (req, res) => {
  try {
    const organizerId = req.user._id;

    // Get confirmed bookings for this organizer
    const confirmedBookings = await Booking.find({
      organizer: organizerId,
      status: 'accepted'
    }).populate('speaker', 'firstName lastName profileImageUrl professionalTitle bio areaOfExpertise yearsOfExperience');

    const availableSpeakers = confirmedBookings.map(booking => ({
      bookingId: booking._id,
      speakerId: booking.speaker._id,
      speakerDetails: {
        firstName: booking.speaker.firstName,
        lastName: booking.speaker.lastName,
        fullName: `${booking.speaker.firstName} ${booking.speaker.lastName}`,
        profileImageUrl: booking.speaker.profileImageUrl,
        professionalTitle: booking.speaker.professionalTitle,
        bio: booking.speaker.bio,
        areaOfExpertise: booking.speaker.areaOfExpertise,
        yearsOfExperience: booking.speaker.yearsOfExperience
      },
      bookingDetails: {
        bookingId: booking.bookingId,
        amount: booking.compensationAndArrangements?.primaryCompensation?.speakerFeeAmount || 0,
        date: booking.date,
        timeSlot: booking.timeSlot
      }
    }));

    res.status(200).json({
      success: true,
      message: 'Available speakers retrieved successfully',
      data: {
        speakers: availableSpeakers,
        totalSpeakers: availableSpeakers.length
      }
    });
  } catch (error) {
    console.error('Error getting event speakers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available speakers',
      error: error.message
    });
  }
};

// Get event statistics
export const getEventStats = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EnhancedEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Enhanced event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const stats = {
      totalCapacity: event.totalCapacity,
      totalTicketsSold: event.totalTicketsSold,
      remainingTickets: event.totalCapacity - event.totalTicketsSold,
      totalRevenue: event.totalRevenue,
      speakersCount: {
        manual: event.speakers.manualSpeakers.length,
        platform: event.speakers.platformSpeakers.length,
        total: event.speakers.manualSpeakers.length + event.speakers.platformSpeakers.length
      },
      ticketTypesCount: event.ticketTypes.length,
      isPublished: event.status === 'published',
      daysUntilEvent: event.isUpcoming ? Math.ceil((event.startDate - new Date()) / (1000 * 60 * 60 * 24)) : 0
    };

    res.status(200).json({
      success: true,
      message: 'Event statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting event statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event statistics',
      error: error.message
    });
  }
};

// Draft Management Functions
export const saveEventDraft = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id,
      status: 'draft'
    };

    const event = new EnhancedEvent(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event draft saved successfully',
      data: event
    });
  } catch (error) {
    console.error('Error saving event draft:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save event draft',
      error: error.message
    });
  }
};

export const getEventDrafts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const organizerId = req.user._id;

    const skip = (page - 1) * limit;

    const drafts = await EnhancedEvent.find({
      organizer: organizerId,
      status: 'draft'
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EnhancedEvent.countDocuments({
      organizer: organizerId,
      status: 'draft'
    });

    res.status(200).json({
      success: true,
      message: 'Event drafts retrieved successfully',
      data: {
        drafts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalDrafts: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error getting event drafts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event drafts',
      error: error.message
    });
  }
};

export const updateEventDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await EnhancedEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event draft not found'
      });
    }

    // Check if user is the organizer and event is a draft
    if (event.organizer.toString() !== req.user._id.toString() || event.status !== 'draft') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only draft events can be updated'
      });
    }

    const updatedEvent = await EnhancedEvent.findByIdAndUpdate(
      id,
      { ...updateData, status: 'draft' },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Event draft updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event draft:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event draft',
      error: error.message
    });
  }
};

export const deleteEventDraft = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EnhancedEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event draft not found'
      });
    }

    // Check if user is the organizer and event is a draft
    if (event.organizer.toString() !== req.user._id.toString() || event.status !== 'draft') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only draft events can be deleted'
      });
    }

    await EnhancedEvent.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Event draft deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event draft:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event draft',
      error: error.message
    });
  }
};

// Upload banner image for enhanced events
export const uploadBannerImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No banner image file uploaded'
      });
    }

    console.log('📸 Banner image upload request:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
    });

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed for banner uploads'
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Banner image size cannot exceed 10MB'
      });
    }

    // Upload to Cloudinary using the generic uploader
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'event-banners');

    console.log('✅ Banner image uploaded successfully:', imageUrl);

    res.status(200).json({
      success: true,
      message: 'Banner image uploaded successfully',
      data: {
        url: imageUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('❌ Error uploading banner image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload banner image',
      error: error.message
    });
  }
};

// Get postponement options for an event
export const getPostponementOptions = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EnhancedEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the organizer can view postponement options'
      });
    }

    // Get postponement options from validation service
    const postponementOptions = postponementValidationService.getPostponementOptions(event);

    if (!postponementOptions) {
      return res.status(400).json({
        success: false,
        message: 'Postponement is not allowed for this event'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Postponement options retrieved successfully',
      data: postponementOptions
    });
  } catch (error) {
    console.error('Error getting postponement options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve postponement options',
      error: error.message
    });
  }
};

// Postpone an event
export const postponeEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const postponementData = req.body;

    console.log('🔄 Postponing event:', id, 'with data:', postponementData);

    const event = await EnhancedEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the organizer can postpone this event'
      });
    }

    // Validate postponement using the validation service
    const validationResult = postponementValidationService.validatePostponement(event, postponementData);

    if (!validationResult.canPostpone) {
      return res.status(400).json({
        success: false,
        message: 'Postponement validation failed',
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        validation: validationResult
      });
    }

    // Create postponement history entry
    const postponementEntry = {
      postponedAt: new Date(),
      postponedBy: req.user._id,
      reason: postponementData.reason,
      newDates: postponementData.newDates || null,
      newLocation: postponementData.newLocation || null,
      newMeetingDetails: postponementData.newMeetingDetails || null,
      refundOffered: postponementData.refundOffered || false,
      refundPercentage: postponementData.refundPercentage || 0,
      notificationsSent: {
        participants: false,
        speakers: false,
        sentAt: null
      }
    };

    // Save original event data if not already saved
    if (!event.postponement.originalEventData.startDate) {
      event.postponement.originalEventData = {
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        meetingPlatform: event.meetingPlatform,
        meetingLink: event.meetingLink,
        meetingId: event.meetingId,
        passcode: event.passcode,
        dialInNumbers: event.dialInNumbers,
        participantInstructions: event.participantInstructions
      };
    }

    // Add postponement to history
    event.postponement.postponementHistory.push(postponementEntry);
    event.postponement.isPostponed = true;

    // Update event with new data if provided
    if (postponementData.newDates) {
      event.startDate = new Date(postponementData.newDates.startDate);
      event.endDate = new Date(postponementData.newDates.endDate);
    }

    // Update location only for offline/hybrid events
    if (postponementData.newLocation && (event.eventMode === 'offline' || event.eventMode === 'hybrid')) {
      event.location = postponementData.newLocation;
    }

    // Update meeting details only for online/hybrid events
    if (postponementData.newMeetingDetails && (event.eventMode === 'online' || event.eventMode === 'hybrid')) {
      event.meetingPlatform = postponementData.newMeetingDetails.meetingPlatform;
      event.meetingLink = postponementData.newMeetingDetails.meetingLink;
      event.meetingId = postponementData.newMeetingDetails.meetingId;
      event.passcode = postponementData.newMeetingDetails.passcode;
      event.dialInNumbers = postponementData.newMeetingDetails.dialInNumbers;
      event.participantInstructions = postponementData.newMeetingDetails.participantInstructions;
    }

    // Update status to postponed
    event.status = 'postponed';

    // Save the updated event
    await event.save();

    console.log('✅ Event postponed successfully:', {
      eventId: id,
      postponedAt: postponementEntry.postponedAt,
      reason: postponementEntry.reason,
      newDates: postponementEntry.newDates
    });

    res.status(200).json({
      success: true,
      message: 'Event postponed successfully',
      data: {
        eventId: id,
        postponedAt: postponementEntry.postponedAt,
        reason: postponementEntry.reason,
        newDates: postponementEntry.newDates,
        newLocation: postponementEntry.newLocation,
        refundOffered: postponementEntry.refundOffered,
        refundPercentage: postponementEntry.refundPercentage,
        warnings: validationResult.warnings
      }
    });
  } catch (error) {
    console.error('Error postponing event:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to postpone event',
      error: error.message
    });
  }
};

