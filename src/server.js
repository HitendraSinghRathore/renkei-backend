'use strict';
const config = require('./config');
const http = require('http');
const PORT = config.get('port');
const dbConfig = require('./config/db');
const gracefulShutdown = require('./utils/shutdown');
const { initSocket } = require('./socket');
dbConfig.syncDb();

const app = require('./app');

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, function serverSetup () {
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