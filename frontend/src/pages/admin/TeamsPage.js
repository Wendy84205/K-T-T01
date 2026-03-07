import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Plus, Search, MoreVertical, Shield,
  Mail, Building2, Trash2, UserPlus, X, CheckCircle2,
  ChevronRight, Layout, Settings as SettingsIcon, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('member');

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [teamsData, usersData] = await Promise.all([
        api.getTeams(),
        api.getUsers(1, 1000) // Get all active users for assignment
      ]);
      setTeams(Array.isArray(teamsData) ? teamsData : teamsData?.teams ?? []);

      // Handle the case where api.getUsers might return an object with a data property
      const usersList = Array.isArray(usersData) ? usersData : usersData?.data || [];
      setUsers(usersList);
    } catch (e) {
      setError(e.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    try {
      setActionLoading(true);
      await api.createTeam({ name: newTeamName });
      setShowCreateModal(false);
      setNewTeamName('');
      await fetchData();
    } catch (err) {
      alert('Failed to create team: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openManageMembers = async (team) => {
    setSelectedTeam(team);
    try {
      setActionLoading(true);
      const members = await api.getTeamMembers(team.id);
      setTeamMembers(members || []);
      setShowManageModal(true);
    } catch (err) {
      alert('Failed to load members: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserToAdd) return;
    try {
      setActionLoading(true);
      await api.addTeamMember(selectedTeam.id, selectedUserToAdd, selectedRoleToAdd);
      const members = await api.getTeamMembers(selectedTeam.id);
      setTeamMembers(members || []);
      setSelectedUserToAdd('');
      // Refresh teams to update counts
      await fetchData(true);
    } catch (err) {
      alert('Failed to add member: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <div className="bx bx-loader-alt bx-spin" style={{ fontSize: '40px', marginBottom: '16px' }}></div>
        <p style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Synchronizing Team Protocols...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', color: 'var(--text-main)' }}>
      {/* LOADING OVERLAY */}
      {actionLoading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="bx bx-loader-alt bx-spin" style={{ fontSize: '48px', color: '#fff' }}></div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Users size={28} />
            </div>
            Tactical Operations Units
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px', fontWeight: '500' }}>Manage personnel assignments and unit classifications.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            padding: '12px 24px', borderRadius: '12px', fontWeight: '900',
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            boxShadow: '0 8px 20px var(--shadow-primary)', textTransform: 'uppercase', fontSize: '12px'
          }}
        >
          <Plus size={18} /> Deploy New Team
        </button>
      </div>

      {/* SEARCH/STATS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '40px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by Identification Code or Designation..."
            style={{
              width: '100%', padding: '16px 20px 16px 56px', background: 'var(--bg-panel)',
              border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-main)',
              outline: 'none', fontSize: '15px', fontWeight: '600'
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--bg-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Layout size={18} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '900' }}>{teams.length}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Units</div>
            </div>
          </div>
          <div style={{ flex: 1, background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--bg-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-color)' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '900' }}>{teams.reduce((acc, t) => acc + (t.membersCount || 0), 0)}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>Operatives</div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div style={{ background: 'var(--bg-red-soft)', border: '1px solid var(--red-color)', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <AlertCircle color="var(--red-color)" />
          <div style={{ color: 'var(--red-color)', fontWeight: '700' }}>SYSTEM ERROR: {error}</div>
        </div>
      ) : null}

      {/* TEAMS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {filteredTeams.map((t) => (
          <div
            key={t.id}
            style={{
              background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border-color)',
              padding: '32px', position: 'relative', overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.03 }}>
              <Users size={160} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{
                width: '60px', height: '60px', background: 'linear-gradient(135deg, var(--bg-light) 0%, var(--bg-panel) 100%)',
                border: '1px solid var(--border-color)', borderRadius: '18px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900', color: 'var(--primary)'
              }}>
                {t.name.charAt(0)}
              </div>
              <div style={{
                padding: '6px 12px', background: 'var(--bg-light)', borderRadius: '8px',
                fontSize: '10px', fontWeight: '900', color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                {t.code || `UNIT-${t.id.substring(0, 4).toUpperCase()}`}
              </div>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>{t.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--green-color)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                {t.membersCount || 0} Registered Operatives
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => openManageMembers(t)}
                style={{
                  flex: 1, padding: '14px', background: 'var(--primary)', color: '#fff',
                  border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontSize: '12px', textTransform: 'uppercase'
                }}
              >
                <UserPlus size={16} /> Manage Team
              </button>
              <button
                style={{
                  padding: '14px', background: 'var(--bg-light)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer'
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <form
            onSubmit={handleCreateTeam}
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '440px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>Deploy Unit</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Designation Name</label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. Cyber Response"
                style={{ width: '100%', padding: '16px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontSize: '15px' }}
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ flex: 1, padding: '16px', background: 'var(--primary)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>Confirm</button>
            </div>
          </form>
        </div>
      )}

      {/* MANAGE MODAL */}
      {showManageModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '700px', borderRadius: '32px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '40px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '28px', fontWeight: '900', margin: 0 }}>{selectedTeam?.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', fontWeight: '700' }}>{teamMembers.length} ACTIVE OPERATIVES DETECTED</p>
              </div>
              <button onClick={() => setShowManageModal(false)} style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
              {/* Add Member Row */}
              <div style={{ background: 'var(--bg-light)', padding: '24px', borderRadius: '24px', marginBottom: '32px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '11px', fontWeight: '900', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Assign New Operative</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <select
                    style={{ padding: '14px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                    value={selectedUserToAdd}
                    onChange={(e) => setSelectedUserToAdd(e.target.value)}
                  >
                    <option value="">Select Personnel...</option>
                    {users.filter(u => !teamMembers.some(m => m.user?.id === u.id)).map(u => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.department || 'N/A'})</option>
                    ))}
                  </select>
                  <select
                    style={{ padding: '14px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', outline: 'none' }}
                    value={selectedRoleToAdd}
                    onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                  >
                    <option value="member">Field Operative</option>
                    <option value="leader">Unit Commander</option>
                    <option value="admin">Admin Overseer</option>
                  </select>
                </div>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedUserToAdd}
                  style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', opacity: selectedUserToAdd ? 1 : 0.5 }}
                >
                  Confirm Personnel Assignment
                </button>
              </div>

              {/* Members List */}
              <div style={{ display: 'grid', gap: '12px' }}>
                {teamMembers.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', background: 'var(--bg-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900' }}>
                        {m.user?.firstName?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {m.user?.firstName} {m.user?.lastName}
                          {m.role === 'leader' && <Shield size={14} color="var(--accent-amber)" />}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                          {m.user?.department || 'Operations'} • <span style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{m.role}</span>
                        </div>
                      </div>
                    </div>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '32px 40px', background: 'var(--bg-app)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', borderRadius: '0 0 32px 32px' }}>
              <button onClick={() => setShowManageModal(false)} style={{ padding: '14px 32px', background: 'var(--text-main)', color: 'var(--bg-panel)', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>Close Secure View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
