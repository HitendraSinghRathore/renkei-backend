const cors = require('cors');

const corsOptions = {
    origin: "https://localhost:3000"
};


module.exports = cors(corsOptions);