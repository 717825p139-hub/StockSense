const express = require('express');
const router = express.Router();
const securityMonitor = require('../services/securityMonitor');
const { authenticateToken } = require('../middleware/auth');

// Get AI Security Intelligence Analysis (Read-Only)
router.get('/monitor', authenticateToken, async (req, res) => {
  try {
    const analysis = await securityMonitor.getSecurityAnalysis();
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch security analysis' });
  }
});

// Post a custom security event (for frontend error monitoring)
router.post('/log-event', authenticateToken, (req, res) => {
  try {
    const { type, details } = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    securityMonitor.logEvent({
      type: type || 'FRONTEND_EVENT',
      ip: clientIp,
      userId: req.user?.id,
      email: req.user?.email,
      details: details || '',
      path: req.originalUrl
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log security event' });
  }
});

module.exports = router;
