import React, { useState, useEffect, useCallback } from 'react';
import {
    Settings, Save, Shield, Database, Cpu,
    Bell, Server, RefreshCw, Trash2, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';

export default function SettingsPage() {
    const [activeSegment, setActiveSegment] = useState('General');
    const [loading, setLoading] = useState(true);

    const [config, setConfig] = useState({
        mfa: true,
        bruteForce: true,
        fingerprint: false,
        hostname: 'secure-node-01',
        endpoint: 'https://api.cybersecure.local/v1',
        environment: 'PRODUCTION',
        retention: '90 Days',
        dbBackup: 'Daily',
        dbOptimize: true,
        emailAlerts: true,
        smsAlerts: false,
        webhookUrl: '',
        workerThreads: 8
    });
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const data = await api.getSettings();
            setConfig(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateSettings(config);
            alert('System configuration updated successfully.');
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Failed to update system configuration.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#030712' }}>
                <RefreshCw className="animate-spin" size={48} style={{ marginBottom: '16px', color: '#3b82f6' }} />
                <div style={{ color: '#8b949e', fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '2px' }}>LOADING SYSTEM CONFIGURATION...</div>
            </div>
        );
    }

    return (
        <div className="soc-dashboard" style={{ padding: '32px', background: '#030712' }}>
            <div className="soc-title-section">
                <div className="soc-title-left">
                    <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '800' }}>
                        <Settings className="text-blue-500" style={{ marginRight: '12px' }} />
                        System Configuration
                    </h1>
                    <div className="card-desc">Manage core Sentinel engine parameters and global security policies</div>
                </div>
                <div className="soc-header-btns">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: saving ? '#1e2937' : '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '700',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1
                        }}
                    >
                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'SAVING...' : 'SAVE ALL CHANGES'}
                    </button>
                </div>
            </div>

            <div className="settings-grid">
                {/* Navigation Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        padding: '12px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                    }}>
                        {['General', 'Security', 'Database', 'Notifications', 'Advanced'].map(seg => (
                            <button
                                key={seg}
                                onClick={() => setActiveSegment(seg)}
                                className={`settings-nav-item ${activeSegment === seg ? 'active' : ''}`}
                            >
                                <div className="nav-icon-box">
                                    {seg === 'General' && <Server size={18} />}
                                    {seg === 'Security' && <Shield size={18} />}
                                    {seg === 'Database' && <Database size={18} />}
                                    {seg === 'Notifications' && <Bell size={18} />}
                                    {seg === 'Advanced' && <Cpu size={18} />}
                                </div>
                                <span style={{ flex: 1 }}>{seg}</span>
                                {activeSegment === seg && <div className="active-glow" />}
                            </button>
                        ))}
                    </div>

                    <div style={{
                        marginTop: '20px',
                        padding: '24px',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(153, 27, 27, 0.05) 100%)',
                        borderRadius: '20px',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: '-20px', right: '-20px',
                            width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '50%', filter: 'blur(20px)'
                        }} />
                        <div style={{ color: '#ef4444', fontWeight: '800', fontSize: '12px', marginBottom: '12px', letterSpacing: '1px' }}>DANGER ZONE</div>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.4' }}>Irrersible actions that affect the entire Node Core integrity.</p>
                        <button
                            onClick={() => window.confirm('Are you sure? This will wipe all system data.')}
                            className="factory-reset-btn"
                        >
                            <Trash2 size={14} />
                            FACTORY RESET
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="content-card" style={{ padding: '40px' }}>
                    {activeSegment === 'General' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '32px' }}>General Server Settings</h2>

                            <div className="input-group">
                                <label>Node Identity (Hostname)</label>
                                <input
                                    type="text"
                                    className="settings-input"
                                    value={config.hostname}
                                    onChange={e => setConfig({ ...config, hostname: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label>Primary API Endpoint</label>
                                <input
                                    type="text"
                                    className="settings-input"
                                    value={config.endpoint}
                                    onChange={e => setConfig({ ...config, endpoint: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="input-group">
                                    <label>Environment State</label>
                                    <select
                                        className="settings-input"
                                        value={config.environment}
                                        onChange={e => setConfig({ ...config, environment: e.target.value })}
                                    >
                                        <option>PRODUCTION</option>
                                        <option>STAGING</option>
                                        <option>DEVELOPMENT</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Log Retention Policy</label>
                                    <select
                                        className="settings-input"
                                        value={config.retention}
                                        onChange={e => setConfig({ ...config, retention: e.target.value })}
                                    >
                                        <option>30 Days</option>
                                        <option>90 Days</option>
                                        <option>365 Days</option>
                                        <option>Infinite</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSegment === 'Security' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '32px' }}>Global Security Policies</h2>

                            <div className="toggle-group">
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600' }}>Mandatory MFA Enforcement</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Require all accounts to verify via TOTP on every login attempt.</div>
                                </div>
                                <div
                                    className={`switch ${config.mfa ? 'active' : ''}`}
                                    onClick={() => setConfig({ ...config, mfa: !config.mfa })}
                                ></div>
                            </div>

                            <div className="toggle-group">
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600' }}>Brute Force Lockdown</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Automatically lock accounts for 30 minutes after 5 failed attempts.</div>
                                </div>
                                <div
                                    className={`switch ${config.bruteForce ? 'active' : ''}`}
                                    onClick={() => setConfig({ ...config, bruteForce: !config.bruteForce })}
                                ></div>
                            </div>

                            <div className="toggle-group">
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600' }}>Session Fingerprinting</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Invalidate sessions if User-Agent or IP changes significantly.</div>
                                </div>
                                <div
                                    className={`switch ${config.fingerprint ? 'active' : ''}`}
                                    onClick={() => setConfig({ ...config, fingerprint: !config.fingerprint })}
                                ></div>
                            </div>
                        </div>
                    )}

                    {activeSegment === 'Database' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '32px' }}>Database & Storage</h2>

                            <div className="input-group">
                                <label>Automated Backup Interval</label>
                                <select
                                    className="settings-input"
                                    value={config.dbBackup}
                                    onChange={e => setConfig({ ...config, dbBackup: e.target.value })}
                                >
                                    <option>Hourly</option>
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>

                            <div className="toggle-group">
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600' }}>Automatic Index Optimization</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Run background vacuum and indexing to maintain query speed.</div>
                                </div>
                                <div
                                    className={`switch ${config.dbOptimize ? 'active' : ''}`}
                                    onClick={() => setConfig({ ...config, dbOptimize: !config.dbOptimize })}
                                ></div>
                            </div>
                        </div>
                    )}

                    {activeSegment === 'Notifications' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '32px' }}>Incident Alert Channels</h2>

                            <div className="toggle-group">
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600' }}>Email Security Alerts</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Send critical security events to the administrator email.</div>
                                </div>
                                <div
                                    className={`switch ${config.emailAlerts ? 'active' : ''}`}
                                    onClick={() => setConfig({ ...config, emailAlerts: !config.emailAlerts })}
                                ></div>
                            </div>

                            <div className="toggle-group">
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600' }}>SMS Urgent Notifications</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Send SMS for SEVERITY:CRITICAL alerts (Twilio API required).</div>
                                </div>
                                <div
                                    className={`switch ${config.smsAlerts ? 'active' : ''}`}
                                    onClick={() => setConfig({ ...config, smsAlerts: !config.smsAlerts })}
                                ></div>
                            </div>

                            <div className="input-group" style={{ marginTop: '24px' }}>
                                <label>SIEM / Webhook Endpoint</label>
                                <input
                                    type="text"
                                    className="settings-input"
                                    placeholder="https://your-siem.com/api/v1/ingest"
                                    value={config.webhookUrl}
                                    onChange={e => setConfig({ ...config, webhookUrl: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {activeSegment === 'Advanced' && (
                        <div>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '32px' }}>Advanced Optimization</h2>

                            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '20px', borderRadius: '12px', display: 'flex', gap: '16px', marginBottom: '32px' }}>
                                <AlertCircle style={{ color: '#f59e0b' }} />
                                <div style={{ fontSize: '14px', color: '#f59e0b', lineHeight: '1.5' }}>
                                    Modifying advanced parameters can lead to system instability. Ensure you have a valid backup before committing changes.
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Concurrency Threshold (Worker Threads)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <input
                                        type="range"
                                        min="1"
                                        max="32"
                                        value={config.workerThreads}
                                        onChange={e => setConfig({ ...config, workerThreads: parseInt(e.target.value) })}
                                        style={{ flex: 1 }}
                                    />
                                    <span style={{ fontWeight: '700', fontFamily: 'JetBrains Mono' }}>{config.workerThreads} Core</span>
                                </div>
                            </div>

                            <button style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <RefreshCw size={18} />
                                CLEAN ENGINE CACHE
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .settings-grid {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 32px;
                    margin-top: 40px;
                }
                @media (max-width: 1024px) {
                    .settings-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                    .soc-title-section {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 16px;
                    }
                    .soc-header-btns {
                        width: 100%;
                    }
                    .soc-header-btns button {
                        width: 100%;
                        justify-content: center;
                    }
                }
                .settings-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 16px;
                    border-radius: 12px;
                    background: transparent;
                    border: 1px solid transparent;
                    color: #94a3b8;
                    cursor: pointer;
                    text-align: left;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .settings-nav-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                    color: #fff;
                }
                .settings-nav-item.active {
                    background: rgba(59, 130, 246, 0.08);
                    border-color: rgba(59, 130, 246, 0.2);
                    color: #3b82f6;
                }
                .nav-icon-box {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.03);
                    transition: all 0.3s;
                }
                .active .nav-icon-box {
                    background: rgba(59, 130, 246, 0.2);
                    color: #3b82f6;
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.1);
                }
                .active-glow {
                    position: absolute;
                    left: 0;
                    top: 20%;
                    height: 60%;
                    width: 3px;
                    background: #3b82f6;
                    border-radius: 0 4px 4px 0;
                    box-shadow: 0 0 10px #3b82f6;
                }
                .factory-reset-btn {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    padding: 10px;
                    border-radius: 10px;
                    width: 100%;
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .factory-reset-btn:hover {
                    background: #ef4444;
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                .input-group {
                    margin-bottom: 28px;
                    background: rgba(255,255,255,0.01);
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.03);
                }
                .input-group label {
                    display: block;
                    font-size: 11px;
                    font-weight: 800;
                    color: #475569;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                .settings-input {
                    width: 100%;
                    background: rgba(3, 7, 18, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 12px 18px;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.3s;
                    font-family: 'Inter', sans-serif;
                }
                .settings-input:focus {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.05);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                .toggle-group {
                    display: flex;
                    align-items: center;
                    padding: 24px;
                    background: rgba(255,255,255,0.01);
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.03);
                    margin-bottom: 16px;
                }
                .switch {
                    width: 48px;
                    height: 26px;
                    background: #1f2937;
                    border-radius: 100px;
                    position: relative;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .switch::after {
                    content: '';
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    width: 18px;
                    height: 18px;
                    background: #64748b;
                    border-radius: 50%;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .switch.active {
                    background: #3b82f6;
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
                }
                .switch.active::after {
                    left: 26px;
                    background: #fff;
                }
            `}</style>
        </div>
    );
}
