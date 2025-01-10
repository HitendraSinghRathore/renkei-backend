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
  }
});

config.validate({ allowed: 'strict' });

module.exports = config;
