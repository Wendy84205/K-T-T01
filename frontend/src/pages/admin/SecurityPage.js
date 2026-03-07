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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(7); // days
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'alerts', 'logs', 'ips'

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashData, alertsData] = await Promise.all([
        api.getSecurityDashboard(timeRange),
        api.getSecurityAlerts(true)
      ]);
      setDashboard(dashData);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
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
      value: dashboard?.healthScore || 0,
      sub: dashboard?.healthScore > 80 ? 'EXCELLENT' : 'CRITICAL',
      icon: ShieldCheck,
      color: dashboard?.healthScore > 80 ? 'var(--green-color)' : 'var(--red-color)',
      bg: dashboard?.healthScore > 80 ? 'var(--bg-green-soft)' : 'var(--bg-red-soft)'
    },
    {
      label: 'Active Threats',
      value: dashboard?.activeThreats || 0,
      sub: 'REQUIRING ACTION',
      icon: ShieldAlert,
      color: 'var(--red-color)',
      bg: 'var(--bg-red-soft)'
    },
    {
      label: 'Blocked Entities',
      value: dashboard?.blockedIPsCount || 0,
      sub: 'CURRENTLY BLACKLISTED',
      icon: UserX,
      color: 'var(--accent-amber)',
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    {
      label: 'System Integrity',
      value: dashboard?.integrityViolations === 0 ? 'INTACT' : dashboard?.integrityViolations,
      sub: dashboard?.integrityViolations === 0 ? 'NO TAMPERING' : 'VIOLATIONS FOUND',
      icon: Terminal,
      color: dashboard?.integrityViolations === 0 ? 'var(--primary)' : 'var(--red-color)',
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

      {/* DASHBOARD CONTENT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
        {/* Left Column: Alerts & Events */}
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Security Incident Queue</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} /> Filter
              </button>
            </div>
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
                      <div style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-main)' }}>{alert.title}</div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0', fontWeight: '500' }}>{alert.message}</p>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)' }}>{new Date(alert.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <span style={{ padding: '4px 10px', background: 'var(--bg-panel)', borderRadius: '6px', fontSize: '10px', fontWeight: '900', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{alert.severity}</span>
                    <span style={{ padding: '4px 10px', background: 'var(--bg-panel)', borderRadius: '6px', fontSize: '10px', fontWeight: '900', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{alert.type}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', color: '#fff', padding: '8px 16px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                  >
                    ACKNOWLEDGE
                  </button>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <CheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <div style={{ fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>All systems operational</div>
                <p style={{ fontSize: '13px', fontWeight: '500' }}>No critical alerts in queue.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Stats/Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Current Traffic */}
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--primary)" /> Active Traffic
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Authorized Shells', value: dashboard?.authorizedSessions || 0, color: 'var(--primary)' },
                { label: 'VPN Tunneled', value: dashboard?.vpnConnections || 0, color: 'var(--accent-amber)' },
                { label: 'Ingress Rate', value: `${dashboard?.ingressRate || 0} req/s`, color: 'var(--green-color)' }
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
              <button style={{ padding: '12px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-main)', fontSize: '11px', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                <Network size={16} style={{ display: 'block', margin: '0 auto 8px' }} /> FLUSH DNS
              </button>
              <button style={{ padding: '12px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-main)', fontSize: '11px', fontWeight: '900', textAlign: 'center', cursor: 'pointer' }}>
                <Globe size={16} style={{ display: 'block', margin: '0 auto 8px' }} /> GEO FENCING
              </button>
            </div>
          </div>

          {/* Security Hygiene */}
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '24px', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '16px', right: '16px', padding: '4px 8px', borderRadius: '4px', background: 'var(--green-color)', color: '#fff', fontSize: '9px', fontWeight: '900'
            }}>COMPLIANT</div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 16px 0' }}>Hygiene Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={14} color="var(--green-color)" />
                <span style={{ fontSize: '12px', fontWeight: '700' }}>AES-256 Enforcement</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={14} color="var(--green-color)" />
                <span style={{ fontSize: '12px', fontWeight: '700' }}>TLS 1.3 Active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={14} color="var(--green-color)" />
                <span style={{ fontSize: '12px', fontWeight: '700' }}>SQLi Protection High</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <XCircle size={14} color="var(--accent-amber)" />
                <span style={{ fontSize: '12px', fontWeight: '700' }}>Pending Patch v2.4.1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
