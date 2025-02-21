const { body, query } = require('express-validator');
const { default: mongoose } = require('mongoose');
const { ACESSS_CONSTANTS } = require('./constants');

const signupRules = function () {
  return [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),

    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),

    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),

    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please provide a valid phone number'),
  ];
};

const loginRules = function () {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),

    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ];
};
const profileUpdateRules = function () {
  return [
    body('id').trim().notEmpty().withMessage('User id is required'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),

    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),


    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please provide a valid phone number'),
  ];
};

const projectFetchRules = function () {
  return [
    query('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Project name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Project name must be between 2 and 50 characters'),

    query('status')
      .trim()
      .notEmpty()
      .withMessage('Project status is required')
      .isIn(['all', 'owned', 'shared'])
      .withMessage('Project status must be one of all, owned or shared'),

    query('page')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Page number is required'),

    query('limit')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Limit is required')
    
  ];
};
const projectCreateRules = function () {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Project name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Project name must be between 2 and 50 characters'),

    body('content')
      .notEmpty()
      .withMessage('Project content is required')
      .custom((content) => {
      if (typeof content !== 'object' || content === null) {
        throw new Error('Project content must be a valid object');
      }

    const requiredFields = ['elements', 'appState', 'scrollToContent'];

    requiredFields.forEach((field) => {
      if (content[field] === undefined) {
        throw new Error(`Project content must include '${field}' field`);
      }
    });

    if (!Array.isArray(content.elements)) {
      throw new Error(`'elements' field must be an array`);
    }

    return true;
      }),
  ];
};

const projectUpdateRules = function () {
  return [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Project name must be between 2 and 50 characters'),
      
      body('content')
      .optional()
      .custom((content) => {
        if (typeof content !== 'object' || content === null) {
          throw new Error('Project content must be a valid object');
        }
  
      const requiredFields = ['elements', 'appState', 'scrollToContent'];
  
      requiredFields.forEach((field) => {
        if (content[field] === undefined) {
          throw new Error(`Project content must include '${field}' field`);
        }
      });
  
      if (!Array.isArray(content.elements)) {
        throw new Error(`'elements' field must be an array`);
      }
  
      return true;
      })
      .withMessage('Project content must include all the required fields')
  ];
};

const projectShareRules = function () {
  return [
    body('users').
    isArray().
    withMessage('Users must be an array').
    custom((value) => {
      return value.every(user => {
        if(!user.id || !mongoose.Types.ObjectId.isValid(user.id)) {
          return false;
        }
        if(!user.access || ![ACESSS_CONSTANTS.READ, ACESSS_CONSTANTS.WRITE].includes(user.access)) {
          return false;
        }
        return true;
      });
    })
    .withMessage('Users must be an array of valid objects with id and access fields'),
  ];
};

module.exports = {
  signupRules,
  loginRules,
  profileUpdateRules,
  projectFetchRules,
  projectCreateRules,
  projectUpdateRules,
  projectShareRules
};
