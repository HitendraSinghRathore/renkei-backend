const dbConfig = require('../config/db');
async function gracefulShutdown() {
    console.log('Recieve kill signal, shutting down server.');
    try {
        await dbConfig.closeDb();
        console.log('Succefully closed connections');
        process.exit(0);
    } catch (err) {
        console.error('Error shutting down the server: ',err);
        process.exit(1);
    }
}

module.exports = gracefulShutdown;