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
      <div className="soc-loader">
        <div className="soc-dot-pulse"></div>
        <span>SYNCHRONIZING SENTINEL SOC...</span>
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
    { label: 'THREAT LEVEL', value: totalAlerts > 5 ? 'High' : (totalAlerts > 2 ? 'Medium' : 'Low'), sub: totalAlerts > 0 ? 'Neutralize' : 'Secure', icon: 'bx-shield', color: totalAlerts > 5 ? 'var(--accent-red)' : (totalAlerts > 2 ? 'var(--accent-amber)' : 'var(--accent-emerald)') },
    { label: 'SYSTEM UPTIME', value: `${uptimePercent}%`, sub: `+ 0.01%`, icon: 'bx-time-five', color: 'var(--accent-blue)' },
    { label: 'ACTIVE SESSIONS', value: activeSessions.toString(), sub: 'Users online', icon: 'bx-user', color: 'var(--accent-blue)' },
    { label: 'BLOCKED IPS (24H)', value: totalFailed.toString(), sub: '- 1', icon: 'bx-block', color: 'var(--accent-red)' },
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
    xLabelStart = displayChartData[0].label;
    xLabelEnd = displayChartData[23].label;
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
    xLabelStart = displayChartData[0].label;
    xLabelEnd = displayChartData[displayChartData.length - 1].label;
  }

  const vectors = dashboardData?.eventTypeDistribution || [];

  return (
    <div className="soc-dashboard">
      {actionLoading && (
        <div className="soc-action-overlay">
          <div className="soc-dot-pulse"></div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="soc-title-section">
        <div className="soc-title-left">
          <h1>Security Operations Center <span className="soc-dot soc-dot-pulse"></span></h1>
          <div className="soc-status-badge">
            <span className="status-label">Real-time monitoring active. Server heartbeat: </span>
            <span className="status-value">Stable</span>
          </div>
        </div>

        <div className="soc-header-btns">
          <button className="admin-btn admin-btn-outline" onClick={handleExport}>
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
          <div className="stat-card" key={idx}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-main">
              <div className="stat-numbers">
                <div className="stat-value">{stat.value}</div>
                <span className="stat-sub" style={{ color: stat.color }}>{stat.sub}</span>
              </div>
              <div className="stat-icon-bg">
                <i className={`bx ${stat.icon}`}></i>
              </div>
            </div>
            <div className="stat-progress">
              <div className="stat-progress-fill" style={{ width: '60%', background: stat.color, boxShadow: `0 0 10px ${stat.color}` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW */}
      <div className="dashboard-row">
        {/* Network Traffic */}
        <div className="content-card">
          <div className="card-header-flex">
            <div className="card-header-info">
              <h2 className="card-title">Network Traffic Throughput</h2>
              <p className="card-desc">
                {timeRange === '24h'
                  ? "Authentication attempts distribution across the last 24 hours."
                  : `Failed authentication attempts over the last ${timeRange}.`}
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
          <div className="chart-container">
            {displayChartData.map((bar, i) => (
              <div key={i} title={`${bar.label}: ${bar.count} attempts`} className="chart-bar" style={{
                height: `${Math.max(5, (bar.count / (timeRange === '24h' ? 10 : 30)) * 100)}%`,
                opacity: 0.1 + (bar.count > 0 ? (timeRange === '24h' ? 0.7 : 0.8) : 0),
                boxShadow: bar.count > 0 ? '0 0 10px var(--accent-blue-glow)' : 'none'
              }}></div>
            ))}
          </div>
          <div className="chart-labels">
            <span>{xLabelStart}</span>
            <span>{timeRange === '24h' ? "12:00" : "Mid Period"}</span>
            <span>{xLabelEnd}</span>
          </div>
        </div>

        {/* Attack Vectors */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Attack Vectors</h2>
            <p className="card-desc">Distribution by security event type</p>
          </div>
          <div className="vectors-list">
            {vectors.length > 0 ? vectors.slice(0, 4).map((v, i) => (
              <div className="vector-item" key={i}>
                <div className="vector-info">
                  <span className="vector-name">{v.eventType.replace(/_/g, ' ')}</span>
                  <span className="vector-percent">{Math.round((v.count / totalEvents) * 100) || 0}%</span>
                </div>
                <div className="vector-progress">
                  <div className="vector-progress-fill" style={{ width: `${(v.count / totalEvents) * 100}%`, background: i === 0 ? 'var(--accent-red)' : 'var(--accent-blue)' }}></div>
                </div>
              </div>
            )) : <div className="no-data">No threats detected</div>}
          </div>

          <div className="heuristic-alert">
            <i className='bx bx-error'></i>
            <div className="alert-content">
              <div className="alert-title">Heuristic Analysis</div>
              <p className="alert-desc">Analysis current period trends...</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW - TABLE */}
      <div className="content-card">
        <div className="table-header">
          <h2 className="card-title">Recent Security Alerts</h2>
          <button
            onClick={() => navigate('/admin/logs')}
            className="view-all-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            VIEW ALL LOGS
          </button>
        </div>

        <div className="table-wrapper">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Source IP</th>
                <th>Event Type</th>
                <th>Action Taken</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length > 0 ? alerts.slice(0, 5).map((alert) => (
                <tr key={alert.id}>
                  <td className="cell-time">{new Date(alert.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`severity-badge severity-${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="cell-ip">{alert.ipAddress || 'Internal'}</td>
                  <td className="cell-event">{alert.title}</td>
                  <td className="cell-status">{alert.status === 'ACTIVE' ? 'Monitoring' : 'Resolved'}</td>
                  <td className="cell-action">
                    <button
                      onClick={() => navigate('/admin/logs', { state: { alertId: alert.id } })}
                      className="details-btn"
                      title="Forensic Analysis"
                    >
                      <i className='bx bx-link-external'></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="no-data-cell">No active alerts</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
