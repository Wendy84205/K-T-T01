import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter States
  const [filterRole, setFilterRole] = useState('All Roles');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    banned: 0
  });

  // UI States
  const [activeMenu, setActiveMenu] = useState(null); // Track which user's menu is open
  const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedUserForSessions, setSelectedUserForSessions] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const fetchUsers = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const filters = {};
      if (filterRole !== 'All Roles') filters.role = filterRole;
      if (filterStatus !== 'All Status') filters.status = filterStatus.toLowerCase();
      if (searchTerm) filters.search = searchTerm;

      const response = await api.getUsers(page, limit, filters);

      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalRecords(response.total || 0);

        if (response.stats) {
          setStats(response.stats);
        } else {
          setStats(prev => ({
            ...prev,
            total: response.total || prev.total
          }));
        }
      } else if (Array.isArray(response)) {
        setUsers(response);
        setTotalPages(1);
        setTotalRecords(response.length);
        setStats(prev => ({ ...prev, total: response.length }));
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      if (!silent) setError(err.message || 'Failed to synchronize with central user database.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, filterRole, filterStatus, searchTerm]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(() => {
      fetchUsers(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setActionLoading(true);
      await api.updateUser(userId, { roles: [newRole] });
      await fetchUsers();
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(true);
      await api.approveUser(userId);
      await fetchUsers();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject/ban this user?')) return;
    try {
      setActionLoading(true);
      await api.rejectUser(userId);
      await fetchUsers();
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmergencyLock = async (userId) => {
    const confirmMsg = userId
      ? 'EMERGENCY: Lock this account immediately?'
      : 'EMERGENCY: Lock all active sessions and accounts? (Simulated)';

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      if (userId) {
        await api.emergencyLock(userId);
      } else {
        await api.globalLockdown();
        alert('CRITICAL: Total system lockdown engaged. All non-admin accounts restricted.');
      }
      await fetchUsers();
    } catch (err) {
      alert('Lock failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAll = async () => {
    if (!window.confirm('Approve all pending registration requests?')) return;
    try {
      setActionLoading(true);
      const pendingUserIds = users.filter(u => u.status === 'pending').map(u => u.id);
      if (pendingUserIds.length > 0) {
        await api.bulkUpdateStatus(pendingUserIds, 'active');
      }
      await fetchUsers();
    } catch (err) {
      alert('Bulk approval failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (userId, hard = false) => {
    const msg = hard
      ? 'CRITICAL: This will PERMANENTLY PURGE this identity from the database. This cannot be undone. Proceed?'
      : 'Are you sure you want to deactivate/soft-delete this user?';

    if (!window.confirm(msg)) return;

    try {
      setActionLoading(true);
      if (hard) {
        await api.request(`/users/${userId}/purge`, { method: 'DELETE' });
      } else {
        await api.request(`/users/${userId}`, { method: 'DELETE' });
      }
      await fetchUsers();
      setActiveMenu(null);
    } catch (err) {
      alert('Operation failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageSessions = async (user) => {
    setSelectedUserForSessions(user);
    setLoadingSessions(true);
    try {
      const sessions = await api.getAdminUserSessions(user.id);
      setUserSessions(sessions || []);
    } catch (err) {
      alert('Failed to fetch sessions: ' + err.message);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm('Kill this active session immediately?')) return;
    try {
      setActionLoading(true);
      await api.adminRevokeSession(sessionId);
      // Refresh
      const sessions = await api.getAdminUserSessions(selectedUserForSessions.id);
      setUserSessions(sessions || []);
    } catch (err) {
      alert('Failed to revoke session: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      employeeId: user.employeeId || '',
      jobTitle: user.jobTitle || '',
      department: user.department || 'IT',
      securityClearanceLevel: user.securityClearanceLevel || 1,
      avatarUrl: user.avatarUrl || '',
      totpSecret: user.totpSecret || '',
      role: user.roles?.some(r => r.name === 'Admin') ? 'Admin' :
        user.roles?.some(r => r.name === 'Manager') ? 'Manager' : 'User'
    });
    setSelectedUserForEdit(user);
    setActiveMenu(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        ...editFormData,
        roles: [editFormData.role]
      };
      delete payload.role;

      await api.updateUser(selectedUserForEdit.id, payload);
      await fetchUsers();
      setSelectedUserForEdit(null);
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData(prev => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Generate temporary password and send to user?')) return;
    try {
      setActionLoading(true);
      const result = await api.resetPassword(userId);
      alert(`SUCCESS: Temporary password generated for ${result.username}:\n\n${result.temporaryPassword}\n\nPlease provide this to the user securely.`);
      setActiveMenu(null);
    } catch (err) {
      alert('Reset failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { label: 'Active', color: 'var(--green-color)', dot: 'var(--green-color)' };
      case 'pending': return { label: 'Pending', color: 'var(--accent-amber)', dot: 'var(--accent-amber)' };
      case 'banned': return { label: 'Banned', color: 'var(--red-color)', dot: 'var(--red-color)' };
      default: return { label: 'Unknown', color: 'var(--text-secondary)', dot: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="soc-dashboard" style={{ background: 'var(--bg-app)', minHeight: '100vh', color: 'var(--text-main)', padding: '40px' }}>
      {actionLoading && (
        <div className="soc-action-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="soc-dot-pulse"></div>
        </div>
      )}

      {/* HEADER */}
      <div className="soc-title-section">
        <div className="soc-title-left">
          <h1>User Access Management</h1>
          <p className="card-desc">Manage system users, role assignments, and access control lists.</p>
        </div>
        <div className="soc-header-btns">
          <button className="admin-btn" style={{ background: 'var(--bg-red-soft)', color: 'var(--red-color)', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleEmergencyLock()}>
            <i className='bx bx-lock-alt'></i> Emergency Lock
          </button>
          <button className="admin-btn" style={{ background: 'var(--bg-green-soft)', color: 'var(--green-color)', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleApproveAll}>
            <i className='bx bx-check-double'></i> Approve All
          </button>
          <button
            className="admin-btn"
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', shadow: 'var(--shadow-primary)' }}
            onClick={() => navigate('/admin/users/add')}
          >
            <i className='bx bx-user-plus'></i> Add User
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid" style={{ marginBottom: '40px' }}>
        {[
          { label: 'TOTAL USERS', value: totalRecords, icon: 'bx-group', color: 'var(--primary)' },
          { label: 'ACTIVE NOW', value: stats.active, icon: 'bx-bolt-circle', color: 'var(--green-color)' },
          { label: 'PENDING APPROVAL', value: stats.pending, icon: 'bx-hourglass', color: 'var(--accent-amber)' },
          { label: 'BANNED', value: stats.banned, icon: 'bx-error-alt', color: 'var(--red-color)' }
        ].map((stat, i) => (
          <div key={i} className="stat-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label" style={{ marginBottom: '8px' }}>{stat.label}</div>
              <div className="stat-value" style={{ fontSize: '28px', color: i === 1 ? 'var(--green-color)' : 'var(--text-main)' }}>{stat.value.toLocaleString()}</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`bx ${stat.icon}`} style={{ fontSize: '24px', color: stat.color }}></i>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS & SEARCH */}
      <div className="soc-filter-row" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <div className="soc-filter-group">
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Filter by:</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', outline: 'none' }} value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
              <option>All Roles</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>User</option>
            </select>
            <select style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', outline: 'none' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Banned</option>
            </select>
          </div>
        </div>
        <div className="search-container-mobile" style={{ position: 'relative', width: '320px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <i className='bx bx-search' style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '20px' }}></i>
            <input
              type="text"
              placeholder="Search user..."
              style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '10px 16px 10px 48px', borderRadius: '8px', outline: 'none' }}
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <button
            onClick={fetchUsers}
            style={{ background: 'var(--bg-light)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Refresh Database"
          >
            <i className={`bx bx-refresh ${loading ? 'bx-spin' : ''}`} style={{ fontSize: '20px' }}></i>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="audit-table-container" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
        <table className="audit-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-app)' }}>
              <th style={{ padding: '16px 24px', width: '40px' }}><input type="checkbox" style={{ accentColor: 'var(--primary)' }} /></th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>USER PROFILE</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>ROLE</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>STATUS</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>LAST ACTIVE</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '80px', textAlign: 'center' }}>
                  <div className="soc-dot-pulse"></div>
                  <div style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>FETCHING USER DATA...</div>
                </td>
              </tr>
            ) : (users || []).length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>No users found matching your criteria.</td>
              </tr>
            ) : (users || []).map(user => {
              const statusInfo = getStatusColor(user?.status);
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px' }}><input type="checkbox" style={{ accentColor: 'var(--primary)' }} /></td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fd9745', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700', overflow: 'hidden' }}>
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user.firstName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px' }}>{user.firstName} {user.lastName || ''}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{user.email}</div>
                        {user.jobTitle && <div style={{ fontSize: '10px', color: 'var(--primary)', marginTop: '2px', fontWeight: '600' }}>{user.jobTitle.toUpperCase()}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <select
                      style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                      value={
                        user.roles?.some(r => r.name === 'Admin') ? 'Admin' :
                          user.roles?.some(r => r.name === 'Manager') ? 'Manager' :
                            'User'
                      }
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      disabled={actionLoading}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="User">User</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: `${statusInfo.dot}15`, padding: '4px 12px', borderRadius: '20px', width: 'fit-content', border: `1px solid ${statusInfo.dot}30` }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusInfo.dot }}></div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: statusInfo.color }}>{statusInfo.label}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString() : 'Never'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    {user.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button style={{ background: 'var(--green-color)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleApprove(user.id)}>Approve</button>
                        <button style={{ background: 'transparent', color: 'var(--red-color)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }} onClick={() => handleReject(user.id)}>Reject</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', color: 'var(--text-secondary)' }}>
                        {user.status === 'active' && (
                          <i className='bx bx-lock-alt' style={{ cursor: 'pointer', fontSize: '18px' }} title="Emergency Lock" onClick={() => handleEmergencyLock(user.id)}></i>
                        )}
                        {user.status === 'banned' && (
                          <i className='bx bx-undo' style={{ cursor: 'pointer', fontSize: '18px', color: 'var(--primary)' }} title="Restore User" onClick={() => handleApprove(user.id)}></i>
                        )}
                        <i className='bx bx-trash' style={{ cursor: 'pointer', fontSize: '18px', color: 'var(--red-color)' }} title="Permanent Purge" onClick={() => handleDelete(user.id, true)}></i>

                        {/* THREE DOTS MENU */}
                        <div style={{ position: 'relative' }}>
                          <i
                            className='bx bx-dots-vertical-rounded'
                            style={{ cursor: 'pointer', fontSize: '18px', color: activeMenu === user.id ? '#fff' : 'var(--text-secondary)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(activeMenu === user.id ? null : user.id);
                            }}
                          ></i>

                          {activeMenu === user.id && (
                            <div style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              background: 'var(--bg-panel)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              width: '180px',
                              zIndex: 100,
                              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                              overflow: 'hidden'
                            }}>
                              <button
                                onClick={() => { setSelectedUserForProfile(user); setActiveMenu(null); }}
                                style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                              >
                                <i className='bx bx-user-circle'></i> View Full Profile
                              </button>
                              <button
                                onClick={() => handleEditClick(user)}
                                style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                              >
                                <i className='bx bx-edit-alt'></i> Edit Identity
                              </button>
                              <button
                                onClick={() => { navigate('/admin/logs', { state: { userId: user.id } }); setActiveMenu(null); }}
                                style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                              >
                                <i className='bx bx-list-ul'></i> View User Logs
                              </button>
                              <button
                                onClick={() => handleResetPassword(user.id)}
                                style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                              >
                                <i className='bx bx-key'></i> Reset Password
                              </button>
                              <button
                                onClick={() => { handleManageSessions(user); setActiveMenu(null); }}
                                style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-main)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                              >
                                <i className='bx bx-shield-quarter'></i> Manage Active Sessions
                              </button>
                              <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
                              <button
                                onClick={() => handleDelete(user.id, true)}
                                style={{ width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--red-color)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                              >
                                <i className='bx bx-shield-x'></i> Permanent Purge
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* FOOTER */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing <strong>{users.length}</strong> of <strong>{totalRecords}</strong> users
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="pg-btn"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Previous
            </button>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  style={{
                    minWidth: '32px',
                    height: '32px',
                    background: page === i + 1 ? 'var(--primary)' : 'transparent',
                    border: 'none',
                    color: page === i + 1 ? '#fff' : 'var(--text-main)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="pg-btn"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '6px 16px', borderRadius: '8px', fontSize: '13px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, transition: 'all 0.2s' }}
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next <i className='bx bx-chevron-right' style={{ verticalAlign: 'middle' }}></i>
            </button>
          </div>
        </div>
      </div>

      {/* USER PROFILE MODAL */}
      {selectedUserForProfile && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setSelectedUserForProfile(null)}
        >
          <div
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', width: '100%', maxWidth: '800px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '32px', background: 'linear-gradient(to right, var(--border-color), var(--bg-panel))', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#fd9745', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: '800', overflow: 'hidden' }}>
                  {selectedUserForProfile.avatarUrl ? (
                    <img src={selectedUserForProfile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    selectedUserForProfile.firstName?.charAt(0).toUpperCase() || selectedUserForProfile.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: '800' }}>{selectedUserForProfile.firstName} {selectedUserForProfile.lastName}</h2>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>@{selectedUserForProfile.username} • Sentinel Identity</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForProfile(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', fontSize: '24px' }}
              >×</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* Left Column: Identity & Professional */}
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Identity & Professional</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Email Address', value: selectedUserForProfile.email, icon: 'bx-envelope' },
                    { label: 'Phone Number', value: selectedUserForProfile.phone || 'Not provided', icon: 'bx-phone' },
                    { label: 'Employee ID', value: selectedUserForProfile.employeeId || 'N/A', icon: 'bx-id-card' },
                    { label: 'Job Title', value: selectedUserForProfile.jobTitle || 'N/A', icon: 'bx-briefcase' },
                    { label: 'Department', value: selectedUserForProfile.department || 'N/A', icon: 'bx-buildings' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                      <i className={`bx ${item.icon}`} style={{ fontSize: '18px', color: 'var(--text-secondary)', marginTop: '2px' }}></i>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</div>
                        <div style={{ fontSize: '14px', color: '#f0f6fc', fontWeight: '600' }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Security & Activity */}
              <div>
                <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Security & Clearance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Security Clearance</span>
                      <span style={{ fontSize: '13px', color: '#fff', fontWeight: '800' }}>LEVEL {selectedUserForProfile.securityClearanceLevel || 1}</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(selectedUserForProfile.securityClearanceLevel || 1) * 20}%`, background: 'var(--green-color)' }}></div>
                    </div>
                  </div>

                  {[
                    { label: 'System Role', value: selectedUserForProfile.roles?.map(r => r.name).join(', ') || 'User', icon: 'bx-shield-quarter' },
                    { label: 'MFA Status', value: selectedUserForProfile.mfaRequired ? 'Enabled (Required)' : 'Disabled', icon: 'bx-lock-open-alt' },
                    { label: 'Account Status', value: selectedUserForProfile.status.toUpperCase(), icon: 'bx-info-circle' },
                    { label: 'Account Created', value: new Date(selectedUserForProfile.createdAt).toLocaleDateString(), icon: 'bx-calendar' },
                    { label: 'Last System Access', value: selectedUserForProfile.lastLoginAt ? new Date(selectedUserForProfile.lastLoginAt).toLocaleString() : 'Never', icon: 'bx-time' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                      <i className={`bx ${item.icon}`} style={{ fontSize: '18px', color: 'var(--text-secondary)', marginTop: '2px' }}></i>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.label}</div>
                        <div style={{ fontSize: '14px', color: '#f0f6fc', fontWeight: '600' }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '24px 32px', background: 'var(--bg-app)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setSelectedUserForProfile(null)}
                style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >Close Report</button>
              <button
                onClick={() => { navigate('/admin/logs', { state: { userId: selectedUserForProfile.id } }); setSelectedUserForProfile(null); }}
                style={{ padding: '10px 24px', background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className='bx bx-list-ul'></i> Investigate Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {selectedUserForEdit && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setSelectedUserForEdit(null)}
        >
          <div
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', width: '100%', maxWidth: '700px', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: '#fff', fontSize: '20px' }}>Modify Sentinel Identity</h2>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}
              >×</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              {/* Avatar Section */}
              <div style={{ padding: '0 32px', display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--border-color)', overflow: 'hidden', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editFormData.avatarUrl ? (
                    <img src={editFormData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <i className='bx bx-user' style={{ fontSize: '40px', color: 'var(--text-secondary)' }}></i>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                    <label style={{ background: '#21262d', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                      Browse Sentinel Image
                      <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, avatarUrl: '' })}
                      style={{ background: 'transparent', border: 'none', color: 'var(--red-color)', fontSize: '12px', cursor: 'pointer' }}
                    >Remove Image</button>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>Maximum size 2MB. Recommendation: Square aspect ratio.</p>
                </div>
              </div>

              <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxHeight: '50vh', overflowY: 'auto' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>First Name</label>
                  <input
                    type="text"
                    style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Last Name</label>
                  <input
                    type="text"
                    style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Email</label>
                  <input
                    type="email"
                    style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Phone</label>
                  <input
                    type="text"
                    style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Role</label>
                  <select
                    style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="User">User</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Clearance Level</label>
                  <select
                    style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                    value={editFormData.securityClearanceLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, securityClearanceLevel: parseInt(e.target.value) })}
                  >
                    <option value={1}>Level 1</option>
                    <option value={2}>Level 2</option>
                    <option value={3}>Level 3</option>
                    <option value={4}>Level 4</option>
                    <option value={5}>Level 5</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Job Title</label>
                  <input
                    type="text"
                    style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                    value={editFormData.jobTitle}
                    onChange={(e) => setEditFormData({ ...editFormData, jobTitle: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Department</label>
                  <input
                    type="text"
                    style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', padding: '10px', borderRadius: '8px' }}
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '10px', padding: '16px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#f0f6fc' }}>Authenticator Secret (2FA)</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Manual secret for TOTP apps.</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', color: 'var(--primary)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', width: '180px', fontFamily: 'monospace' }}
                        value={editFormData.totpSecret}
                        onChange={(e) => setEditFormData({ ...editFormData, totpSecret: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
                          let secret = '';
                          for (let i = 0; i < 32; i++) secret += chars.charAt(Math.floor(Math.random() * chars.length));
                          setEditFormData({ ...editFormData, totpSecret: secret });
                        }}
                        style={{ background: '#21262d', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}
                      >Generate</button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '24px 32px', background: 'var(--bg-app)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  style={{ padding: '10px 24px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}
                >Cancel</button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', background: 'var(--green-color)', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ADMINISTRATIVE SESSION MANAGEMENT MODAL */}
      {selectedUserForSessions && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={() => setSelectedUserForSessions(null)}
        >
          <div
            style={{
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '85vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 0 50px rgba(59, 130, 246, 0.15)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, var(--bg-panel), var(--bg-app))' }}>
              <div>
                <h2 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Signal Points</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '12px' }}>Managing sessions for: {selectedUserForSessions.firstName} {selectedUserForSessions.lastName}</p>
              </div>
              <button
                onClick={() => setSelectedUserForSessions(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '20px' }}
              >×</button>
            </div>

            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              {loadingSessions ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary)' }}>
                  <i className='bx bx-loader-alt bx-spin' style={{ fontSize: '32px', marginBottom: '16px' }}></i>
                  <div style={{ fontSize: '12px', fontWeight: '800' }}>INTERCEPTING ACTIVE SIGNALS...</div>
                </div>
              ) : userSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                  <i className='bx bx-ghost' style={{ fontSize: '48px', color: 'var(--border-color)', marginBottom: '16px' }}></i>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>No active intelligence signals detected.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {userSessions.map(session => (
                    <div
                      key={session.id}
                      style={{
                        background: 'var(--bg-panel)',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '12px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--primary)'
                        }}>
                          <i className={`bx ${session.deviceType === 'mobile' ? 'bx-mobile' : 'bx-laptop'}`} style={{ fontSize: '24px' }}></i>
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#f0f6fc', fontSize: '14px' }}>
                            {session.deviceName || 'UNIDENTIFIED UNIT'} • {session.browser}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{session.ipAddress}</span>
                            <span>•</span>
                            <span>{session.city || 'Uknown Sector'}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Pulse: {new Date(session.lastAccessedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={actionLoading}
                        style={{
                          padding: '10px 16px',
                          background: 'rgba(248, 81, 73, 0.1)',
                          color: '#f85149',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '900',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        Terminate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-app)', textAlign: 'center' }}>
              <button
                onClick={() => setSelectedUserForSessions(null)}
                style={{ padding: '12px 30px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
              >Return to Command Center</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
