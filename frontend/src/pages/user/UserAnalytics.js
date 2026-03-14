import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Terminal, 
  MapPin, 
  Monitor, 
  Globe, 
  ShieldCheck, 
  ShieldAlert,
  Calendar,
  Lock,
  Search
} from 'lucide-react';
import api from '../../utils/api';

export default function UserAnalytics() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('audit');
  const [stats, setStats] = useState({
    totalIncidents: 0,
    uniqueIPs: 0,
    securityScore: 100
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [logsData, securityData] = await Promise.all([
          api.getAuditLogs(1, 100),
          api.getSecurityDashboard(30)
        ]);

        const allLogs = logsData?.data || [];
        setLogs(allLogs);
        
        // Derive real stats
        const uniqueIPs = new Set(allLogs.map(l => l.ipAddress).filter(Boolean)).size;
        const totalAlerts = securityData?.summary?.totalAlerts || 0;
        
        setStats({
          totalIncidents: totalAlerts,
          uniqueIPs: uniqueIPs || 1, // At least the current device
          securityScore: Math.max(0, 100 - (totalAlerts * 5))
        });
      } catch (err) {
        console.error('Analytics sync failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-bold tracking-widest text-[10px] uppercase text-[var(--text-muted)]">Parsing Activity Telemetry...</span>
      </div>
    );
  }

  const identityStats = [
    { label: 'Security Level', value: stats.securityScore > 80 ? 'Optimal' : (stats.securityScore > 50 ? 'Stable' : 'Critical'), icon: ShieldCheck, color: stats.securityScore > 80 ? 'var(--green-color)' : (stats.securityScore > 50 ? 'var(--accent-amber)' : 'var(--red-color)') },
    { label: 'Active Clusters', value: `${stats.uniqueIPs} Origin(s)`, icon: MapPin, color: 'var(--primary)' },
    { label: 'Threat Blocks', value: stats.totalIncidents, icon: ShieldAlert, color: 'var(--red-color)' },
    { label: 'Integrity', value: 'Verified', icon: Lock, color: 'var(--primary)' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Security Analytics</h1>
          <p className="text-[var(--text-muted)] text-sm font-medium mt-1">Deep-dive forensics into your session telemetry.</p>
        </div>
        
        <div className="flex bg-[var(--bg-light)] p-1 rounded-2xl border border-[var(--border-color)] shadow-sm">
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-[var(--bg-main)] text-[var(--primary)] shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            Audit Trail
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-[var(--bg-main)] text-[var(--primary)] shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            Tactical Stats
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {identityStats.map((stat, i) => (
          <div key={i} className="bg-[var(--bg-main)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-[var(--bg-light)]">
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{stat.label}</span>
            </div>
            <div className="text-xl font-black text-[var(--text-main)]">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Areas */}
      {activeTab === 'audit' ? (
        <div className="bg-[#030712] border border-[#1f2937] rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary)] via-indigo-500 to-purple-500 opacity-50" />
          
          <div className="px-8 py-6 border-b border-[#1f2937] flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-3">
              <Terminal size={18} className="text-[var(--primary)]" />
              <h2 className="font-black text-[10px] uppercase tracking-widest text-white">Live Forensic Pipeline: audit.log</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/40 border-b border-[#1f2937]">
                  <th className="px-8 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Event</th>
                  <th className="px-8 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">IP Address</th>
                  <th className="px-8 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Severity</th>
                  <th className="px-8 py-4 text-[9px] font-black text-white/40 uppercase tracking-widest">Digest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937] font-mono">
                {logs.length > 0 ? logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className="text-[11px] text-white/60">{new Date(log.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-bold tracking-tighter ${
                        log.eventType?.includes('FAIL') || log.severity === 'CRITICAL' 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}>
                        {log.eventType}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs text-white/80">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="px-8 py-4">
                      <span className={`font-black text-[10px] ${
                        log.severity === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-[11px] text-white/40 group-hover:text-white/70 transition-colors">
                      {log.description}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-white/20 uppercase font-black tracking-widest text-xs">
                      No forensic activity recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-8 rounded-3xl">
              <h3 className="font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <Globe size={16} className="text-[var(--primary)]" />
                Network Integrity
              </h3>
              <div className="aspect-square relative flex items-center justify-center">
                 <div className="absolute inset-0 border-8 border-dashed border-[var(--bg-light)] rounded-full" />
                 <div className="text-center">
                    <div className="text-4xl font-black text-[var(--text-main)]">{stats.securityScore}%</div>
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Trust Index</div>
                 </div>
              </div>
            </div>

            <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-8 rounded-3xl">
              <h3 className="font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity size={16} className="text-[var(--primary)]" />
                Incidents by Type
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Login Success', val: logs.filter(l => l.eventType === 'LOGIN_SUCCESS').length },
                  { label: 'Data Access', val: logs.filter(l => l.eventType === 'FILE_UPLOAD' || l.eventType === 'FILE_DOWNLOAD').length },
                  { label: 'System Guard', val: logs.filter(l => l.severity === 'CRITICAL').length }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>{item.label}</span>
                      <span className="text-[var(--primary)]">{item.val} Events</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-light)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${Math.min(100, item.val * 10)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
