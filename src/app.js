'use strict';
const express = require('express');
const corsMiddleware = require('./middlewares/cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');  
const authRouter = require('./routes/authRoutes');
const passport = require('passport');
const profileRouter = require('./routes/profileRoutes');
const projectRouter = require('./routes/projectRoutes');
const app = express();

require('./utils/passport');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(passport.initialize());

app.use(helmet());
app.use(corsMiddleware);



app.use('/auth', authRouter);
app.use('/users', profileRouter);
app.use('/project', projectRouter);

app.get('/healthz', function healthRouter (_, res) {
  console.log('Healthz handler');
  const dbState = mongoose.connection.readyState;
  res.status(200).json({ status: 'OK' , dbState});
});

app.use((_, res, next) => {
  res.status(404).json({ msg: 'Route not found' });
  next();
});
app.use(function errorHandler(error, _, res, next) {
  console.error('Unhandled error occured, in default error handler:%o', error.stack);
  res.status(500).json({ error: 'Something went wrong' });
  next();
});

module.exports = app;
