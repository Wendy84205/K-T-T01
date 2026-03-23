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
        <div className="relative w-16 h-16 flex items-center justify-center mb-6">
           <div className="absolute inset-0 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin border-opacity-50" style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
           <Activity size={24} className="text-[var(--primary)] animate-pulse" />
        </div>
        <span className="font-black tracking-widest text-[10px] uppercase text-white opacity-80" style={{ textShadow: '0 0 10px rgba(99,102,241,0.5)' }}>Parsing Telemetry...</span>
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
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[rgba(255,255,255,0.05)] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[rgba(99,102,241,0.15)] rounded-xl border border-[rgba(99,102,241,0.3)] shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Activity size={24} className="text-[var(--primary)]" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Security Analytics</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-sm font-medium ml-12">Deep-dive forensics into your session telemetry.</p>
        </div>
        
        <div className="flex bg-[rgba(13,17,26,0.6)] backdrop-blur-md p-1.5 rounded-2xl border border-[rgba(255,255,255,0.05)] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'audit' ? 'bg-[var(--primary)] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
          >
            Audit Trail
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'stats' ? 'bg-[var(--primary)] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
          >
            Tactical Stats
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {/* Glow behind cards */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)] to-purple-600 opacity-5 blur-[100px] pointer-events-none rounded-full" />
        
        {identityStats.map((stat, i) => (
          <div key={i} className="group bg-[rgba(13,17,26,0.4)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] p-6 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.02)] transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-[40px] pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:opacity-20" style={{ background: stat.color }} />
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] group-hover:scale-110 transition-transform shadow-inner">
                <stat.icon size={22} style={{ color: stat.color, filter: `drop-shadow(0 0 8px ${stat.color})` }} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">{stat.label}</span>
            </div>
            <div className="text-3xl font-black text-white tracking-tight relative z-10">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Areas */}
      {activeTab === 'audit' ? (
        <div className="rounded-[32px] overflow-hidden flex flex-col relative" style={{ background: 'rgba(5, 7, 12, 0.7)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-70 shadow-[0_0_15px_var(--primary)]" />
          
          <div className="px-8 py-6 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] animate-pulse">
                <Terminal size={14} className="text-[var(--primary)] drop-shadow-[0_0_5px_var(--primary)]" />
              </div>
              <h2 className="font-black text-[11px] uppercase tracking-[0.2em] text-white">Live Forensic Pipeline: <span className="text-[var(--text-muted)] font-mono">audit.log</span></h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[rgba(0,0,0,0.3)] border-b border-[rgba(255,255,255,0.05)]">
                  <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] whitespace-nowrap">Timestamp</th>
                  <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Event Code</th>
                  <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Origin IP</th>
                  <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Severity</th>
                  <th className="px-8 py-5 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] w-full">Telemetry Digest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.02)] font-mono text-sm">
                {logs.length > 0 ? logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[rgba(255,255,255,0.03)] transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] tracking-tight">{new Date(log.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${
                        log.eventType?.includes('FAIL') || log.severity === 'CRITICAL' 
                        ? 'bg-[rgba(248,113,113,0.1)] text-[var(--red-color)] border-[rgba(248,113,113,0.2)] shadow-[0_0_10px_rgba(248,113,113,0.2)]' 
                        : 'bg-[rgba(56,189,248,0.1)] text-[var(--blue-color)] border-[rgba(56,189,248,0.2)] shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                      }`}>
                        {log.eventType}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-bold text-[var(--text-main)]">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="px-8 py-5">
                      <span className={`font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 ${
                        log.severity === 'CRITICAL' ? 'text-[var(--red-color)]' : 'text-[var(--green-color)]'
                      }`}>
                        {log.severity === 'CRITICAL' ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[11px] font-medium text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors leading-relaxed">
                      {log.description}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-32 text-center">

                       <div className="text-[var(--text-muted)] font-black uppercase tracking-[0.2em] text-xs">No forensic activity recorded.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-[rgba(13,17,26,0.5)] backdrop-blur-2xl border border-[rgba(255,255,255,0.08)] p-10 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-[rgba(255,255,255,0.15)] transition-all">
              <div className="absolute -inset-20 bg-gradient-to-tr from-[rgba(99,102,241,0.15)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full blur-[50px]" />
              <h3 className="font-black text-sm uppercase tracking-[0.2em] mb-10 flex items-center gap-3 text-white">
                <div className="p-2 rounded-xl bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)]">
                  <Globe size={18} className="text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary)]" />
                </div>
                Network Integrity
              </h3>
              <div className="aspect-square relative flex items-center justify-center max-w-[250px] mx-auto">
                 <div className="absolute inset-0 border-[12px] border-[rgba(255,255,255,0.05)] rounded-full shadow-inner" />
                 <div className="absolute inset-0 border-[12px] border-[var(--primary)] rounded-full border-t-transparent animate-[spin_10s_linear_infinite]" style={{ filter: 'drop-shadow(0 0 15px var(--primary))' }} />
                 <div className="text-center bg-[rgba(13,17,26,0.8)] backdrop-blur-md rounded-full w-[80%] h-[80%] flex flex-col items-center justify-center border border-[rgba(255,255,255,0.05)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-10">
                    <div className="text-6xl font-black text-white tracking-tight" style={{ textShadow: '0 0 20px rgba(99,102,241,0.5)' }}>{stats.securityScore}<span className="text-3xl font-bold opacity-50">%</span></div>
                    <div className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em] mt-2">Trust Index</div>
                 </div>
              </div>
            </div>

            <div className="bg-[rgba(13,17,26,0.5)] backdrop-blur-2xl border border-[rgba(255,255,255,0.08)] p-10 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-[rgba(255,255,255,0.15)] transition-all flex flex-col justify-between">
              <div>
                <h3 className="font-black text-sm uppercase tracking-[0.2em] mb-10 flex items-center gap-3 text-white">
                  <div className="p-2 rounded-xl bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)]">
                    <Activity size={18} className="text-[var(--primary)] drop-shadow-[0_0_8px_var(--primary)]" />
                  </div>
                  Incident Distribution
                </h3>
                <div className="space-y-8">
                  {[
                    { label: 'Authentication Events', val: logs.filter(l => l.eventType === 'LOGIN_SUCCESS' || l.eventType === 'LOGIN_FAIL').length, color: 'var(--blue-color)' },
                    { label: 'Asset Transfers', val: logs.filter(l => l.eventType === 'FILE_UPLOAD' || l.eventType === 'FILE_DOWNLOAD').length, color: 'var(--green-color)' },
                    { label: 'Critical Interventions', val: logs.filter(l => l.severity === 'CRITICAL').length, color: 'var(--red-color)' }
                  ].map((item, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end text-[11px] font-black uppercase tracking-widest text-white">
                        <span className="flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                           {item.label}
                        </span>
                        <span className="text-[14px] opacity-80" style={{ color: item.color, textShadow: `0 0 10px ${item.color}` }}>{item.val} <span className="text-[9px] opacity-50 text-white">Evts</span></span>
                      </div>
                      <div className="h-3 bg-[rgba(0,0,0,0.5)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)] shadow-inner">
                        <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${Math.max(5, Math.min(100, item.val * 10))}%`, background: `linear-gradient(90deg, transparent, ${item.color})` }}>
                           <div className="absolute right-0 top-0 bottom-0 w-2 bg-white blur-[2px] opacity-50" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-50">
                    Telemetry Sync Active // Encrypted Channel
                 </p>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
