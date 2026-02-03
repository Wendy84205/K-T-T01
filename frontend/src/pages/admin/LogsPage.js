import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';

export default function LogsPage() {
    const location = useLocation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filterActor, setFilterActor] = useState(location.state?.userId || '');
    const [filterAction, setFilterAction] = useState('All Actions');

    const fetchLogs = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const filters = {};
            if (filterActor) filters.userId = filterActor;
            if (filterAction !== 'All Actions') filters.eventType = filterAction;

            const response = await api.getAuditLogs(page, 10, filters);
            setLogs(response.data || []);
            setTotalPages(response.totalPages || 1);

            if (!selectedLog && response.data?.length > 0) {
                setSelectedLog(response.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [page, filterActor, filterAction, selectedLog]);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(() => {
            fetchLogs(true);
        }, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [fetchLogs]);

    const handleExport = async () => {
        try {
            const result = await api.exportSecurityReport();
            const blob = new Blob([result.csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_logs_${new Date().toISOString()}.csv`;
            a.click();
        } catch (err) {
            alert('Export failed');
        }
    };

    return (
        <div className="soc-dashboard" style={{ padding: '24px 40px' }}>
            {/* CONTENT HEADER */}
            <div className="soc-title-section" style={{ marginBottom: '32px' }}>
                <div className="soc-title-left">
                    <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '4px' }}>System Audit Trail</h1>
                    <div style={{ color: '#8b949e', fontSize: '13px' }}>
                        Viewing logs from server cluster: <span style={{ color: '#58a6ff' }}>us-east-1a</span>
                    </div>
                </div>
            </div>

            {/* FILTERS BAR */}
            <div className="soc-filter-row" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', flex: 1, flexWrap: 'wrap' }}>
                    <div className="search-container-mobile" style={{ position: 'relative' }}>
                        <i className='bx bx-group' style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e', fontSize: '18px' }}></i>
                        <input
                            type="text"
                            placeholder="Filter by Actor..."
                            className="admin-input"
                            style={{ background: '#0d1117', border: '1px solid #30363d', color: 'white', padding: '10px 16px 10px 48px', borderRadius: '6px', width: '100%', fontSize: '13px' }}
                            value={filterActor}
                            onChange={(e) => setFilterActor(e.target.value)}
                        />
                    </div>
                    <div className="search-container-mobile" style={{ position: 'relative' }}>
                        <i className='bx bx-list-check' style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e', fontSize: '18px', zIndex: 1 }}></i>
                        <select
                            className="admin-input"
                            style={{
                                background: '#0d1117',
                                border: '1px solid #30363d',
                                color: 'white',
                                padding: '10px 16px 10px 48px',
                                borderRadius: '6px',
                                width: '100%',
                                fontSize: '13px',
                                appearance: 'none',
                                cursor: 'pointer'
                            }}
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                        >
                            <option>All Actions</option>
                            <option>LOGIN_SUCCESS</option>
                            <option>LOGOUT_SUCCESS</option>
                            <option>USER_CREATED</option>
                            <option>USER_UPDATED</option>
                            <option>USER_STATUS_CHANGED</option>
                            <option>USER_DEACTIVATED</option>
                            <option>USER_PURGED</option>
                            <option>GLOBAL_SYSTEM_LOCKDOWN</option>
                            <option>FILE_DELETE</option>
                            <option>BRUTE_FORCE_ATTEMPT</option>
                            <option>PERMISSION_DENIED</option>
                        </select>
                        <i className='bx bx-chevron-down' style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8b949e' }}></i>
                    </div>
                </div>
                <button className="admin-btn admin-btn-outline" onClick={handleExport} style={{ borderColor: '#30363d', color: '#c9d1d9', height: '42px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600' }}>
                    <i className='bx bx-export' style={{ fontSize: '18px' }}></i> EXPORT CSV
                </button>
            </div>

            {/* TERMINAL TABLE */}
            <div className="terminal-window" style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.4)', borderRadius: '10px' }}>
                <div className="terminal-header" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)' }}>
                    <div className="terminal-dots" style={{ gap: '10px' }}>
                        <span className="red" style={{ width: '13px', height: '13px' }}></span>
                        <span className="yellow" style={{ width: '13px', height: '13px' }}></span>
                        <span className="green" style={{ width: '13px', height: '13px' }}></span>
                    </div>
                    <div className="terminal-title" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>root@sentinel:~/logs/audit.log</div>
                </div>

                <div className="audit-table-container">
                    <table className="audit-table">
                        <thead>
                            <tr style={{ background: '#0d1117' }}>
                                <th style={{ padding: '16px 20px' }}>TIMESTAMP (ISO 8601)</th>
                                <th style={{ padding: '16px 20px' }}>ACTOR</th>
                                <th style={{ padding: '16px 20px' }}>ACTION</th>
                                <th style={{ padding: '16px 20px' }}>IP ADDRESS</th>
                                <th style={{ padding: '16px 20px' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '120px', color: '#8b949e' }}>
                                        <div className="soc-dot-pulse" style={{ margin: '0 auto 20px', width: '12px', height: '12px' }}></div>
                                        SYNCING AUDIT DATA...
                                    </td>
                                </tr>
                            ) : logs.map((log) => (
                                <tr
                                    key={log.id}
                                    className={selectedLog?.id === log.id ? 'selected' : ''}
                                    onClick={() => setSelectedLog(log)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td style={{ color: '#8b949e', fontSize: '13px' }}>
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff' }}>
                                                {log.user?.firstName?.charAt(0) || log.userId?.charAt(0) || 'U'}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#c9d1d9' }}>
                                                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System/Anonymous'}
                                                </span>
                                                <span style={{ fontSize: '10px', color: '#8b949e' }}>@{log.user?.username || 'system'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span className={log.severity === 'CRITICAL' || log.severity === 'HIGH' || log.eventType.includes('DENIED') || log.eventType.includes('FAILED') ? 'action-failed' : 'action-success'} style={{ fontSize: '12px', fontWeight: '800' }}>
                                                {log.eventType}
                                            </span>
                                            <span style={{ fontSize: '11px', color: '#8b949e', marginTop: '2px' }}>
                                                {log.description}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#c9d1d9', fontSize: '13px', fontFamily: 'monospace' }}>{log.ipAddress || '127.0.0.1'}</td>
                                    <td>
                                        <span className={`status-capsule ${log.severity === 'CRITICAL' || log.severity === 'HIGH' ? 'failed' : 'success'}`} style={{ fontSize: '10px', padding: '4px 10px', minWidth: '70px', textAlign: 'center' }}>
                                            {log.severity}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="terminal-footer" style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '13px', color: '#8b949e' }}>
                        Showing {logs.length > 0 ? ((page - 1) * 10) + 1 : 0}-{Math.min(page * 10, totalPages * 10)} of ~1,245 events
                    </div>
                    <div className="pagination-controls" style={{ gap: '8px' }}>
                        <button className="pg-btn" disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 16px' }}>Previous</button>
                        <button className="pg-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ padding: '6px 16px' }}>Next</button>
                    </div>
                </div>
            </div>

            {/* FORENSIC DETAILS */}
            <div className="forensic-grid" style={{ marginTop: '24px' }}>
                <div className="forensic-card">
                    <h2 className="forensic-title">Session Metadata</h2>
                    {selectedLog ? (
                        <div className="metadata-list">
                            <div className="metadata-row">
                                <span className="metadata-label">Session ID:</span>
                                <span className="metadata-value">sess_{selectedLog.id.slice(0, 6)}</span>
                            </div>
                            <div className="metadata-row">
                                <span className="metadata-label">Duration:</span>
                                <span className="metadata-value">45ms</span>
                            </div>
                            <div className="metadata-row">
                                <span className="metadata-label">Protocol:</span>
                                <span className="metadata-value">HTTPS/2.0</span>
                            </div>
                            <div className="metadata-row">
                                <span className="metadata-label">User Agent:</span>
                                <span className="metadata-value" style={{ fontSize: '11px', lineHeight: '1.4' }}>{selectedLog.userAgent?.slice(0, 40) || 'Mozilla/5.0...'}</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#8b949e', fontSize: '13px', padding: '20px 0' }}>Select a log entry to analyze session telemetry.</div>
                    )}
                </div>

                <div className="forensic-card" style={{ background: '#010409' }}>
                    <h2 className="forensic-title">Raw Payload</h2>
                    {selectedLog ? (
                        <pre className="payload-preview" style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '12px', color: '#58a6ff' }}>
                            {JSON.stringify({
                                event_id: selectedLog.id,
                                timestamp: selectedLog.createdAt,
                                actor: selectedLog.user?.username || 'system',
                                action: selectedLog.eventType,
                                entity: selectedLog.entityType,
                                entity_id: selectedLog.entityId,
                                severity: selectedLog.severity,
                                values: {
                                    old: selectedLog.oldValues,
                                    new: selectedLog.newValues
                                },
                                metadata: selectedLog.metadata
                            }, null, 2)}
                        </pre>
                    ) : (
                        <div style={{ color: '#8b949e', fontSize: '13px', padding: '20px 0' }}>Initial payloads are encrypted at rest. Select a log to decrypt.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
