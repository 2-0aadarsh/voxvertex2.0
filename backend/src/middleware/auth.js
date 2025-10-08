import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { verifyAccessToken, verifyRefreshToken, generateTokenPair } from '../utils/tokens/jwt.utils.js';
import { setAllAuthCookies } from '../utils/cookies/cookie.utils.js';
import UserService from '../services/user.service.js';
dotenv.config();

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
    console.log('  - Cookies:', req.cookies);
    console.log('  - Extracted token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required - No token provided'
      });
    }

    try {
      // First, try to verify as access token
      console.log('🔍 Verifying token as access token...');
      let decoded;
      let isRefreshed = false;
      
      try {
        decoded = verifyAccessToken(token);
        console.log('✅ Access token verified successfully:', decoded);
        
        // Access token is valid - attach user info
        req.user = { 
          _id: decoded.id,
          role: decoded.role
        };
        console.log('✅ User attached to request:', req.user);
        next();
        return;
        
      } catch (accessError) {
        console.log('❌ Access token verification failed:', accessError.message);
        console.log('🔍 Access token expired or invalid, checking refresh token...');
        
        // Access token failed, check if we have a refresh token
        const refreshToken = req.cookies?.refreshToken;
        
        if (!refreshToken) {
          throw new Error('Access token expired and no refresh token available');
        }
        
        try {
          // Verify refresh token
          const refreshDecoded = verifyRefreshToken(refreshToken);
          console.log('✅ Refresh token verified successfully:', refreshDecoded);
          
          // Get user data from database
          const { user } = await UserService.getUserById(refreshDecoded.id);
          if (!user) {
            throw new Error('User not found');
          }
          
          // Generate new token pair
          const newTokens = generateTokenPair(user);
          
          // Set new cookies
          setAllAuthCookies(res, newTokens, user);
          
          // Attach user info from database (with role)
          req.user = { 
            _id: user._id,
            role: user.role
          };
          
          // Mark that token was refreshed
          req.tokenRefreshed = true;
          
          console.log('✅ New tokens generated and user attached:', req.user);
          next();
          return;
          
        } catch (refreshError) {
          console.log('❌ Refresh token verification failed:', refreshError.message);
          throw new Error('Both access and refresh tokens are invalid');
        }
      }
    } catch (tokenError) {
      console.warn('❌ Auth token verification failed:', tokenError.message);
      
      // Handle different error types
      if (tokenError.message.includes('Access token expired and no refresh token available')) {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please login again.',
          error: 'SESSION_EXPIRED'
        });
      }
      
      if (tokenError.message.includes('Both access and refresh tokens are invalid')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid session. Please login again.',
          error: 'INVALID_SESSION'
        });
      }
      
      if (tokenError.message.includes('User not found')) {
        return res.status(401).json({
          success: false,
          message: 'User account not found.',
          error: 'USER_NOT_FOUND'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: tokenError.message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication system error'
    });
  }
};

// Require authentication middleware
export const requireAuth = auth;

// Require admin role middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

export default auth; 