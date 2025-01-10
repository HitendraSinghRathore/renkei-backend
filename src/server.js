'use strict';
const config = require('./config');
const PORT = config.get('port');

const app = require('./app');

app.listen(PORT, function serverSetup () {
  console.log(`....Server started on PORT: ${PORT}......`);
});
