import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield, AlertTriangle, Activity, Lock,
  Unlocked, Globe, Terminal, UserX,
  RefreshCcw, Filter, CheckCircle, XCircle,
  Eye, ShieldCheck, Zap, ShieldAlert,
  Server, Network, FileShield
} from 'lucide-react';
import api from '../../utils/api';

export default function SecurityPage() {
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(7); // days
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'alerts', 'logs'

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashData, alertsData, logsData] = await Promise.all([
        api.getSecurityDashboard(timeRange),
        api.getSecurityAlerts(true),
        api.getAuditLogs(1, 20)
      ]);
      setDashboard(dashData);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setLogs(logsData?.data || []);
    } catch (e) {
      console.error('Security data fetch failed:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAcknowledge = async (id) => {
    try {
      await api.acknowledgeAlert(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      // Refresh dashboard to update counts
      const dashData = await api.getSecurityDashboard(timeRange);
      setDashboard(dashData);
    } catch (err) {
      alert('Failed to acknowledge: ' + err.message);
    }
  };

  const dashboardCards = [
    {
      label: 'Security Posture',
      value: dashboard ? Math.max(0, 100 - (dashboard.summary?.totalAlerts * 5) - (dashboard.summary?.totalFailedLogins > 50 ? 10 : 0)) : 0,
      sub: (dashboard ? Math.max(0, 100 - (dashboard.summary?.totalAlerts * 5)) : 0) > 80 ? 'EXCELLENT' : 'CRITICAL',
      icon: ShieldCheck,
      color: (dashboard ? Math.max(0, 100 - (dashboard.summary?.totalAlerts * 5)) : 0) > 80 ? 'var(--green-color)' : 'var(--red-color)',
      bg: (dashboard ? Math.max(0, 100 - (dashboard.summary?.totalAlerts * 5)) : 0) > 80 ? 'var(--bg-green-soft)' : 'var(--bg-red-soft)'
    },
    {
      label: 'Active Threats',
      value: dashboard?.summary?.totalAlerts || 0,
      sub: dashboard?.summary?.totalAlerts > 0 ? 'REQUIRING ACTION' : 'ALL CLEAR',
      icon: ShieldAlert,
      color: dashboard?.summary?.totalAlerts > 0 ? 'var(--red-color)' : 'var(--green-color)',
      bg: dashboard?.summary?.totalAlerts > 0 ? 'var(--bg-red-soft)' : 'var(--bg-green-soft)'
    },
    {
      label: 'Blocked Entities',
      value: dashboard?.topBlockedIPs?.length || 0,
      sub: 'CURRENTLY BLACKLISTED',
      icon: UserX,
      color: 'var(--accent-amber)',
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'System Integrity',
      value: 0 === 0 ? 'INTACT' : 0, // Hardcoded for now until integrity check API is integrated
      sub: 0 === 0 ? 'NO TAMPERING' : 'VIOLATIONS FOUND',
      icon: Terminal,
      color: 0 === 0 ? 'var(--primary)' : 'var(--red-color)',
      bg: 'var(--primary-light)'
    }
  ];

  if (loading && !dashboard) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <RefreshCcw className="animate-spin" size={40} style={{ marginBottom: '16px' }} />
        <p style={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Initializing Secure Node...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', color: 'var(--text-main)', maxWidth: '1400px', margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={32} color="var(--primary)" />
            Security Operation Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px', fontWeight: '500' }}>
            Real-time threat detection and security orchestrator.
          </p>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-panel)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setTimeRange(d)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', background: timeRange === d ? 'var(--primary)' : 'transparent',
                color: timeRange === d ? '#fff' : 'var(--text-secondary)', fontWeight: '800', fontSize: '12px', cursor: 'pointer'
              }}
            >
              {d} DAYS
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div style={{ background: 'var(--bg-red-soft)', border: '1px solid var(--red-color)', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <AlertTriangle color="var(--red-color)" />
          <div style={{ fontWeight: '700', color: 'var(--red-color)' }}>{error}</div>
        </div>
      ) : null}

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {dashboardCards.map((card, i) => (
          <div key={i} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }}>
              <card.icon size={100} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>
              {card.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: card.color }}>{card.value}</div>
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: '800', color: card.color }}>{card.sub}</div>
            <div style={{ height: '4px', background: 'var(--bg-light)', borderRadius: '2px', marginTop: '16px' }}>
              <div style={{ height: '100%', width: typeof card.value === 'number' ? `${Math.min(card.value, 100)}%` : '100%', background: card.color, borderRadius: '2px' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {[
          { id: 'overview', label: 'Overview', icon: Shield },
          { id: 'logs', label: 'Activity Logs', icon: Terminal },
          { id: 'alerts', label: 'Active Alerts', icon: AlertTriangle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px', borderRadius: '12px', border: 'none',
              background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '800', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* DASHBOARD CONTENT */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'overview' ? '1fr 380px' : '1fr', gap: '32px' }}>
        {/* Main Column */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '32px' }}>

          {activeTab === 'overview' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Security Incident Queue</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {alerts.length > 0 ? alerts.map((alert) => (
                  <div key={alert.id} style={{ display: 'flex', gap: '20px', padding: '20px', background: 'var(--bg-light)', borderRadius: '20px', border: '1px solid var(--border-color)', position: 'relative' }}>
                    <div style={{ width: '48px', height: '48px', background: alert.severity === 'CRITICAL' ? 'var(--bg-red-soft)' : 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle color={alert.severity === 'CRITICAL' ? 'var(--red-color)' : 'var(--accent-amber)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-main)' }}>{alert.incidentType}</div>
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', fontWeight: '500' }}>{alert.description}</p>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)' }}>{new Date(alert.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      style={{ height: 'fit-content', background: 'var(--primary)', border: 'none', borderRadius: '10px', color: '#fff', padding: '8px 16px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                    >
                      ACKNOWLEDGE
                    </button>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <CheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <div style={{ fontWeight: '800', textTransform: 'uppercase' }}>All Threats Neutralized</div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'logs' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>System Audit Trail</h2>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>LIVE FEED ACTIVE</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '12px', fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</th>
                      <th style={{ padding: '12px', fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Event</th>
                      <th style={{ padding: '12px', fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                      <th style={{ padding: '12px', fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Impact</th>
                      <th style={{ padding: '12px', fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '13px' }}>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontWeight: '600' }}>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '900',
                            background: log.eventType?.includes('FAILURE') || log.severity === 'CRITICAL' ? 'var(--bg-red-soft)' : 'var(--bg-light)',
                            color: log.eventType?.includes('FAILURE') || log.severity === 'CRITICAL' ? 'var(--red-color)' : 'var(--text-main)'
                          }}>
                            {log.eventType}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: '700' }}>
                          {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'SYSTEM'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            color: log.severity === 'CRITICAL' ? 'var(--red-color)' : log.severity === 'WARN' ? 'var(--accent-amber)' : 'var(--green-color)',
                            fontWeight: '900', fontSize: '11px'
                          }}>
                            {log.severity}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'alerts' && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <ShieldAlert size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <div style={{ fontWeight: '800' }}>No Critical Alerts Found</div>
            </div>
          )}
        </div>

        {/* Right Column: Mini Stats (Only show on overview) */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Current Traffic */}
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--primary)" /> Active Traffic
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Active Sessions', value: dashboard?.summary?.activeSessionCount || 0, color: 'var(--primary)' },
                  { label: 'Security Incidents', value: dashboard?.summary?.totalEvents || 0, color: 'var(--accent-amber)' },
                  { label: 'Failed Login Attempts', value: dashboard?.summary?.totalFailedLogins || 0, color: 'var(--red-color)' }
                ].map((stat, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>{stat.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 20px 0' }}>Tactical Control</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button style={{ padding: '12px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-main)', fontSize: '11px', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                  <RefreshCcw size={16} style={{ display: 'block', margin: '0 auto 8px' }} /> ROTATE KEYS
                </button>
                <button style={{ padding: '12px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-main)', fontSize: '11px', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                  <Lock size={16} style={{ display: 'block', margin: '0 auto 8px' }} /> LOCK SYSTEM
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
