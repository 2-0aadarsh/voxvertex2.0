import Document from '../models/document.js';
import Booking from '../models/bookingSpeaker.js';
import EnhancedUser from '../models/enhancedUser.js';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

class DocumentService {
  
  /**
   * Upload document to Cloudinary and create document record
   */
  async uploadDocument(userId, userRole, documentData, file) {
    try {
      console.log('📄 Starting document upload process...');
      console.log('🔍 User role:', userRole);
      
      // Validate file type
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit.');
      }
      
      // Upload to Cloudinary
      console.log('☁️ Uploading to Cloudinary...');
      const uploadResult = await this.uploadToCloudinary(file, 'documents');
      
      // Create document record based on user role
      const documentData_obj = {
        documentName: documentData.documentName,
        documentType: documentData.documentType,
        file: {
          originalName: file.originalname,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          mimeType: file.mimetype,
          size: file.size
        },
        direction: 'draft', // Set as draft until sent
        status: 'uploaded',
        tags: documentData.tags || [],
        notes: documentData.notes || ''
      };
      
      // Set organizer and speaker based on user role
      if (userRole === 'organizer') {
        documentData_obj.organizer = userId;
      } else if (userRole === 'speaker') {
        documentData_obj.speaker = userId;
      }
      
      const document = new Document(documentData_obj);
      const savedDocument = await document.save();
      
      // Populate user information based on role
      if (userRole === 'organizer') {
        await savedDocument.populate('organizer', 'firstName lastName email profileImageUrl');
      } else if (userRole === 'speaker') {
        await savedDocument.populate('speaker', 'firstName lastName email profileImageUrl');
      }
      
      console.log('✅ Document uploaded successfully:', savedDocument._id);
      
      return {
        success: true,
        document: savedDocument,
        message: 'Document uploaded successfully'
      };
      
    } catch (error) {
      console.error('❌ Error uploading document:', error);
      throw error;
    }
  }
  
  /**
   * Upload file to Cloudinary
   */
  async uploadToCloudinary(file, folder = 'documents') {
    try {
      // Create a stream from the buffer
      const stream = Readable.from(file.buffer);
      
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'auto',
            public_id: `document_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            overwrite: true,
            use_filename: true,
            unique_filename: true
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('✅ File uploaded to Cloudinary:', result.secure_url);
              resolve(result);
            }
          }
        );
        
        // Pipe the stream to the upload stream
        stream.pipe(uploadStream);
      });
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Assign document to a speaker
   */
  async assignDocumentToSpeaker(documentId, speakerId, organizerId, relatedBookingId = null) {
    try {
      console.log('📋 Assigning document to speaker...');
      
      // Find the document
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Verify organizer owns the document
      if (document.organizer.toString() !== organizerId.toString()) {
        throw new Error('Unauthorized: You can only assign your own documents');
      }
      
      // Verify speaker exists and is confirmed for this organizer
      const speaker = await EnhancedUser.findById(speakerId);
      if (!speaker) {
        throw new Error('Speaker not found');
      }
      
      // If relatedBookingId is provided, verify the booking exists and is confirmed
      if (relatedBookingId) {
        const booking = await Booking.findById(relatedBookingId);
        if (!booking) {
          throw new Error('Related booking not found');
        }
        
        if (booking.organizer.toString() !== organizerId.toString()) {
          throw new Error('Unauthorized: Booking does not belong to you');
        }
        
        if (booking.speaker.toString() !== speakerId.toString()) {
          throw new Error('Speaker is not associated with this booking');
        }
        
        if (booking.status !== 'accepted') {
          throw new Error('Booking must be confirmed before assigning documents');
        }
      }
      
      // Assign document to speaker
      await document.assignToSpeaker(speakerId, relatedBookingId);
      
      // Populate the updated document
      await document.populate([
        { path: 'speaker', select: 'firstName lastName email profileImageUrl' },
        { path: 'organizer', select: 'firstName lastName email profileImageUrl' },
        { path: 'relatedBooking', select: 'bookingId eventDetails' }
      ]);
      
      console.log('✅ Document assigned successfully');
      
      return {
        success: true,
        document: document,
        message: 'Document assigned to speaker successfully'
      };
      
    } catch (error) {
      console.error('❌ Error assigning document:', error);
      throw error;
    }
  }
  
  /**
   * Send document to speaker (change status to sent)
   */
  async sendDocumentToSpeaker(documentId, organizerId) {
    try {
      console.log('📤 Sending document to speaker...');
      
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      if (document.organizer.toString() !== organizerId.toString()) {
        throw new Error('Unauthorized: You can only send your own documents');
      }
      
      if (!document.speaker) {
        throw new Error('Document must be assigned to a speaker before sending');
      }
      
      await document.sendToSpeaker();
      
      // Populate the updated document
      await document.populate([
        { path: 'speaker', select: 'firstName lastName email profileImageUrl' },
        { path: 'organizer', select: 'firstName lastName email profileImageUrl' }
      ]);
      
      console.log('✅ Document sent successfully');
      
      return {
        success: true,
        document: document,
        message: 'Document sent to speaker successfully'
      };
      
    } catch (error) {
      console.error('❌ Error sending document:', error);
      throw error;
    }
  }
  
  /**
   * Assign document to an organizer (for speakers)
   */
  async assignDocumentToOrganizer(documentId, organizerId, speakerId, relatedBookingId = null) {
    try {
      console.log('📋 Assigning document to organizer...');
      
      // Find the document
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Verify speaker owns the document
      if (document.speaker.toString() !== speakerId.toString()) {
        throw new Error('Unauthorized: You can only assign your own documents');
      }
      
      // Verify organizer exists
      const organizer = await EnhancedUser.findById(organizerId);
      if (!organizer) {
        throw new Error('Organizer not found');
      }
      
      // If relatedBookingId is provided, verify the booking exists and is confirmed
      if (relatedBookingId) {
        const booking = await Booking.findById(relatedBookingId);
        if (!booking) {
          throw new Error('Related booking not found');
        }
        
        if (booking.speaker.toString() !== speakerId.toString()) {
          throw new Error('Unauthorized: Booking does not belong to you');
        }
        
        if (booking.organizer.toString() !== organizerId.toString()) {
          throw new Error('Organizer is not associated with this booking');
        }
        
        if (booking.status !== 'accepted') {
          throw new Error('Booking must be confirmed before assigning documents');
        }
      }
      
      // Assign document to organizer
      await document.assignToOrganizer(organizerId, relatedBookingId);
      
      // Populate the updated document
      await document.populate([
        { path: 'organizer', select: 'firstName lastName email profileImageUrl' },
        { path: 'speaker', select: 'firstName lastName email profileImageUrl' },
        { path: 'relatedBooking', select: 'bookingId eventDetails' }
      ]);
      
      console.log('✅ Document assigned to organizer successfully');
      
      return {
        success: true,
        document: document,
        message: 'Document assigned to organizer successfully'
      };
      
    } catch (error) {
      console.error('❌ Error assigning document to organizer:', error);
      throw error;
    }
  }
  
  /**
   * Send document to organizer (change status to sent)
   */
  async sendDocumentToOrganizer(documentId, speakerId) {
    try {
      console.log('📤 Sending document to organizer...');
      
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      if (document.speaker.toString() !== speakerId.toString()) {
        throw new Error('Unauthorized: You can only send your own documents');
      }
      
      if (!document.organizer) {
        throw new Error('Document must be assigned to an organizer before sending');
      }
      
      await document.sendToOrganizer();
      
      // Populate the updated document
      await document.populate([
        { path: 'organizer', select: 'firstName lastName email profileImageUrl' },
        { path: 'speaker', select: 'firstName lastName email profileImageUrl' }
      ]);
      
      console.log('✅ Document sent to organizer successfully');
      
      return {
        success: true,
        document: document,
        message: 'Document sent to organizer successfully'
      };
      
    } catch (error) {
      console.error('❌ Error sending document to organizer:', error);
      throw error;
    }
  }
  
  /**
   * Get organizer's documents
   */
  async getOrganizerDocuments(organizerId, direction = null, status = null, page = 1, limit = 10) {
    try {
      console.log('📋 Fetching organizer documents...');
      
      // Organizers see documents where they are the organizer
      const query = { organizer: organizerId };
      
      if (direction) {
        query.direction = direction;
      }
      
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const documents = await Document.find(query)
        .populate('speaker', 'firstName lastName email profileImageUrl')
        .populate('relatedBooking', 'bookingId eventDetails')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Document.countDocuments(query);
      
      console.log(`✅ Found ${documents.length} documents for organizer`);
      
      return {
        success: true,
        documents: documents,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching organizer documents:', error);
      throw error;
    }
  }
  
  /**
   * Get speaker's documents
   */
  async getSpeakerDocuments(speakerId, direction = null, status = null, page = 1, limit = 10) {
    try {
      console.log('📋 Fetching speaker documents...');
      
      // For speakers, we want documents where they are the speaker
      // AND status is 'sent' or later (meaning they've been sent to the speaker)
      const query = { 
        speaker: speakerId,
        status: { $in: ['sent', 'pending_review', 'approved', 'signed', 'declined'] }
      };
      
      if (status) {
        query.status = status;
      }
      
      // Note: direction parameter is not used for speakers as they only see incoming documents
      // Suppress unused parameter warning
      void direction;
      
      const skip = (page - 1) * limit;
      
      const documents = await Document.find(query)
        .populate('organizer', 'firstName lastName email profileImageUrl')
        .populate('relatedBooking', 'bookingId eventDetails')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Document.countDocuments(query);
      
      console.log(`✅ Found ${documents.length} documents for speaker`);
      
      return {
        success: true,
        documents: documents,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching speaker documents:', error);
      throw error;
    }
  }
  
  /**
   * Helper method to extract confirmed speakers from booking data
   * This works with the existing booking endpoint response
   */
  extractConfirmedSpeakersFromBookings(bookingData) {
    if (!bookingData || !bookingData.confirmed) {
      return [];
    }
    
    return bookingData.confirmed.map(booking => ({
      _id: booking._id,
      bookingId: booking.bookingId,
      speaker: booking.speaker,
      eventDetails: booking.eventDetails,
      compensationAndArrangements: booking.compensationAndArrangements,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      createdAt: booking.createdAt,
      timeAgo: booking.timeAgo
    }));
  }
  
  /**
   * Update document status
   */
  async updateDocumentStatus(documentId, newStatus, userId, userRole) {
    try {
      console.log('🔄 Updating document status...');
      
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Verify user has permission to update this document
      if (userRole === 'organizer') {
        if (document.organizer.toString() !== userId.toString()) {
          throw new Error('Unauthorized: You can only update your own documents');
        }
      } else if (userRole === 'speaker') {
        if (document.speaker.toString() !== userId.toString()) {
          throw new Error('Unauthorized: You can only update documents assigned to you');
        }
      }
      
      // Update status
      await document.updateStatus(newStatus, userId);
      
      // Populate the updated document
      await document.populate([
        { path: 'speaker', select: 'firstName lastName email profileImageUrl' },
        { path: 'organizer', select: 'firstName lastName email profileImageUrl' },
        { path: 'relatedBooking', select: 'bookingId eventDetails' }
      ]);
      
      console.log('✅ Document status updated successfully');
      
      return {
        success: true,
        document: document,
        message: 'Document status updated successfully'
      };
      
    } catch (error) {
      console.error('❌ Error updating document status:', error);
      throw error;
    }
  }
  
  /**
   * Download document (track download)
   */
  async downloadDocument(documentId, userId, userRole) {
    try {
      console.log('📥 Processing document download...');
      
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Verify user has permission to download this document
      if (userRole === 'organizer') {
        if (document.organizer.toString() !== userId.toString()) {
          throw new Error('Unauthorized: You can only download your own documents');
        }
      } else if (userRole === 'speaker') {
        if (document.speaker.toString() !== userId.toString()) {
          throw new Error('Unauthorized: You can only download documents assigned to you');
        }
      }
      
      // Track download
      await document.trackDownload();
      
      console.log('✅ Document download tracked');
      
      return {
        success: true,
        document: document,
        downloadUrl: document.file.cloudinaryUrl,
        message: 'Document download processed successfully'
      };
      
    } catch (error) {
      console.error('❌ Error processing document download:', error);
      throw error;
    }
  }
  
  /**
   * Delete document
   */
  async deleteDocument(documentId, userId, userRole) {
    try {
      console.log('🗑️ Deleting document...');
      
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Verify user has permission to delete this document
      if (userRole === 'organizer') {
        if (document.organizer.toString() !== userId.toString()) {
          throw new Error('Unauthorized: You can only delete your own documents');
        }
      } else {
        throw new Error('Unauthorized: Only organizers can delete documents');
      }
      
      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(document.file.cloudinaryPublicId);
        console.log('✅ Document deleted from Cloudinary');
      } catch (cloudinaryError) {
        console.warn('⚠️ Warning: Could not delete from Cloudinary:', cloudinaryError.message);
      }
      
      // Delete from database
      await Document.findByIdAndDelete(documentId);
      
      console.log('✅ Document deleted successfully');
      
      return {
        success: true,
        message: 'Document deleted successfully'
      };
      
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw error;
    }
  }
  
  /**
   * Get document statistics for organizer
   */
  async getOrganizerDocumentStats(organizerId) {
    try {
      console.log('📊 Fetching organizer document statistics...');
      
      const stats = await Document.aggregate([
        { $match: { organizer: organizerId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            uploaded: { $sum: { $cond: [{ $eq: ['$status', 'uploaded'] }, 1, 0] } },
            assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
            sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            pendingReview: { $sum: { $cond: [{ $eq: ['$status', 'pending_review'] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            signed: { $sum: { $cond: [{ $eq: ['$status', 'signed'] }, 1, 0] } },
            declined: { $sum: { $cond: [{ $eq: ['$status', 'declined'] }, 1, 0] } }
          }
        }
      ]);
      
      const result = stats[0] || {
        total: 0,
        uploaded: 0,
        assigned: 0,
        sent: 0,
        pendingReview: 0,
        approved: 0,
        signed: 0,
        declined: 0
      };
      
      console.log('✅ Document statistics fetched');
      
      return {
        success: true,
        stats: result,
        message: 'Document statistics fetched successfully'
      };
      
    } catch (error) {
      console.error('❌ Error fetching document statistics:', error);
      throw error;
    }
  }
  
  /**
   * Get document statistics for speaker
   */
  async getSpeakerDocumentStats(speakerId) {
    try {
      console.log('📊 Fetching speaker document statistics...');
      
      const stats = await Document.aggregate([
        { $match: { speaker: speakerId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pendingReview: { $sum: { $cond: [{ $eq: ['$status', 'pending_review'] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            signed: { $sum: { $cond: [{ $eq: ['$status', 'signed'] }, 1, 0] } },
            declined: { $sum: { $cond: [{ $eq: ['$status', 'declined'] }, 1, 0] } }
          }
        }
      ]);
      
      const result = stats[0] || {
        total: 0,
        pendingReview: 0,
        approved: 0,
        signed: 0,
        declined: 0
      };
      
      console.log('✅ Speaker document statistics fetched');
      
      return {
        success: true,
        stats: result,
        message: 'Speaker document statistics fetched successfully'
      };
      
    } catch (error) {
      console.error('❌ Error fetching speaker document statistics:', error);
      throw error;
    }
  }

  /**
   * Get all documents for a user (both incoming and outgoing)
   * This unified method shows documents where the user is either organizer or speaker
   */
  async getAllUserDocuments(userId, userRole, direction = null, status = null, page = 1, limit = 10) {
    try {
      console.log('📋 Fetching all user documents...');
      console.log('🔍 User ID:', userId, 'Role:', userRole);
      
      // Build query to get documents where user is either organizer or speaker
      const query = {
        $or: [
          { organizer: userId },  // Documents where user is the organizer (outgoing)
          { speaker: userId }     // Documents where user is the speaker (incoming)
        ]
      };
      
      // Add additional filters if provided
      if (direction) {
        query.direction = direction;
      }
      
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const documents = await Document.find(query)
        .populate('organizer', 'firstName lastName email profileImageUrl')
        .populate('speaker', 'firstName lastName email profileImageUrl')
        .populate('relatedBooking', 'bookingId eventDetails')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Document.countDocuments(query);
      
      // Separate documents into incoming and outgoing arrays based on direction and user role
      const outgoingDocuments = [];
      const incomingDocuments = [];
      
      documents.forEach(doc => {
        let isOutgoing = false;
        let isIncoming = false;
        
        // Determine if document is outgoing or incoming based on direction and user role
        if (userRole === 'organizer') {
          // For organizers:
          // - outgoing: documents they sent to speakers (organizer_to_speaker)
          // - incoming: documents they received from speakers (speaker_to_organizer)
          isOutgoing = doc.direction === 'organizer_to_speaker' && doc.organizer._id.toString() === userId.toString();
          isIncoming = doc.direction === 'speaker_to_organizer' && doc.organizer._id.toString() === userId.toString();
        } else if (userRole === 'speaker') {
          // For speakers:
          // - outgoing: documents they sent to organizers (speaker_to_organizer)
          // - incoming: documents they received from organizers (organizer_to_speaker)
          isOutgoing = doc.direction === 'speaker_to_organizer' && doc.speaker._id.toString() === userId.toString();
          isIncoming = doc.direction === 'organizer_to_speaker' && doc.speaker._id.toString() === userId.toString();
        }
        
        // Also include drafts (only visible to the creator)
        const isDraft = doc.direction === 'draft' && (
          (userRole === 'organizer' && doc.organizer._id.toString() === userId.toString()) ||
          (userRole === 'speaker' && doc.speaker._id.toString() === userId.toString())
        );
        
        if (isDraft) {
          // Drafts can be considered outgoing for the creator
          isOutgoing = true;
        }
        
        const documentData = {
          ...doc.toObject(),
          // Add role-specific information
          ...(isOutgoing && {
            recipient: userRole === 'organizer' ? doc.speaker : doc.organizer,
            recipientType: userRole === 'organizer' ? 'speaker' : 'organizer'
          }),
          ...(isIncoming && {
            sender: userRole === 'organizer' ? doc.speaker : doc.organizer,
            senderType: userRole === 'organizer' ? 'speaker' : 'organizer'
          })
        };
        
        if (isOutgoing) {
          outgoingDocuments.push(documentData);
        } else if (isIncoming) {
          incomingDocuments.push(documentData);
        }
      });
      
      console.log(`✅ Found ${documents.length} total documents for user`);
      console.log(`📊 Outgoing: ${outgoingDocuments.length}`);
      console.log(`📥 Incoming: ${incomingDocuments.length}`);
      
      return {
        success: true,
        data: {
          incoming: incomingDocuments,
          outgoing: outgoingDocuments
        },
        pagination: {
          page: page,
          limit: limit,
          total: total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          total: documents.length,
          outgoing: outgoingDocuments.length,
          incoming: incomingDocuments.length
        }
      };
      
    } catch (error) {
      console.error('❌ Error fetching all user documents:', error);
      throw error;
    }
  }
}

const documentService = new DocumentService();
export default documentService;
