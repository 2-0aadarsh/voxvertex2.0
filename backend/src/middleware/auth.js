import jwt from 'jsonwebtoken';
// import User from '../models/user.js';

/**
 * Authentication middleware
 * 
 * This middleware verifies the JWT token and attaches the user to the request object
 * For development purposes, it allows requests to proceed even if authentication fails
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header or cookies
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.accessToken ||
                  req.cookies?.refreshToken;

    console.log('🔍 Auth Debug:');
    console.log('  - Authorization header:', req.header('Authorization'));
    console.log('  - Cookies:', req.cookies);
    console.log('  - Extracted token:', token ? 'Present' : 'Missing');

    if (!token) {
      // For development, allow requests without token
      console.warn('No auth token provided, but proceeding in development mode');
      // Use a valid ObjectId format for development
      req.user = { 
        _id: req.params.userId || '68c9829eb4953beaec50e44a', // Valid ObjectId format
        role: 'organizer' // Add role for development
      };
      return next();
    }

    try {
      // Verify token
      console.log('🔍 Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
      console.log('✅ Token verified successfully:', decoded);
      
      // Attach user ID to request
      req.user = { 
        _id: decoded.id,
        role: decoded.role || 'organizer'
      };
      console.log('✅ User attached to request:', req.user);
      next();
    } catch (tokenError) {
      console.warn('❌ Auth token verification failed:', tokenError.message);
      console.warn('Proceeding in development mode');
      req.user = { 
        _id: req.params.userId || '68c9829eb4953beaec50e44a',
        role: 'organizer'
      };
      return next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // For development, allow requests even if token verification fails
    console.warn('Auth error, but proceeding in development mode');
    req.user = { 
      _id: req.params.userId || '68c9829eb4953beaec50e44a', // Valid ObjectId format
      role: 'organizer' // Add role for development
    };
    return next();
  }
};

export default auth; 