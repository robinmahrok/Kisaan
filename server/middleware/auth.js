import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// Middleware to verify JWT tokens
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      status: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, config.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        status: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to verify refresh tokens
export const authenticateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ 
      status: false, 
      message: 'Refresh token required' 
    });
  }

  jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        status: false, 
        message: 'Invalid or expired refresh token' 
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to check user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ 
        status: false, 
        message: 'Access denied: No role assigned' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: false, 
        message: 'Access denied: Insufficient permissions' 
      });
    }

    next();
  };
};

// Middleware to check if user account is active
export const requireActiveAccount = async (req, res, next) => {
  try {
    const { userInfo } = await import('../repositories/index.js');
    
    const user = await userInfo.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        status: false, 
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        status: false, 
        message: 'Account is inactive' 
      });
    }

    if (user.otpVerify !== 'verified') {
      return res.status(403).json({ 
        status: false, 
        message: 'Email not verified' 
      });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    console.error('Account verification error:', error);
    res.status(500).json({ 
      status: false, 
      message: 'Failed to verify account status' 
    });
  }
};

export default {
  authenticateToken,
  authenticateRefreshToken,
  authorizeRoles,
  requireActiveAccount
}; 