// Single Vercel entry point. vercel.json rewrites every request here.
// An Express app is a valid (req, res) handler, and the DB connection
// is handled by middleware inside server.js (after CORS).
const app = require("../server");

module.exports = app;