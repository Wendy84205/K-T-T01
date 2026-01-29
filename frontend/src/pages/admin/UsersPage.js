// src/pages/admin/UsersPage.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';

export default function UsersPage() {
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
  const limit = 10; // Items per page

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {};
      if (filterRole !== 'All Roles') filters.role = filterRole;
      if (filterStatus !== 'All Status') filters.status = filterStatus;
      if (searchTerm) filters.search = searchTerm;

      const response = await api.getUsers(page, limit, filters);

      // Handle response structure { data: [], total: X, page: Y, ... }
      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
        setTotalPages(response.totalPages || 1);
        setTotalRecords(response.total || 0);
      } else if (Array.isArray(response)) {
        // Fallback for array-only response
        setUsers(response);
        setTotalPages(1);
        setTotalRecords(response.length);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to synchronize with central user database.');
    } finally {
      setLoading(false);
    }
  }, [page, filterRole, filterStatus, searchTerm]); // Dep list triggers fetch on change

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setActionLoading(true);
      const backendRole = newRole === 'Admin' ? 'System Admin' :
        newRole === 'Manager' ? 'Department Manager' : 'User';
      await api.updateUser(userId, { roles: [backendRole] });
      await fetchUsers();
    } catch (err) {
      alert('Failed to update role');
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
      alert('Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject this user?')) return;
    try {
      setActionLoading(true);
      await api.rejectUser(userId);
      await fetchUsers();
    } catch (err) {
      alert('Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmergencyLock = async (userId) => {
    if (!window.confirm('EMERGENCY: Lock this account immediately?')) return;
    try {
      setActionLoading(true);
      await api.emergencyLock(userId);
      await fetchUsers();
    } catch (err) {
      alert('Lock failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Derived Stats (Note: active/pending/banned are only for current page due to server-side pagination)
  //const stats = {
  //  total: totalRecords,
  //  active: users.filter(u => u.isActive && !u.isLocked).length,
  //  pending: users.filter(u => !u.isActive).length,
  //  banned: users.filter(u => u.isLocked).length
  //};

  const getStatusInfo = (user) => {
    if (user.isLocked) return { label: 'Banned', color: 'danger', dot: 'red' };
    if (!user.isActive) return { label: 'Pending', color: 'warning', dot: 'amber' };
    return { label: 'Active', color: 'success', dot: 'emerald' };
  };

  return (
    <div className="soc-dashboard">
      {actionLoading && (
        <div className="soc-action-overlay">
          <div className="soc-dot-pulse"></div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="soc-title-section" style={{ marginBottom: '32px' }}>
        <div className="soc-title-left">
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>User Access Management</h1>
          <div style={{ color: '#8b949e', fontSize: '14px', marginTop: '4px' }}>
            Manage system users, role assignments, and access control lists.
          </div>
        </div>

        <div className="soc-header-btns">
          <button className="admin-btn admin-btn-outline" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
            <i className='bx bx-lock-alt'></i> Emergency Lock
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => fetchUsers()}>
            <i className='bx bx-refresh'></i> Refresh Sync
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i>
          <span><strong>DATABASE ERROR:</strong> {error}</span>
        </div>
      )}

      {/* STATS GRID - Derived from backend totally or local? Ideally backend */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">TOTAL USERS</span>
            <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.05)' }}><i className='bx bx-group'></i></div>
          </div>
          <div className="stat-value">{totalRecords.toLocaleString()}</div>
        </div>
        {/* Note: Active/Pending stats here are inaccurate if paginated. 
            For true stats, a separate API endpoint /users/stats is best. 
            For now, we leave placeholders or remove them, or accept they show stats of *current page* (confusing).
            Let's keep them as a visual placeholder or use what we have. 
        */}
      </div>

      {/* FILTER BAR */}
      <div className="dashboard-row" style={{ background: 'transparent', padding: 0, border: 'none', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select className="admin-input" style={{ width: '150px', background: '#0d1117', border: '1px solid #30363d' }} value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
              <option>All Roles</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>User</option>
            </select>
            <select className="admin-input" style={{ width: '150px', background: '#0d1117', border: '1px solid #30363d' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Banned</option>
            </select>
          </div>

          <div className="search-container" style={{ flex: 1, maxWidth: '400px' }}>
            <i className='bx bx-search'></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search IP, Email, Username..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr style={{ background: '#161b22' }}>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th>USER PROFILE</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>LAST ACTIVE</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '100px' }}>
                    <div className="soc-dot-pulse"></div>
                    <div style={{ marginTop: '20px', color: '#8b949e' }}>SYNCHRONIZING USER DATABASE...</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: '#8b949e' }}>
                    {searchTerm || filterRole !== 'All Roles' || filterStatus !== 'All Status'
                      ? 'No users match your security filters.'
                      : 'No users found in current cluster.'}
                  </td>
                </tr>
              ) : users.map(user => {
                const status = getStatusInfo(user);
                return (
                  <tr key={user.id}>
                    <td><input type="checkbox" /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="admin-avatar" style={{ width: '38px', height: '38px', fontSize: '14px', background: 'var(--accent-blue)' }}>
                          {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '700', fontSize: '14px', color: '#c9d1d9' }}>{user.firstName} {user.lastName || ''}</span>
                          <span style={{ fontSize: '11px', color: '#8b949e' }}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="admin-input"
                        style={{ padding: '4px 8px', fontSize: '12px', background: 'transparent', border: '1px solid #30363d', color: '#8b949e' }}
                        value={user.roles?.some(r => r.name === 'System Admin') ? 'Admin' :
                          user.roles?.some(r => r.name === 'Department Manager') ? 'Manager' : 'User'}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="User">User</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: `var(--accent-${status.dot})`,
                          boxShadow: `0 0 8px var(--accent-${status.dot})`
                        }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#c9d1d9' }}>{status.label}</span>
                      </div>
                    </td>
                    <td style={{ color: '#8b949e', fontSize: '13px' }}>
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString() : 'Never'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!user.isActive ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="admin-btn-tag success" onClick={() => handleApprove(user.id)}>Approve</button>
                          <button className="admin-btn-tag danger" onClick={() => handleReject(user.id)}>Reject</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', color: '#8b949e' }}>
                          <i
                            className={`bx ${user.isLocked ? 'bx-lock-alt' : 'bx-lock-open-alt'}`}
                            style={{ cursor: 'pointer', fontSize: '18px', color: user.isLocked ? 'var(--accent-red)' : 'inherit' }}
                            title={user.isLocked ? "Unlock User" : "Emergency Lock"}
                            onClick={() => user.isLocked ? handleApprove(user.id) : handleEmergencyLock(user.id)}
                          ></i>
                          <i className='bx bx-dots-vertical-rounded' style={{ cursor: 'pointer', fontSize: '18px' }}></i>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="terminal-footer" style={{ borderTop: '1px solid #30363d', padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', color: '#8b949e' }}>
            Showing {users.length} of {totalRecords} users (Page {page} of {totalPages})
          </div>
          <div className="pagination-controls" style={{ gap: '8px' }}>
            <button
              className="pg-btn"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              style={{ opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="pg-btn active">{page}</button>
            </div>
            <button
              className="pg-btn"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              style={{ opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
