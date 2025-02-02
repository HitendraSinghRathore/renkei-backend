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
      if (!refreshToken) {
        return res.status(401).json({ msg: 'Refresh token missing',redirect: true  });
      }
      try {
        const decodedUser = jwt.verify(
          refreshToken,
          config.get('jwtRefreshSecret')
        );
        const user = await User.findById(decodedUser.id);
        if (!user || user.refreshToken.token !== refreshToken) {
          return res.status(401).json({ msg: 'Invalid refresh token' ,redirect: true });
        }
        if (new Date() > user.refreshToken.expiresAt) {
          return res.status(401).json({ msg: 'Refresh token expired' ,redirect: true });
        }
        const newAccessToken = generateAccessToken(user);

        const newRefreshToken = generateRefreshToken(user);

        user.refreshToken = {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        };
        await user.save();

        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure:  process.env.NODE_ENV === 'production', 
          sameSite: 'none',
          maxAge: 6 * 60 * 60 * 1000,
          path: '/'
        });
        res.setHeader('Authorization', `Bearer ${newAccessToken}`);
        req.user = jwt.verify(newAccessToken, config.get('jwtAuthSecret'));
        next();
      } catch (err) {
        console.log('Error occured when verifying refresh token %o', err);
        return res
          .status(401)
          .json({ msg: 'Invalid or expired refresh token',redirect: true  });
      }
    } else {
      console.log('Error occured when verifying token %o', err);
      return res.status(403).json({ msg: 'Forbidden access' });
    }
  }
}

module.exports = authMiddleware;
