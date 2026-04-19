const rateLimit = require("express-rate-limit");

/**
 * Striot API limiter avoiding cost explosion or token spam particularly for AI routes.
 * 10 Requests per minute max per IP.
 */
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10,
  message: { message: "Too many AI generation requests, please try again in a minute." },
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = {
  aiRateLimiter
};
