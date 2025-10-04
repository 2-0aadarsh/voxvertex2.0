import express from 'express';
import multer from 'multer';
import { authenticateJWT, authorizeRoles } from '../middleware/jwtAuth.js';
import {
  uploadDocument,
  assignDocumentToSpeaker,
  sendDocumentToSpeaker,
  getOrganizerDocuments,
  getSpeakerDocuments,
  getAllUserDocuments,
  updateDocumentStatus,
  downloadDocument,
  deleteDocument,
  getOrganizerDocumentStats,
  getSpeakerDocumentStats,
  getDocumentById,
  searchDocuments
} from '../controllers/documentController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 Multer fileFilter - file:', file);
    console.log('🔍 Multer fileFilter - mimetype:', file.mimetype);
    
    // Allow only PDF, DOC, and DOCX files
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      console.log('✅ File type accepted:', file.mimetype);
      cb(null, true);
    } else {
      console.log('❌ File type rejected:', file.mimetype);
      cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, DOC, and DOCX files are allowed.`), false);
    }
  }
});

// Add middleware to log form data parsing
const logFormData = (req, res, next) => {
  console.log('🔍 Raw req.body before multer:', req.body);
  console.log('🔍 Raw req.files before multer:', req.files);
  next();
};

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// ============================================================================
// DOCUMENT UPLOAD ROUTES
// ============================================================================

/**
 * @route   POST /api/documents/upload
 * @desc    Upload a new document
 * @access  Private (Organizer only)
 * @body    { documentName, documentType, tags?, notes? }
 * @file    file (PDF, DOC, DOCX)
 */
router.post('/upload', authorizeRoles('organizer'), logFormData, upload.single('file'), uploadDocument);

// ============================================================================
// DOCUMENT ASSIGNMENT ROUTES
// ============================================================================

/**
 * @route   POST /api/documents/:documentId/assign
 * @desc    Assign document to a speaker
 * @access  Private (Organizer only)
 * @body    { speakerId, relatedBookingId? }
 */
router.post('/:documentId/assign', authorizeRoles('organizer'), assignDocumentToSpeaker);

/**
 * @route   POST /api/documents/:documentId/send
 * @desc    Send document to speaker
 * @access  Private (Organizer only)
 */
router.post('/:documentId/send', authorizeRoles('organizer'), sendDocumentToSpeaker);

// ============================================================================
// DOCUMENT RETRIEVAL ROUTES
// ============================================================================

/**
 * @route   GET /api/documents/organizer
 * @desc    Get organizer's documents
 * @access  Private (Organizer only)
 * @query   { direction?, status?, page?, limit? }
 */
router.get('/organizer', authorizeRoles('organizer'), getOrganizerDocuments);

/**
 * @route   GET /api/documents/speaker
 * @desc    Get speaker's documents
 * @access  Private (Speaker only)
 * @query   { direction?, status?, page?, limit? }
 */
router.get('/speaker', authorizeRoles('speaker'), getSpeakerDocuments);

/**
 * @route   GET /api/documents/all
 * @desc    Get all documents for current user (both incoming and outgoing)
 * @access  Private (Organizer or Speaker)
 * @query   { direction?, status?, page?, limit? }
 */
router.get('/all', authorizeRoles('organizer', 'speaker'), getAllUserDocuments);

// Note: Confirmed speakers are available via the existing booking endpoint:
// GET /api/book-speaker/organizer-bookings

/**
 * @route   GET /api/documents/:documentId
 * @desc    Get single document by ID
 * @access  Private (Organizer or Speaker)
 */
router.get('/:documentId', authorizeRoles('organizer', 'speaker'), getDocumentById);

// ============================================================================
// DOCUMENT STATUS ROUTES
// ============================================================================

/**
 * @route   PUT /api/documents/:documentId/status
 * @desc    Update document status
 * @access  Private (Organizer or Speaker)
 * @body    { status }
 */
router.put('/:documentId/status', authorizeRoles('organizer', 'speaker'), updateDocumentStatus);

// ============================================================================
// DOCUMENT ACTION ROUTES
// ============================================================================

/**
 * @route   GET /api/documents/:documentId/download
 * @desc    Download document (track download)
 * @access  Private (Organizer or Speaker)
 */
router.get('/:documentId/download', authorizeRoles('organizer', 'speaker'), downloadDocument);

/**
 * @route   DELETE /api/documents/:documentId
 * @desc    Delete document
 * @access  Private (Organizer only)
 */
router.delete('/:documentId', authorizeRoles('organizer'), deleteDocument);

// ============================================================================
// DOCUMENT STATISTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/documents/organizer/stats
 * @desc    Get document statistics for organizer
 * @access  Private (Organizer only)
 */
router.get('/organizer/stats', authorizeRoles('organizer'), getOrganizerDocumentStats);

/**
 * @route   GET /api/documents/speaker/stats
 * @desc    Get document statistics for speaker
 * @access  Private (Speaker only)
 */
router.get('/speaker/stats', authorizeRoles('speaker'), getSpeakerDocumentStats);

// ============================================================================
// DOCUMENT SEARCH ROUTES
// ============================================================================

/**
 * @route   GET /api/documents/search
 * @desc    Search documents
 * @access  Private (Organizer or Speaker)
 * @query   { query?, documentType?, status?, page?, limit? }
 */
router.get('/search', authorizeRoles('organizer', 'speaker'), searchDocuments);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file is allowed.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

// Handle other errors
router.use((error, req, res) => {
  console.error('❌ Document route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;
