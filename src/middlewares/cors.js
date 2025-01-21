const cors = require('cors');
const config = require('../config');

const corsOptions = {
    origin: config.get('uiDomain')
};


module.exports = cors(corsOptions);