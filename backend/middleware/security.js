const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const securityMonitor = require('../services/securityMonitor');

// 1. Helmet Security Headers
const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Disabled for flexible Vite/React dev
  crossOriginEmbedderPolicy: false
});

// 2. Global API Rate Limiter
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  handler: (req, res, next, options) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    securityMonitor.logEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      ip: clientIp,
      path: req.originalUrl,
      details: 'Global API rate limit exceeded'
    });
    res.status(429).json(options.message);
  }
});

// 3. Stricter Auth / Login / OTP Rate Limiter (Abuse protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login/OTP attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  handler: (req, res, next, options) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    securityMonitor.logEvent({
      type: 'EXCESSIVE_OTP',
      ip: clientIp,
      email: req.body?.email,
      path: req.originalUrl,
      details: 'Authentication / OTP rate limit exceeded'
    });
    res.status(429).json(options.message);
  }
});

module.exports = {
  helmetMiddleware,
  globalApiLimiter,
  authLimiter
};
