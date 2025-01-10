'use strict';
const express = require('express');
const corsMiddleware = require('./middlewares/cors');
const mongoose = require('mongoose');
const app = express();

app.use(corsMiddleware);

app.use(express.json());


app.get('/healthz', function healthRouter (_, res) {
  const dbState = mongoose.connection.readyState;
  res.status(200).json({ status: 'OK' , dbState});
});

app.get('/', function defaultRouter (_, res) {
  res.send('Hello from the other side!');
});

module.exports = app;
