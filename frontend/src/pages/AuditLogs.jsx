import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldCheck, RefreshCw, ShieldAlert, AlertTriangle, Info, Lock } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, secRes] = await Promise.all([
        api.get('/audit-logs'),
        api.get('/security/monitor')
      ]);
      setLogs(logsRes.data);
      setSecurityData(secRes.data);
    } catch (err) {
      console.error('Fetch audit/security data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getThreatBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            Enterprise System & Security Audit
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Immutable audit trail of inventory operations & real-time AI security monitoring
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* AI Security Monitor Panel */}
      {securityData && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  AI-Assisted Security Intelligence
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono font-medium">
                    Read-Only Monitor
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Continuous pattern analysis for authentication anomalies & rate limit breaches
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium uppercase">Threat Score</div>
                <div className="text-lg font-bold text-slate-900 font-mono">{securityData.threatScore} / 100</div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getThreatBadge(securityData.threatLevel)}`}>
                {securityData.threatLevel} THREAT
              </span>
            </div>
          </div>

          {/* Safety Banner */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{securityData.safetyNotice}</span>
          </div>

          {/* Observed Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Failed Logins</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{securityData.metrics?.failedLogins || 0}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">OTP Reset Requests</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{securityData.metrics?.otpRequests || 0}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Rate Limit Triggers</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">{securityData.metrics?.rateLimits || 0}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Auth Violations (401/403)</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5 font-mono">
                {(securityData.metrics?.unauthorized401 || 0) + (securityData.metrics?.forbidden403 || 0)}
              </div>
            </div>
          </div>

          {/* Security Insights */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Security Insights</h3>
            {securityData.insights?.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                {insight.severity === 'HIGH' || insight.severity === 'WARNING' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-semibold text-slate-900">{insight.title}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{insight.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">System Activity Records</h2>
          <span className="text-xs text-slate-400 font-mono">{logs.length} Total Records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-700" />
            <span>Loading audit log records...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">No audit log events recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold uppercase text-slate-500">
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-5">Action</th>
                  <th className="py-3.5 px-5">Entity</th>
                  <th className="py-3.5 px-5">Entity ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-5 text-slate-500 font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {log.user_name || log.user_email || 'System'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 font-medium">{log.entity_type}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-500">{log.entity_id || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

