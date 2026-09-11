// Vercel Serverless Function — catch-all API handler
// Routes all /api/* requests to the Express app
const app = require('../backend/server');
module.exports = app;
