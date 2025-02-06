const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/tokenUtils');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(' ')[1];
  const refreshToken = req.cookies.refreshToken; 
  if (!accessToken && !refreshToken) {
    // if no token provided, return 401
    return res.status(401).json({ msg: 'No token provided' , redirect: true });
  }
  try {
    if(!accessToken) {
      const error = new Error('Access token missing');
      error.name = 'TokenExpiredError';
      throw error;
    }
    const decoded = jwt.verify(accessToken, config.get('jwtAuthSecret'));
    req.user = decoded; 
    if (!refreshToken) {
        return res.status(401).json({ msg: 'Refresh token missing',redirect: true  });
    }
    const decodedRefreshToken = jwt.verify(refreshToken, config.get('jwtRefreshSecret'));
    const userData = await User.findById(decodedRefreshToken.id);
    
    if(!userData || userData.refreshToken.token !== refreshToken) {
        return res.status(401).json({ msg: 'User not found' , redirect: true });
    }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.log('Token expired');
      if (!refreshToken) {
        return res.status(401).json({ msg: 'Refresh token missing', redirect: true });
      }

      try {
        const decodedUser = jwt.verify(refreshToken, config.get('jwtRefreshSecret'));
        const updatedUser = await User.findOneAndUpdate(
          { _id: decodedUser.id, 'refreshToken.token': refreshToken },
          { $set: { 'refreshToken.token': generateRefreshToken(...decodedUser), 'refreshToken.expiresAt': new Date(Date.now() + 6 * 60 * 60 * 1000) } },
          { new: true } 
        );
        if (!updatedUser) {
          return res.status(401).json({ msg: 'Invalid refresh token', redirect: true });
        }

        const newAccessToken = generateAccessToken(decodedUser);

        res.cookie('refreshToken', updatedUser.refreshToken.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'none',
          maxAge: 6 * 60 * 60 * 1000,
          path: '/'
        });
        res.setHeader('Authorization', `Bearer ${newAccessToken}`);

        req.user = jwt.verify(newAccessToken, config.get('jwtAuthSecret')); 
        next();

      } catch (refreshErr) {
        console.error('Error verifying or updating refresh token:', refreshErr); 
        return res.status(401).json({ msg: 'Invalid or expired refresh token', redirect: true });
      }
    } else {
      console.error('Error verifying access token:', err); 
      return res.status(403).json({ msg: 'Forbidden access' });
    }
  }
  }


module.exports = authMiddleware;
