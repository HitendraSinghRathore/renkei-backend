'use strict';
const convict = require('convict');
const path = require('path');
const dotenv = require('dotenv');
const env = process.env.NODE_ENV || 'development';
if (env === 'development') {
  // only load config when in local env
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  mongoDbURI: {
    doc: 'The mongodb URI to connect to.',
    format: String,
    default: 'mongodb://localhost:27017',
    env: 'MONGODB_URI'
  },
  jwtAuthSecret: {
    doc: 'The secret used to sign the JWT tokens.',
    format: String,
    default: 'secret',
    env: 'JWT_AUTH_SECRET'
  },
  jwtRefreshSecret: {
    doc: 'The secret used to sign the JWT refresh tokens.',
    format: String,
    default: 'secret',
    env: 'JWT_REFRESH_SECRET'
  },
  googleClientSecret: {
    doc: 'The secret used to sign the JWT tokens.',
    format: String,
    default: 'secret',  
    env: 'GOOGLE_CLIENT_SECRET'
  },
  googleClientId: {
    doc: 'The secret used to sign the JWT tokens.',
    format: String,
    default: '',  
    env: 'GOOGLE_CLIENT_ID'
  },
  googleCallbackUrl: {
    doc: 'Callback url to be used',
    format: String,
    default: '',
    env: 'GOOGLE_CALLBACK_URL'
  },
  redirectDomain: {
    doc: 'The domain to redirect to',
    format: String,
    default: '',
    env: 'REDIRECT_DOMAIN'
  },
  uiDomain: {
    doc: 'Domain URL for whitelisting UI in cors',
    format: String,
    default: 'https://localhost:3000',
    env: 'UI_DOMAIN'
  }
});

config.validate({ allowed: 'strict' });

module.exports = config;
