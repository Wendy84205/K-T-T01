import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Building2, BadgeCheck,
  ShieldAlert, Monitor, Smartphone, Globe,
  LogOut, Shield, Clock, MapPin,
  RefreshCcw, Trash2, ShieldCheck
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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      padding: '24px 0',
      borderBottom: '1px solid var(--border-color)',
      transition: 'all 0.2s'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: 'var(--bg-panel)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 12px rgba(0,0.0,0,0.05)'
      }}>
        <Icon color={color} size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</label>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{value || 'NOT SPECIFIED'}</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', color: 'var(--text-main)' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>Personnel Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px', fontWeight: '500' }}>
          Secure management of your enterprise identity and active sessions.
        </p>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'var(--bg-main)', padding: '6px', borderRadius: '16px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('identity')}
          style={{
            padding: '10px 24px', borderRadius: '12px', border: 'none',
            background: activeTab === 'identity' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'identity' ? '#fff' : 'var(--text-secondary)',
            fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          IDENTITY
        </button>
        <button
          onClick={() => setActiveTab('security')}
          style={{
            padding: '10px 24px', borderRadius: '12px', border: 'none',
            background: activeTab === 'security' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'security' ? '#fff' : 'var(--text-secondary)',
            fontWeight: '800', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          SECURITY & SESSIONS
        </button>
      </div>

      {activeTab === 'identity' ? (
        <div style={{ background: 'var(--bg-panel)', borderRadius: '32px', border: '1px solid var(--border-color)', padding: '40px', boxShadow: 'var(--shadow)' }}>
          <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '900' }}>
              {user?.firstName?.charAt(0)}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>{user?.firstName} {user?.lastName}</h3>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>{user?.role} clearance</span>
            </div>
          </div>

          <InfoRow icon={User} label="Designated Name" value={`${user?.firstName} ${user?.lastName}`} />
          <InfoRow icon={Mail} label="Corporate Email" value={user?.email} />
          <InfoRow icon={Building2} label="Department" value={user?.department || "Core Operations"} />
          <InfoRow icon={BadgeCheck} label="Username" value={user?.username} />
          <InfoRow icon={ShieldAlert} label="Security Clearance" value={user?.role?.toUpperCase()} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* SECURITY STATUS */}
          <div style={{ background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck color="var(--green-color)" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900' }}>Session Integrity</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Your connection is encrypted with AES-256-GCM.</p>
              </div>
            </div>
          </div>

          {/* ACTIVE SESSIONS */}
          <div style={{ background: 'var(--bg-panel)', borderRadius: '32px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>Authorized Sessions</h3>
              <button onClick={fetchSessions} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div style={{ padding: '8px' }}>
              {sessions.length > 0 ? sessions.map(session => (
                <div key={session.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px', borderRadius: '16px', transition: 'all 0.2s' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    {session.device?.includes('iPhone') || session.device?.includes('Android') ? <Smartphone size={20} /> : <Monitor size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '800', fontSize: '14px' }}>{session.device || 'Unknown Device'}</span>
                      {session.isCurrent && (
                        <span style={{ background: 'var(--bg-green-soft)', color: 'var(--green-color)', fontSize: '9px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px' }}>CURRENT</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} /> {session.ipAddress}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={10} /> {new Date(session.lastActive).toLocaleString()}</span>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      style={{ background: 'var(--bg-red-soft)', border: 'none', borderRadius: '8px', color: 'var(--red-color)', padding: '8px', cursor: 'pointer' }}
                    >
                      <LogOut size={16} />
                    </button>
                  )}
                </div>
              )) : (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>No other active sessions detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Protocol Version: 1.0.4-SECURE // Built by TechCorp Cyber
        </p>
      </div>
    </div>
  );
}
