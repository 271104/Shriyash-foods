const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required',
        code: 'TOKEN_REQUIRED'
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      if (req.user.isBlocked) {
        return res.status(403).json({ 
          success: false, 
          message: 'Account is blocked',
          code: 'ACCOUNT_BLOCKED'
        });
      }
      
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Access token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid access token',
        code: 'TOKEN_INVALID'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

exports.optional = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password -refreshToken');
        
        if (req.user && req.user.isBlocked) {
          req.user = null; // Clear blocked user
        }
      } catch (jwtError) {
        // Token invalid or expired, continue as guest
        req.user = null;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Middleware for guest or authenticated users
exports.guestOrAuth = async (req, res, next) => {
  try {
    // First try to authenticate
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password -refreshToken');
        
        if (req.user && !req.user.isBlocked) {
          return next(); // Authenticated user
        }
      } catch (jwtError) {
        // Continue as guest
      }
    }
    
    // Handle as guest user
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session ID required for guest users' 
      });
    }
    
    req.sessionId = sessionId;
    req.isGuest = true;
    next();
  } catch (error) {
    console.error('Guest or auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};
