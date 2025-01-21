const mongose = require('mongoose');
const config = require('../config');
const syncDb = async function () {
    try {
        await mongose.connect(config.get('mongoDbURI'), {
            serverSelectionTimeoutMS: 5000 
        });
        console.log('DB connection completed.');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
    mongose.connection.on('connected', function () {
        console.log('DB connected.');
    });
    mongose.connection.on('error', function (err) {
        console.error('DB connection error:', err);
        process.exit(1);
    });
    mongose.connection.on('disconnected', () => {
        console.warn('DB disconnected.');
    });
};
async function closeDb() {
    try {
        await mongose.connection.close();
        console.log('DB connection closed.');
    } catch (err) {
        console.error('Error closing DB connection:', err);
    }
}

module.exports = {
    syncDb,
    closeDb
};