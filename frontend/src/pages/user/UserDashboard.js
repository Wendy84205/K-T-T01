import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  ShieldAlert,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Activity
} from 'lucide-react';
import api from '../../utils/api';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    conversations: 0,
    files: 0,
    securityScore: 100,
    incidents: 0
  });
  const [recentChats, setRecentChats] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [convs, files, security, audit] = await Promise.all([
          api.getConversations(),
          api.getFiles(),
          api.getSecurityDashboard(7),
          api.getAuditLogs(1, 5)
        ]);

        setStats({
          conversations: convs?.length || 0,
          files: files?.length || 0,
          securityScore: Math.max(0, 100 - (security?.summary?.totalAlerts * 10 || 0)),
          incidents: security?.summary?.totalAlerts || 0
        });

        setRecentChats(convs?.slice(0, 5) || []);
        setAccessLogs(audit?.data?.slice(0, 4) || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[var(--text-main)]">
        <div className="relative w-16 h-16 flex items-center justify-center mb-6">
           <div className="absolute inset-0 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
           <ShieldCheck size={24} className="text-[var(--primary)] animate-pulse" />
        </div>
        <span className="font-bold tracking-widest text-xs uppercase" style={{ textShadow: '0 0 10px rgba(99,102,241,0.5)' }}>Decrypting Personal Data...</span>
      </div>
    );
  }

  const cards = [
    { label: 'Secure Sessions', value: stats.conversations, icon: MessageSquare, color: 'var(--blue-color)', shadow: 'rgba(56, 189, 248, 0.4)', path: '/user/home' },
    { label: 'Vaulted Files', value: stats.files, icon: FileText, color: 'var(--green-color)', shadow: 'rgba(16, 185, 129, 0.4)', path: '/user/drive' },
    { label: 'Security Posture', value: `${stats.securityScore}%`, icon: ShieldCheck, color: stats.securityScore > 80 ? 'var(--green-color)' : 'var(--red-color)', shadow: stats.securityScore > 80 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(248, 113, 113, 0.4)', path: '/user/analytics' },
    { label: 'Threat Pulse', value: stats.incidents, icon: ShieldAlert, color: stats.incidents > 0 ? 'var(--red-color)' : 'var(--text-muted)', shadow: stats.incidents > 0 ? 'rgba(248, 113, 113, 0.4)' : 'rgba(255, 255, 255, 0.1)', path: '/user/analytics' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-8 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="flex items-end justify-between border-b border-[rgba(255,255,255,0.05)] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[rgba(99,102,241,0.15)] rounded-xl border border-[rgba(99,102,241,0.3)] shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Activity size={24} className="text-[var(--primary)]" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>System Overview</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-sm font-medium ml-12">Real-time telemetry from your secure workspace.</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[var(--green-color)] font-black text-xs uppercase tracking-widest mb-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[var(--green-color)] animate-pulse shadow-[0_0_8px_var(--green-color)]" />
            Live Encrypted Connection
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Node: US-EAST-4A-SECURE</span>
        </div>
      </div>

      {/* KPI Glass Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(card.path)}
            className="group relative overflow-hidden text-left p-6 rounded-3xl transition-all duration-500"
            style={{ 
              background: 'rgba(13, 17, 26, 0.6)', 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = card.color;
              e.currentTarget.style.boxShadow = `0 10px 40px ${card.shadow}, inset 0 1px 0 rgba(255,255,255,0.1)`;
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl" style={{ background: `radial-gradient(circle at top right, ${card.color}, transparent 70%)` }} />
            
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <card.icon size={80} style={{ color: card.color }} />
            </div>
            
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-6">
                 <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <card.icon size={24} style={{ color: card.color, filter: `drop-shadow(0 0 8px ${card.shadow})` }} />
                 </div>
                 <ArrowUpRight size={20} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
               </div>
               <div className="text-4xl font-black text-white mb-2 tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{card.value}</div>
               <div className="text-[11px] font-black uppercase tracking-widest" style={{ color: card.color }}>{card.label}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Recent Communication Glass Panel */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden" style={{ background: 'rgba(13, 17, 26, 0.4)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <div className="px-8 py-6 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[rgba(255,255,255,0.02)]">
            <h2 className="font-black text-sm text-white uppercase tracking-widest flex items-center gap-3">
              <div className="p-1.5 bg-[var(--primary-light)] rounded-lg">
                 <MessageSquare size={16} className="text-[var(--primary)]" />
              </div>
              Recent Secure Communications
            </h2>
            <button onClick={() => navigate('/user/home')} className="px-4 py-2 rounded-xl bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] text-[10px] font-black text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all duration-300 uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              Launch Messenger
            </button>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.03)] p-2">
            {recentChats.length > 0 ? recentChats.map((chat) => (
              <div 
                key={chat.id} 
                className="mx-2 my-1 px-6 py-4 rounded-2xl flex items-center justify-between hover:bg-[rgba(255,255,255,0.03)] transition-all cursor-pointer group"
                onClick={() => navigate('/user/home', { state: { openChatId: chat.id } })}
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center font-black text-white text-lg group-hover:bg-[rgba(99,102,241,0.2)] group-hover:border-[var(--primary)] transition-all shadow-inner">
                    {chat.name?.charAt(0) || chat.participants?.[0]?.firstName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-white text-base group-hover:text-[var(--primary)] transition-colors tracking-tight">
                      {chat.name || `${chat.participants?.[0]?.firstName} ${chat.participants?.[0]?.lastName}`}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] font-medium truncate max-w-[300px]">
                      {chat.lastMessage?.content || 'Initializing secure channel...'}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="text-[11px] font-bold text-[var(--text-muted)] bg-[rgba(255,255,255,0.03)] px-3 py-1 rounded-lg">
                    {chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NEW'}
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            )) : (
              <div className="py-24 flex flex-col items-center justify-center text-[var(--text-muted)] font-black uppercase tracking-widest gap-4">

                No active secure sessions found.
              </div>
            )}
          </div>
        </div>

        {/* Security Timeline */}
        <div className="rounded-3xl overflow-hidden flex flex-col" style={{ background: 'rgba(13, 17, 26, 0.4)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <div className="px-8 py-6 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
            <h2 className="font-black text-sm text-white uppercase tracking-widest flex items-center gap-3">
              <div className="p-1.5 bg-[rgba(245,158,11,0.1)] rounded-lg">
                 <Clock size={16} className="text-[var(--accent-amber)]" />
              </div>
              System Access Log
            </h2>
          </div>
          <div className="p-8 flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              {accessLogs.length > 0 ? accessLogs.map((log, i) => (
                <div key={log.id} className="flex gap-5 relative group">
                  {i < accessLogs.length - 1 && <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-[rgba(255,255,255,0.05)] group-hover:bg-[rgba(99,102,241,0.3)] transition-colors" />}
                  <div className={`w-4 h-4 rounded-full border-[3px] z-10 shadow-[0_0_10px_currentColor] ${
                    log.severity === 'CRITICAL' ? 'border-red-500 bg-[#3f1515] text-red-500' : 'border-[var(--primary)] bg-[#1e1b4b] text-[var(--primary)]'
                  }`} />
                  <div className="flex-1 -mt-1 pb-1">
                    <div className="text-[13px] font-black text-white uppercase tracking-tight truncate max-w-[180px]" title={log.eventType}>
                      {log.eventType.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[12px] text-[var(--text-secondary)] font-medium mt-1 line-clamp-2 leading-relaxed">
                      {log.description}
                    </div>
                    <div className="text-[10px] font-bold text-[var(--text-muted)] mt-2 uppercase tracking-widest">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] font-black text-xs uppercase tracking-widest opacity-50">

                  No forensic logs found
                </div>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/user/analytics')} 
              className="mt-6 w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[#a5b4fc] bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.2)] hover:bg-[rgba(99,102,241,0.15)] hover:border-[rgba(99,102,241,0.5)] hover:text-white transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"
            >
              Examine Full Telemetry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
