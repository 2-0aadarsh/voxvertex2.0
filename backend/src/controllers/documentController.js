import documentService from '../services/documentService.js';

/**
 * Upload a new document
 * POST /api/documents/upload
 */
export const uploadDocument = async (req, res) => {
  try {
    console.log('📄 Document upload request received');
    console.log('🔍 Debug - req.body:', req.body);
    console.log('🔍 Debug - req.file:', req.file);
    console.log('🔍 Debug - req.files:', req.files);
    console.log('🔍 Debug - req.headers:', req.headers);
    
    const userId = req.user._id;
    const userRole = req.user.role;
    const file = req.file;
    
    // Get values directly from req.body (destructuring might not work with multipart/form-data)
    const docName = req.body.documentName;
    const docType = req.body.documentType;
    const docTags = req.body.tags;
    const docNotes = req.body.notes;
    
    console.log('🔍 Debug - extracted values:');
    console.log('  - docName:', docName);
    console.log('  - docType:', docType);
    console.log('  - docTags:', docTags);
    console.log('  - docNotes:', docNotes);
    console.log('  - file:', file);
    
    // Validate required fields
    if (!docName || !docType || !file) {
      console.log('❌ Validation failed:');
      console.log('  - docName:', docName);
      console.log('  - docType:', docType);
      console.log('  - file:', file);
      return res.status(400).json({
        success: false,
        message: 'Document name, type, and file are required'
      });
    }
    
    // Validate document type
    const validTypes = ['MOU', 'Contract', 'Invoice', 'Agreement'];
    if (!validTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Must be one of: MOU, Contract, Invoice, Agreement'
      });
    }
    
    const result = await documentService.uploadDocument(
      userId,
      userRole,
      { documentName: docName, documentType: docType, tags: docTags, notes: docNotes },
      file
    );
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Upload document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Assign document to a speaker
 * POST /api/documents/:documentId/assign
 */
