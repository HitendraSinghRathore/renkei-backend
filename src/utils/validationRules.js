const { body} = require('express-validator');
const signupRules = function() {
    return [
    body('firstName')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Please provide a valid phone number')];
};

const loginRules = function() {
    return [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ];
};
const profileUpdateRules = function() {
    return [
    body('id')
        .trim()
        .notEmpty().withMessage('User id is required'),
    body('firstName')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Please provide a valid phone number')
  ];
};
module.exports = {
    signupRules,
    loginRules,
    profileUpdateRules
};