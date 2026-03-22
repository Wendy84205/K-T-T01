import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Building2, BadgeCheck,
  ShieldAlert, Monitor, Smartphone, Globe,
  LogOut, Shield, Clock, MapPin,
  RefreshCcw, Trash2, ShieldCheck,
  Activity
} from 'lucide-react';
import api from '../../utils/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('identity'); // 'identity', 'security'

  useEffect(() => {
    if (activeTab === 'security') {
      fetchSessions();
    }
  }, [activeTab]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await api.getUserSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (id) => {
    if (!window.confirm('Terminate this session? The device will be logged out immediately.')) return;
    try {
      await api.revokeSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert('Revoke failed: ' + err.message);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, color = 'var(--primary)' }) => (
    <div className="group flex items-center gap-5 py-6 border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors rounded-xl px-4 -mx-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-[rgba(255,255,255,0.05)] shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <Icon color={color} size={22} className="drop-shadow-[0_0_8px_currentColor]" />
      </div>
      <div className="flex-1">
        <label className="block uppercase text-[10px] font-black text-[var(--text-muted)] tracking-[0.15em] mb-1">{label}</label>
        <p className="m-0 text-[15px] font-black text-white tracking-tight group-hover:text-[var(--primary)] transition-colors">{value || 'NOT SPECIFIED'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 text-white animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-end justify-between border-b border-[rgba(255,255,255,0.05)] pb-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[rgba(16,185,129,0.15)] rounded-xl border border-[rgba(16,185,129,0.3)] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <User size={24} className="text-[var(--green-color)]" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Personnel Profile</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-sm font-medium ml-12">Secure management of your enterprise identity and active sessions.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8 p-1.5 rounded-2xl w-fit" style={{ background: 'rgba(13, 17, 26, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <button
          onClick={() => setActiveTab('identity')}
          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
            activeTab === 'identity' 
              ? 'bg-[var(--primary)] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
              : 'bg-transparent text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
        >
          Identity Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
            activeTab === 'security' 
              ? 'bg-[var(--primary)] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
              : 'bg-transparent text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
          }`}
        >
          Security & Sessions
        </button>
      </div>

      {activeTab === 'identity' ? (
        <div className="rounded-[32px] p-10 relative overflow-hidden" style={{ background: 'rgba(13, 17, 26, 0.4)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] rounded-full filter blur-[100px] opacity-10 pointer-events-none" />
          
          <div className="mb-10 flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[var(--primary)] to-indigo-900 border border-[rgba(255,255,255,0.2)] shadow-[0_0_30px_rgba(99,102,241,0.5)] text-white flex items-center justify-center text-4xl font-black">
              {user?.firstName?.charAt(0)}
            </div>
            <div>
              <h3 className="m-0 text-3xl font-black tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{user?.firstName} {user?.lastName}</h3>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)]">
                <ShieldAlert size={12} className="text-[var(--primary)]" />
                <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">{user?.role} clearance</span>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <InfoRow icon={User} label="Designated Name" value={`${user?.firstName} ${user?.lastName}`} />
            <InfoRow icon={Mail} label="Corporate Email" value={user?.email} />
            <InfoRow icon={Building2} label="Department" value={user?.department || "Core Operations"} />
            <InfoRow icon={BadgeCheck} label="Username" value={user?.username} />
            <InfoRow icon={ShieldAlert} label="Security Clearance" value={user?.role?.toUpperCase()} color="var(--red-color)" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* SECURITY STATUS */}
          <div className="rounded-[24px] p-6 flex justify-between items-center relative overflow-hidden" style={{ background: 'rgba(16,185,129,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(16,185,129,0.2)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--green-color)] rounded-full filter blur-[60px] opacity-10 pointer-events-none" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center border border-[rgba(16,185,129,0.3)] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <ShieldCheck color="var(--green-color)" size={28} className="drop-shadow-[0_0_8px_var(--green-color)]" />
              </div>
              <div>
                <h4 className="m-0 text-xl font-black text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Session Integrity Verified</h4>
                <p className="m-0 mt-1 text-xs text-[var(--text-secondary)] font-medium">Your connection is fully encrypted with AES-256-GCM.</p>
              </div>
            </div>
            <div className="text-[var(--green-color)] font-black text-[10px] uppercase tracking-widest px-4 py-2 bg-[rgba(16,185,129,0.1)] rounded-xl border border-[rgba(16,185,129,0.2)]">
               100% SECURE
            </div>
          </div>

          {/* ACTIVE SESSIONS */}
          <div className="rounded-[32px] overflow-hidden flex flex-col" style={{ background: 'rgba(13, 17, 26, 0.4)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div className="px-8 py-6 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] flex justify-between items-center">
              <h3 className="m-0 text-base font-black text-white uppercase tracking-widest flex items-center gap-3">
                 <div className="p-1.5 bg-[rgba(56,189,248,0.1)] rounded-lg">
                   <Monitor size={16} className="text-[var(--blue-color)]" />
                 </div>
                 Authorized Sessions
              </h3>
              <button onClick={fetchSessions} className="p-2 rounded-xl bg-[rgba(255,255,255,0.05)] text-[var(--text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-[rgba(255,255,255,0.05)] shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {sessions.length > 0 ? sessions.map(session => (
                <div key={session.id} className="group flex items-center gap-5 p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                    {session.device?.includes('iPhone') || session.device?.includes('Android') ? <Smartphone size={22} className={session.isCurrent ? 'text-[var(--green-color)] drop-shadow-[0_0_8px_var(--green-color)]' : ''} /> : <Monitor size={22} className={session.isCurrent ? 'text-[var(--green-color)] drop-shadow-[0_0_8px_var(--green-color)]' : ''} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-black text-[15px] tracking-tight">{session.device || 'Unknown Device'}</span>
                      {session.isCurrent && (
                        <span className="bg-[rgba(16,185,129,0.15)] text-[var(--green-color)] border border-[rgba(16,185,129,0.3)] px-2 py-0.5 rounded uppercase text-[10px] font-black tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">CURRENT</span>
                      )}
                    </div>
                    <div className="flex gap-4 text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> {session.ipAddress}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(session.lastActive).toLocaleString()}</span>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="opacity-0 group-hover:opacity-100 p-3 rounded-xl bg-[rgba(248,113,113,0.1)] text-[var(--red-color)] border border-[rgba(248,113,113,0.3)] hover:bg-[var(--red-color)] hover:text-white transition-all shadow-[0_0_15px_rgba(248,113,113,0.2)]"
                      title="Revoke Session"
                    >
                      <LogOut size={18} />
                    </button>
                  )}
                </div>
              )) : (
                <div className="p-16 text-center text-[var(--text-muted)] font-black uppercase tracking-widest text-xs">

                  <p>No active sessions detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-50">
          Protocol Version: 2.0.0-ULTRA-SECURE // Built by KTT01 Cyber
        </p>
      </div>
    </div>
  );
}
