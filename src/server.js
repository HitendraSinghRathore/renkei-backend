'use strict';
const config = require('./config');
const PORT = config.get('port');
const dbConfig = require('./config/db');
const gracefulShutdown = require('./utils/shutdown');
dbConfig.syncDb();

const app = require('./app');

app.listen(PORT, function serverSetup () {
  console.log(`....Server started on PORT: ${PORT}......`);
});

process.on('SIGTERM', gracefulShutdown);

process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', function uncaughtHandler(err) {
  console.error('Uncaught exception: ', err);
  gracefulShutdown();
});
process.on('unhandledRejection', function uncaughtHandler(err) {
  console.error('Unhandled rejection: ', err);
  gracefulShutdown();
});