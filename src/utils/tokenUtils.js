const jwt = require('jsonwebtoken');
const config = require('../config'); 

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    config.get('jwtAuthSecret'),
    { expiresIn: '30m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    config.get('jwtRefreshSecret'),
    { expiresIn: '6h' }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.get('jwtAuthSecret'));
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.get('jwtRefreshSecret'));
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};