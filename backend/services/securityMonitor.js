const { query } = require('../config/db');

class SecurityMonitorService {
  constructor() {
    this.inMemoryEvents = [];
    this.maxEvents = 500;
  }

  /**
   * Log security event (Read-only observation)
   */
  logEvent({ type, ip = 'unknown', email = null, userId = null, details = '', path = '' }) {
    const event = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      type,
      ip,
      email,
      userId,
      details,
      path,
      timestamp: new Date().toISOString()
    };

    this.inMemoryEvents.unshift(event);
    if (this.inMemoryEvents.length > this.maxEvents) {
      this.inMemoryEvents.pop();
    }

    // Also persist audit log entry asynchronously
    query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, before_data, after_data)
       VALUES ($1, $2, 'SECURITY_EVENT', $3, NULL, $4)`,
      [userId || null, `SECURITY_${type}`, ip, JSON.stringify({ email, details, path })]
    ).catch(err => console.error('Failed to log security audit event:', err.message));

    return event;
  }

  /**
   * Get AI Security Intelligence Analysis (Read-only)
   */
  async getSecurityAnalysis() {
    const recentEvents = this.inMemoryEvents.slice(0, 100);

    // Compute metrics
    const failedLogins = recentEvents.filter(e => e.type === 'FAILED_LOGIN').length;
    const otpRequests = recentEvents.filter(e => e.type === 'EXCESSIVE_OTP').length;
    const unauthorized401 = recentEvents.filter(e => e.type === 'UNAUTHORIZED_401').length;
    const forbidden403 = recentEvents.filter(e => e.type === 'FORBIDDEN_403').length;
    const rateLimits = recentEvents.filter(e => e.type === 'RATE_LIMIT_EXCEEDED').length;
    const validationFailures = recentEvents.filter(e => e.type === 'VALIDATION_FAILURE').length;

    // Determine overall threat score (0-100) and classification
    let threatScore = 5; // Base normal level
    threatScore += failedLogins * 10;
    threatScore += otpRequests * 15;
    threatScore += rateLimits * 12;
    threatScore += unauthorized401 * 5;
    threatScore += forbidden403 * 8;

    threatScore = Math.min(threatScore, 100);

    let threatLevel = 'LOW';
    if (threatScore > 30) threatLevel = 'MEDIUM';
    if (threatScore > 65) threatLevel = 'HIGH';
    if (threatScore > 85) threatLevel = 'CRITICAL';

    // AI Classification & Insight Generation
    const insights = [];
    if (failedLogins > 3) {
      insights.push({
        severity: 'WARNING',
        title: 'Multiple Failed Login Attempts',
        description: `Detected ${failedLogins} failed authentication attempt(s) recently. Possible brute-force or mistyped credentials.`
      });
    }

    if (otpRequests > 2) {
      insights.push({
        severity: 'HIGH',
        title: 'Excessive Password Reset OTP Requests',
        description: `Detected ${otpRequests} OTP generation request(s). Recommend reviewing rate limits for password recovery.`
      });
    }

    if (rateLimits > 0) {
      insights.push({
        severity: 'MEDIUM',
        title: 'API Rate Limit Threshold Hit',
        description: `Detected ${rateLimits} request burst(s) exceeding normal threshold bounds.`
      });
    }

    if (insights.length === 0) {
      insights.push({
        severity: 'INFO',
        title: 'System Security Operating Normally',
        description: 'No suspicious authentication or rate limit anomalies detected. Operational traffic pattern is within normal bounds.'
      });
    }

    return {
      safetyNotice: 'READ-ONLY SECURITY ASSISTANT: This monitor observes patterns and generates insights. It NEVER automatically modifies inventory or alters account status.',
      threatScore,
      threatLevel,
      metrics: {
        totalObservedEvents: recentEvents.length,
        failedLogins,
        otpRequests,
        unauthorized401,
        forbidden403,
        rateLimits,
        validationFailures
      },
      insights,
      recentEvents: recentEvents.slice(0, 20)
    };
  }
}

module.exports = new SecurityMonitorService();
