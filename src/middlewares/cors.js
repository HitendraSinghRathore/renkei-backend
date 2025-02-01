const cors = require('cors');
const config = require('../config');

const corsOptions = {
    origin: config.get('uiDomain'),
    credentials: true
};


module.exports = cors(corsOptions);