export const assignDocumentToSpeaker = async (req, res) => {
  try {
    console.log('📋 Document assignment request received');
    
    const { documentId } = req.params;
    const { speakerId, relatedBookingId } = req.body;
    const organizerId = req.user._id;
    
    // Validate required fields
    if (!speakerId) {
      return res.status(400).json({
        success: false,
        message: 'Speaker ID is required'
      });
    }
    
    const result = await documentService.assignDocumentToSpeaker(
      documentId,
      speakerId,
      organizerId,
      relatedBookingId
    );
    
    res.status(200).json({
      success: true,
      message: 'Document assigned to speaker successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Assign document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Send document to speaker
 * POST /api/documents/:documentId/send
 */
export const sendDocumentToSpeaker = async (req, res) => {
  try {
    console.log('📤 Send document request received');
    
    const { documentId } = req.params;
    const organizerId = req.user._id;
    
    const result = await documentService.sendDocumentToSpeaker(documentId, organizerId);
    
    res.status(200).json({
      success: true,
      message: 'Document sent to speaker successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Send document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Assign document to an organizer (for speakers)
 * POST /api/documents/:documentId/assign-organizer
 */
export const assignDocumentToOrganizer = async (req, res) => {
  try {
    console.log('📋 Document assignment to organizer request received');
    
    const { documentId } = req.params;
    const { organizerId, relatedBookingId } = req.body;
    const speakerId = req.user._id;
    
    // Validate required fields
    if (!organizerId) {
      return res.status(400).json({
        success: false,
        message: 'Organizer ID is required'
      });
    }
    
    const result = await documentService.assignDocumentToOrganizer(
      documentId,
      organizerId,
      speakerId,
      relatedBookingId
    );
    
    res.status(200).json({
      success: true,
      message: 'Document assigned to organizer successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Assign document to organizer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign document to organizer',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Send document to organizer
 * POST /api/documents/:documentId/send-to-organizer
 */
export const sendDocumentToOrganizer = async (req, res) => {
  try {
    console.log('📤 Send document to organizer request received');
    
    const { documentId } = req.params;
    const speakerId = req.user._id;
    
    const result = await documentService.sendDocumentToOrganizer(documentId, speakerId);
    
    res.status(200).json({
      success: true,
      message: 'Document sent to organizer successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Send document to organizer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send document to organizer',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get organizer's documents
 * GET /api/documents/organizer
 */
export const getOrganizerDocuments = async (req, res) => {
  try {
    console.log('📋 Get organizer documents request received');
    console.log('🔍 User from JWT:', req.user);
    
    const organizerId = req.user._id;
    const { direction, status, page = 1, limit = 10 } = req.query;
    
    const result = await documentService.getOrganizerDocuments(
      organizerId,
      direction,
      status,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      message: 'Organizer documents fetched successfully',
      data: result.documents,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('❌ Get organizer documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch organizer documents',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get speaker's documents
 * GET /api/documents/speaker
 */
export const getSpeakerDocuments = async (req, res) => {
  try {
    console.log('📋 Get speaker documents request received');
    console.log('🔍 User from JWT:', req.user);
    
    const speakerId = req.user._id;
    const { direction, status, page = 1, limit = 10 } = req.query;
    
    const result = await documentService.getSpeakerDocuments(
      speakerId,
      direction,
      status,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      message: 'Speaker documents fetched successfully',
      data: result.documents,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('❌ Get speaker documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch speaker documents',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Note: Confirmed speakers are available via the existing booking endpoint:
// GET /api/book-speaker/organizer-bookings

/**
 * Update document status
 * PUT /api/documents/:documentId/status
 */
export const updateDocumentStatus = async (req, res) => {
  try {
    console.log('🔄 Update document status request received');
    
    const { documentId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Validate status values
    const validStatuses = [
      'uploaded', 'assigned', 'sent', 'pending_review', 
      'approved', 'signed', 'declined', 'cancelled'
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const result = await documentService.updateDocumentStatus(
      documentId,
      status,
      userId,
      userRole
    );
    
    res.status(200).json({
      success: true,
      message: 'Document status updated successfully',
      data: result.document
    });
    
  } catch (error) {
    console.error('❌ Update document status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update document status',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Download document
 * GET /api/documents/:documentId/download
 */
export const downloadDocument = async (req, res) => {
  try {
    console.log('📥 Document download request received');
    
    const { documentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    const result = await documentService.downloadDocument(documentId, userId, userRole);
    
    res.status(200).json({
      success: true,
      message: 'Document download processed successfully',
      data: {
        document: result.document,
        downloadUrl: result.downloadUrl
      }
    });
    
  } catch (error) {
    console.error('❌ Download document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process document download',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Delete document
 * DELETE /api/documents/:documentId
 */
export const deleteDocument = async (req, res) => {
  try {
    console.log('🗑️ Delete document request received');
    
    const { documentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    await documentService.deleteDocument(documentId, userId, userRole);
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get document statistics for organizer
 * GET /api/documents/organizer/stats
 */
export const getOrganizerDocumentStats = async (req, res) => {
  try {
    console.log('📊 Get organizer document stats request received');
    
    const organizerId = req.user._id;
    
    const result = await documentService.getOrganizerDocumentStats(organizerId);
    
    res.status(200).json({
      success: true,
      message: 'Document statistics fetched successfully',
      data: result.stats
    });
    
  } catch (error) {
    console.error('❌ Get organizer document stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch document statistics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get document statistics for speaker
 * GET /api/documents/speaker/stats
 */
export const getSpeakerDocumentStats = async (req, res) => {
  try {
    console.log('📊 Get speaker document stats request received');
    
    const speakerId = req.user._id;
    
    const result = await documentService.getSpeakerDocumentStats(speakerId);
    
    res.status(200).json({
      success: true,
      message: 'Speaker document statistics fetched successfully',
      data: result.stats
    });
    
  } catch (error) {
    console.error('❌ Get speaker document stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch speaker document statistics',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get single document by ID
 * GET /api/documents/:documentId
 */
export const getDocumentById = async (req, res) => {
  try {
    console.log('📄 Get document by ID request received');
    
    const { documentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Import Document model for direct query
    const Document = (await import('../models/document.js')).default;
    
    const document = await Document.findById(documentId)
      .populate('organizer', 'firstName lastName email profileImageUrl')
      .populate('speaker', 'firstName lastName email profileImageUrl')
      .populate('relatedBooking', 'bookingId eventDetails');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Verify user has permission to view this document
    if (userRole === 'organizer') {
      if (document.organizer._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only view your own documents'
        });
      }
    } else if (userRole === 'speaker') {
      if (document.speaker._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: You can only view documents assigned to you'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Document fetched successfully',
      data: document
    });
    
  } catch (error) {
    console.error('❌ Get document by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch document',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get all documents for current user (both incoming and outgoing)
 * GET /api/documents/all
 */
export const getAllUserDocuments = async (req, res) => {
  try {
    console.log('📋 Get all user documents request received');
    console.log('🔍 User from JWT:', req.user);
    
    const userId = req.user._id;
    const userRole = req.user.role;
    const { direction, status, page = 1, limit = 10 } = req.query;
    
    const result = await documentService.getAllUserDocuments(
      userId,
      userRole,
      direction,
      status,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      message: 'All user documents fetched successfully',
      data: result.data,
      pagination: result.pagination,
      summary: result.summary
    });
    
  } catch (error) {
    console.error('❌ Get all user documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user documents',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Search documents
 * GET /api/documents/search
 */
export const searchDocuments = async (req, res) => {
  try {
    console.log('🔍 Search documents request received');
    
    const userId = req.user._id;
    const userRole = req.user.role;
    const { query, documentType, status, page = 1, limit = 10 } = req.query;
    
    // Import Document model for direct query
    const Document = (await import('../models/document.js')).default;
    
    // Build search query
    const searchQuery = {};
    
    if (userRole === 'organizer') {
      searchQuery.organizer = userId;
    } else if (userRole === 'speaker') {
      searchQuery.speaker = userId;
    }
    
    if (documentType) {
      searchQuery.documentType = documentType;
    }
    
    if (status) {
      searchQuery.status = status;
    }
    
    if (query) {
      searchQuery.$or = [
        { documentName: { $regex: query, $options: 'i' } },
        { notes: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const documents = await Document.find(searchQuery)
      .populate('organizer', 'firstName lastName email profileImageUrl')
      .populate('speaker', 'firstName lastName email profileImageUrl')
      .populate('relatedBooking', 'bookingId eventDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Document.countDocuments(searchQuery);
    
    res.status(200).json({
      success: true,
      message: 'Documents search completed successfully',
      data: documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('❌ Search documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search documents',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get eligible organizers for speaker (organizers who have booked the speaker)
 * GET /api/documents/speaker/eligible-organizers
 */
export const getEligibleOrganizers = async (req, res) => {
  try {
    console.log('👥 Get eligible organizers request received');
    
    const speakerId = req.user._id;
    
    // Import Booking model
    const Booking = (await import('../models/bookingSpeaker.js')).default;
    
    // Find all confirmed bookings for this speaker
    const bookings = await Booking.find({
      speaker: speakerId,
      status: 'accepted' // Only confirmed bookings
    })
    .populate('organizer', 'firstName lastName email profileImageUrl companyName')
    .populate('eventDetails', 'name type location')
    .sort({ createdAt: -1 });
    
    // Extract unique organizers from bookings
    const organizerMap = new Map();
    
    bookings.forEach(booking => {
      if (booking.organizer && !organizerMap.has(booking.organizer._id.toString())) {
        organizerMap.set(booking.organizer._id.toString(), {
          _id: booking.organizer._id,
          firstName: booking.organizer.firstName,
          lastName: booking.organizer.lastName,
          email: booking.organizer.email,
          profileImageUrl: booking.organizer.profileImageUrl,
          companyName: booking.organizer.companyName,
          // Include booking info for context
          recentBooking: {
            bookingId: booking.bookingId,
            eventDetails: booking.eventDetails,
            date: booking.date,
            timeSlot: booking.timeSlot,
            status: booking.status,
            createdAt: booking.createdAt
          }
        });
      }
    });
    
    const eligibleOrganizers = Array.from(organizerMap.values());
    
    console.log(`✅ Found ${eligibleOrganizers.length} eligible organizers for speaker`);
    
    res.status(200).json({
      success: true,
      message: 'Eligible organizers fetched successfully',
      data: eligibleOrganizers,
      total: eligibleOrganizers.length
    });
    
  } catch (error) {
    console.error('❌ Get eligible organizers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch eligible organizers',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
