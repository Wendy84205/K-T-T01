// src/pages/admin/AdminHomePage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminHomePage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');

  const fetchData = async () => {
    try {
      const [dashboard, alertsData] = await Promise.all([
        api.getSecurityDashboard(30),
        api.getSecurityAlerts(true)
      ]);
      setDashboardData(dashboard);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time polling every 5 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleExport = async () => {
    try {
      setActionLoading(true);
      const result = await api.exportSecurityReport();
      const blob = new Blob([result.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', result.filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Export failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiagnostics = async () => {
    try {
      setActionLoading(true);
      const result = await api.runDiagnostics();
      alert(result.message);
      await fetchData();
    } catch (err) {
      alert('Diagnostics failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
        <div className="soc-dot-pulse" style={{ width: '24px', height: '24px' }}></div>
        <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>SYNCHRONIZING CORE...</span>
      </div>
    );
  }

  // REAL DATA MAPPING
  const totalAlerts = dashboardData?.summary?.totalAlerts || 0;
  const totalFailed = dashboardData?.summary?.totalFailedLogins || 0;
  const totalEvents = dashboardData?.summary?.totalEvents || 0;
  const activeSessions = dashboardData?.summary?.activeSessionCount || 0;
  const systemUptimeSeconds = dashboardData?.summary?.systemUptime || 0;

  // Format uptime for display
  const uptimeHours = Math.floor(systemUptimeSeconds / 3600);
  const uptimePercent = Math.min(100, (uptimeHours / 24) * 100).toFixed(2);

  const stats = [
    { label: 'THREAT LEVEL', value: totalAlerts > 5 ? 'CRITICAL' : (totalAlerts > 2 ? 'ELEVATED' : 'SECURE'), sub: totalAlerts > 0 ? 'Action Required' : 'All Clear', icon: 'bx-shield', color: totalAlerts > 5 ? 'var(--red-color)' : (totalAlerts > 2 ? 'var(--amber-color)' : 'var(--green-color)') },
    { label: 'SYSTEM UPTIME', value: `${uptimePercent}%`, sub: `Operational`, icon: 'bx-server', color: 'var(--primary)' },
    { label: 'ACTIVE SESSIONS', value: activeSessions.toString(), sub: 'Users online', icon: 'bx-user', color: 'var(--primary)' },
    { label: 'BLOCKED IPS (24H)', value: totalFailed.toString(), sub: 'Mitigated threats', icon: 'bx-block', color: 'var(--red-color)' },
  ];

  let displayChartData = [];
  let xLabelStart = "";
  let xLabelEnd = "";

  if (timeRange === '24h') {
    const hourlyData = dashboardData?.failedLoginsHourly || [];
    const currentHour = new Date().getHours();
    displayChartData = [...Array(24)].map((_, i) => {
      const hour = (currentHour - 23 + i + 24) % 24;
      const data = hourlyData.find(d => Number(d.hour) === hour);
      return { label: `${hour}:00`, count: data ? Number(data.count) : 0 };
    });
    xLabelStart = displayChartData[0]?.label || "00:00";
    xLabelEnd = displayChartData[23]?.label || "23:00";
  } else {
    const daysRequested = timeRange === '7d' ? 7 : 30;
    const trendData = dashboardData?.failedLoginsTrend || [];
    displayChartData = [...Array(daysRequested)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (daysRequested - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      const data = trendData.find(d => d.date.includes(dateStr));
      return { label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), count: data ? Number(data.count) : 0 };
    });
    xLabelStart = displayChartData[0]?.label || "";
    xLabelEnd = displayChartData[displayChartData.length - 1]?.label || "";
  }

  const vectors = dashboardData?.eventTypeDistribution || [];

  return (
    <div className="soc-dashboard">
      {actionLoading && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="soc-dot-pulse" style={{ width: '32px', height: '32px' }}></div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            SOC Operations Center <span className="soc-dot soc-dot-pulse"></span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Real-time monitoring active. Server heartbeat: 
            <span style={{ color: 'var(--green-color)', fontWeight: 700 }}>Stable</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="admin-btn admin-btn-ghost" onClick={handleExport}>
            <i className='bx bx-export'></i> Export Logs
          </button>
          <button className="admin-btn admin-btn-primary" onClick={handleDiagnostics}>
            <i className='bx bx-play-circle'></i> Run Diagnostics
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div className="stat-card" style={{ borderColor: stat.label === 'THREAT LEVEL' ? stat.color : '' }} key={idx}>
            <div className="stat-main">
              <div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>{stat.sub}</div>
              </div>
              <div className="stat-icon-bg" style={{ color: stat.color }}>
                <i className={`bx ${stat.icon}`}></i>
              </div>
            </div>
            <div className="stat-progress">
              <div className="stat-progress-fill" style={{ width: stat.label === 'THREAT LEVEL' || stat.label === 'BLOCKED IPS (24H)' ? '100%' : '60%', background: stat.color, boxShadow: `0 0 10px ${stat.color}` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW */}
      <div className="dashboard-row">
        {/* Network Traffic */}
        <div className="content-card">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Network Throughput</h2>
              <p className="card-desc">
                {timeRange === '24h'
                  ? "Authentication attempts distribution across the last 24 hours."
                  : `Authentication attempts over the last ${timeRange}.`}
              </p>
            </div>
            <div className="time-filter-btns">
              {['24h', '7d', '30d'].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={t === timeRange ? 'active' : ''}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingBottom: '16px', marginTop: '16px' }}>
            {displayChartData.map((bar, i) => (
              <div key={i} title={`${bar.label}: ${bar.count} attempts`} style={{
                flex: 1,
                background: bar.count > 0 ? 'var(--primary)' : 'var(--border-color)',
                height: `${Math.max(4, (bar.count / (timeRange === '24h' ? 10 : 30)) * 100)}%`,
                borderRadius: '4px 4px 0 0',
                transition: 'all 0.3s ease',
                opacity: bar.count > 0 ? 0.9 : 0.4,
                boxShadow: bar.count > 0 ? '0 0 10px rgba(99,102,241,0.4)' : 'none'
              }}></div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>{xLabelStart}</span>
            <span>{timeRange === '24h' ? "12:00" : "Mid Period"}</span>
            <span>{xLabelEnd}</span>
          </div>
        </div>

        {/* Attack Vectors */}
        <div className="content-card">
          <div style={{ marginBottom: '20px' }}>
            <h2 className="card-title">Attack Vectors</h2>
            <p className="card-desc">Distribution by security event type</p>
          </div>
          <div className="vectors-list">
            {vectors.length > 0 ? vectors.slice(0, 4).map((v, i) => {
              const colors = ['var(--red-color)', 'var(--amber-color)', 'var(--primary)', 'var(--green-color)'];
              const color = colors[i % colors.length];
              const pct = totalEvents > 0 ? Math.round((v.count / totalEvents) * 100) : 0;
              return (
                <div key={i} style={{ width: '100%' }}>
                  <div className="vector-info">
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'capitalize' }}>{v.eventType.replace(/_/g, ' ').toLowerCase()}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color }}>{pct}%</span>
                  </div>
                  <div className="vector-progress">
                    <div className="vector-progress-fill" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }}></div>
                  </div>
                </div>
              );
            }) : <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No vector data collected</div>}
          </div>

          <div className="heuristic-alert">
            <i className='bx bx-radar' style={{ fontSize: '24px', color: 'var(--amber-color)' }}></i>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--amber-color)', marginBottom: '4px' }}>Heuristic Analysis</div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>AI agent monitoring anomaly behavior patterns across 4 geographical sectors.</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW - TABLE */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Recent Security Alerts</h2>
          <button
            onClick={() => navigate('/admin/logs')}
            className="admin-btn admin-btn-ghost"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            VIEW ALL LOGS
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Source IP</th>
                <th>Event Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length > 0 ? alerts.slice(0, 6).map((alert) => (
                <tr key={alert.id}>
                  <td className="cell-time">{new Date(alert.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>
                    <span className={`severity-badge severity-${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="cell-ip">{alert.ipAddress || 'Internal'}</td>
                  <td className="cell-event">{alert.title}</td>
                  <td style={{ fontSize: '12px', color: alert.status === 'ACTIVE' ? 'var(--amber-color)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {alert.status === 'ACTIVE' ? 'Monitoring' : 'Resolved'}
                  </td>
                  <td>
                    <button
                      onClick={() => navigate('/admin/logs', { state: { alertId: alert.id } })}
                      className="details-btn"
                      title="Forensic Analysis"
                    >
                      <i className='bx bx-target-lock'></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '13px' }}>No active security alerts logged within the current period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
