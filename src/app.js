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
  const dbState = mongoose.connection.readyState;
  res.status(200).json({ status: 'OK' , dbState});
});

app.get('/', function defaultRouter (_, res) {
  res.send('Hello from the other side!');
});

module.exports = app;
