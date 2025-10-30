const sanitizer = require('perfect-express-sanitizer');

const applySanitizer = (app) => {
    app.use(sanitizer());
};

module.exports = { applySanitizer };