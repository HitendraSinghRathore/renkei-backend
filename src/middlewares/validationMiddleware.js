const { validationResult } = require('express-validator');
function validationMiddleware(req, res, next) {
    const errors = validationResult(req);
    const extractedErrors = errors.array().map(err => err.msg);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: extractedErrors });
    }
    next();
}

module.exports = validationMiddleware;