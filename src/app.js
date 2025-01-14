'use strict';
const express = require('express');
const corsMiddleware = require('./middlewares/cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');  
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(helmet());
app.use(corsMiddleware);





app.get('/healthz', function healthRouter (_, res) {
  console.log('Healthz handler');
  const dbState = mongoose.connection.readyState;
  res.status(200).json({ status: 'OK' , dbState});
});

app.use(function errorHandler(error, _, res) {
  console.error('Unhandled error occured, in default error handler:%o', error.stack);
  res.status(500).json({ error: error.message });
});

module.exports = app;
