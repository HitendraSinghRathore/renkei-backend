'use strict';
const express = require('express');

const app = express();

app.use(express.json());

app.get('/healthz', function healthRouter (_, res) {
  res.status(200).json({ status: 'OK' });
});

app.get('/', function defaultRouter (_, res) {
  res.send('Hello from the other side!');
});
module.exports = app;
