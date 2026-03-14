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
  ChevronRight
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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[var(--text-muted)]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-bold tracking-widest text-xs uppercase">Decrypting Personal Data...</span>
      </div>
    );
  }

  const cards = [
    { label: 'Secure Sessions', value: stats.conversations, icon: MessageSquare, color: 'var(--primary)', path: '/user/home' },
    { label: 'Vaulted Files', value: stats.files, icon: FileText, color: 'var(--green-color)', path: '/user/drive' },
    { label: 'Security Posture', value: `${stats.securityScore}%`, icon: ShieldCheck, color: stats.securityScore > 80 ? 'var(--green-color)' : 'var(--red-color)', path: '/user/analytics' },
    { label: 'Threat Pulse', value: stats.incidents, icon: ShieldAlert, color: stats.incidents > 0 ? 'var(--red-color)' : 'var(--text-muted)', path: '/user/analytics' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">System Overview</h1>
          <p className="text-[var(--text-muted)] text-sm font-medium mt-1">Real-time telemetry from your secure workspace.</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-[var(--green-color)] font-bold text-xs uppercase tracking-widest mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--green-color)] animate-pulse" />
            Live Encrypted Connection
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-tighter opacity-50">Node: us-east-4a</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(card.path)}
            className="group bg-[var(--bg-main)] border border-[var(--border-color)] p-6 rounded-2xl text-left hover:border-[var(--primary)] hover:shadow-[var(--shadow-primary)] transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <card.icon size={64} style={{ color: card.color }} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-[var(--bg-light)] group-hover:bg-[var(--bg-primary-soft)] transition-colors">
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              <ArrowUpRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
            </div>
            <div className="text-2xl font-black text-[var(--text-main)] mb-1">{card.value}</div>
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{card.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Communication */}
        <div className="lg:col-span-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-[var(--shadow)]">
          <div className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--primary)]" />
              Recent Secure Communications
            </h2>
            <button onClick={() => navigate('/user/home')} className="text-[10px] font-bold text-[var(--primary)] hover:underline uppercase tracking-widest">
              View Messenger
            </button>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {recentChats.length > 0 ? recentChats.map((chat) => (
              <div 
                key={chat.id} 
                className="px-8 py-5 flex items-center justify-between hover:bg-[var(--bg-light)] transition-colors cursor-pointer group"
                onClick={() => navigate('/user/home', { state: { openChatId: chat.id } })}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-light)] border border-[var(--border-color)] flex items-center justify-center font-black text-[var(--text-main)]">
                    {chat.name?.charAt(0) || chat.participants?.[0]?.firstName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                      {chat.name || `${chat.participants?.[0]?.firstName} ${chat.participants?.[0]?.lastName}`}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">
                      {chat.lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-[var(--text-muted)] mb-1">
                    {chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-muted)] ml-auto" />
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-[var(--text-muted)] font-bold text-xs uppercase tracking-widest px-8">
                No active secure sessions found.
              </div>
            )}
          </div>
        </div>

        {/* Security Timeline */}
        <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-[var(--shadow)]">
          <div className="px-8 py-6 border-b border-[var(--border-color)]">
            <h2 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} className="text-[var(--accent-amber)]" />
              Access Log
            </h2>
          </div>
          <div className="p-8 space-y-6">
            {accessLogs.length > 0 ? accessLogs.map((log, i) => (
              <div key={log.id} className="flex gap-4 relative">
                {i < accessLogs.length - 1 && <div className="absolute left-[7px] top-6 bottom-[-24px] w-[1px] bg-[var(--border-color)]" />}
                <div className={`w-4 h-4 rounded-full border-2 z-10 ${
                  log.severity === 'CRITICAL' ? 'border-red-500 bg-red-100' : 'border-[var(--primary)] bg-[var(--primary-light)]'
                }`} />
                <div className="flex-1">
                  <div className="text-xs font-black text-[var(--text-main)] uppercase tracking-tight truncate max-w-[180px]" title={log.eventType}>
                    {log.eventType.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 line-clamp-2">
                    {log.description}
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] opacity-50 mt-2 uppercase tracking-tighter">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest leading-relaxed">
                No recent security logs found for your node.
              </div>
            )}
            <button 
              onClick={() => navigate('/user/analytics')} 
              className="w-full mt-4 py-3 bg-[var(--bg-light)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] hover:bg-[var(--border-color)] transition-colors border border-[var(--border-color)]"
            >
              Examine Forensic Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
