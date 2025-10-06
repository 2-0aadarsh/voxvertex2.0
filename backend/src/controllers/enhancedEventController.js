import EnhancedEvent from '../models/enhancedEvent.js';
import EnhancedUser from '../models/enhancedUser.js';
import Booking from '../models/bookingSpeaker.js';
import { uploadToCloudinary } from '../configs/cloudinary.config.js';

// Create a new enhanced event
export const createEnhancedEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id
    };
    console.log("Event Data in createEnhancedEvent:", eventData);

    // Validate required fields for basic event creation
    if (!eventData.eventName || !eventData.startDate || !eventData.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: eventName, startDate, endDate'
      });
    }

    const event = new EnhancedEvent(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Enhanced event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating enhanced event:', error);
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

    // Prevent updates to published events (except status changes)
    if (event.status === 'published' && updateData.status !== 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update published event. Only status can be changed to cancelled'
      });
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

