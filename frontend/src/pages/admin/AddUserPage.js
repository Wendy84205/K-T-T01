// src/pages/admin/AddUserPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function AddUserPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        employeeId: '',
        jobTitle: '',
        department: 'IT',
        securityClearanceLevel: 1,
        role: 'User',
        status: 'active',
        mfaRequired: true,
        isActive: true,
        avatarUrl: '',
        totpSecret: ''
    });
    const [error, setError] = useState(null);

    const generateEmployeeId = (department) => {
        const prefixMap = {
            'IT': 'IT',
            'SECURITY': 'SEC',
            'HR': 'HR',
            'FINANCE': 'FIN',
            'OPERATIONS': 'OPS',
            'SALES': 'SAL'
        };
        const prefix = prefixMap[department] || 'EMP';
        const randomNum = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
        return `${prefix}-${randomNum}`;
    };

    useEffect(() => {
        // Auto-generate employeeId when department changes
        setFormData(prev => ({
            ...prev,
            employeeId: generateEmployeeId(prev.department)
        }));
    }, [formData.department]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value)
        }));
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
                setFormData(prev => ({ ...prev, avatarUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                roles: [formData.role]
            };

            await api.addUser(payload);
            navigate('/admin/users');
        } catch (err) {
            setError(err.message || 'Failed to initialize new user identity.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="soc-dashboard" style={{ background: '#0d1117', minHeight: '100vh', color: '#c9d1d9', padding: '40px' }}>
            {loading && (
                <div className="soc-action-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="soc-dot-pulse"></div>
                </div>
            )}

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <button
                        onClick={() => navigate('/admin/users')}
                        style={{ background: 'transparent', border: '1px solid #30363d', color: '#8b949e', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <i className='bx bx-chevron-left' style={{ fontSize: '24px' }}></i>
                    </button>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#fff' }}>Initialize New Sentinel Identity</h1>
                        <p style={{ color: '#8b949e', margin: '4px 0 0 0', fontSize: '14px' }}>Provision new access credentials and security clearance levels.</p>
                    </div>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <i className='bx bx-error-circle' style={{ fontSize: '20px' }}></i>
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '16px', padding: '32px' }}>

                    {/* AVATAR SELECTOR */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #30363d' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: '#0d1117', border: '2px dashed #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                            {formData.avatarUrl ? (
                                <img src={formData.avatarUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <i className='bx bx-camera-movie' style={{ fontSize: '32px', color: '#484f58' }}></i>
                            )}
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#fff' }}>Sentinel Identity Image</h4>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <label style={{ background: '#238636', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                                    Upload Image
                                    <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                                </label>
                                {formData.avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                                        style={{ background: 'transparent', border: '1px solid #30363d', color: '#ef4444', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                                    >Remove</button>
                                )}
                            </div>
                            <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#8b949e' }}>Recommended: Square PNG/JPG, max 2MB.</p>
                        </div>
                    </div>

                    {/* CORE IDENTITY */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#2f81f7', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className='bx bx-id-card'></i> Core Identity
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>Username</label>
                                <input
                                    name="username"
                                    type="text"
                                    required
                                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                                    placeholder="e.g. jsmith_sec"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                                    placeholder="jsmith@cybersecure.local"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>First Name</label>
                                <input
                                    name="firstName"
                                    type="text"
                                    required
                                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>Last Name</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                                    placeholder="Smith"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* PROFESSIONAL DETAILS */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#2f81f7', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className='bx bx-briefcase'></i> Professional Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>Employee ID (Auto-Generated)</label>
                                <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        name="employeeId"
                                        type="text"
                                        readOnly
                                        style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', color: '#58a6ff', padding: '12px 16px', borderRadius: '8px', outline: 'none', cursor: 'not-allowed', fontFamily: 'monospace' }}
                                        value={formData.employeeId}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, employeeId: generateEmployeeId(prev.department) }))}
                                        style={{ background: '#238636', border: 'none', color: '#fff', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        title="Regenerate Employee ID"
                                    >
                                        <i className='bx bx-refresh' style={{ fontSize: '18px' }}></i>
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>Job Title</label>
                                <input
                                    name="jobTitle"
                                    type="text"
                                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                                    placeholder="Security Analyst"
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>Department</label>
                                <select
                                    name="department"
                                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                                    value={formData.department}
                                    onChange={handleChange}
                                >
                                    <option value="IT">Information Technology</option>
                                    <option value="SECURITY">Cyber Security</option>
                                    <option value="HR">Human Resources</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="OPERATIONS">Operations</option>
                                    <option value="SALES">Sales</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>Phone Number</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECURITY PROTOCOL */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#2f81f7', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className='bx bx-shield-quarter'></i> Security Protocol
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>System Role</label>
                                <select
                                    name="role"
                                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="Admin">Admin (Full System Access)</option>
                                    <option value="Manager">Manager (Department Access)</option>
                                    <option value="User">User (Standard Access)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>Clearance Level</label>
                                <select
                                    name="securityClearanceLevel"
                                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                                    value={formData.securityClearanceLevel}
                                    onChange={handleChange}
                                >
                                    <option value={1}>Level 1 - Public</option>
                                    <option value={2}>Level 2 - Internal</option>
                                    <option value={3}>Level 3 - Confidential</option>
                                    <option value={4}>Level 4 - Secret</option>
                                    <option value={5}>Level 5 - Top Secret</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#8b949e', marginBottom: '8px' }}>Temporary Password</label>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                                    placeholder="Minimum 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div style={{ background: '#0d1117', padding: '20px', borderRadius: '12px', border: '1px solid #30363d' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#f0f6fc' }}>Multi-Factor Authentication</div>
                                    <div style={{ fontSize: '12px', color: '#8b949e' }}>Require 2FA setup on first login attempt.</div>
                                </div>
                                <label className="soc-switch">
                                    <input
                                        type="checkbox"
                                        name="mfaRequired"
                                        checked={formData.mfaRequired}
                                        onChange={handleChange}
                                    />
                                    <span className="soc-slider"></span>
                                </label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#f0f6fc' }}>Immediate Activation</div>
                                    <div style={{ fontSize: '12px', color: '#8b949e' }}>Account will be usable immediately without approval.</div>
                                </div>
                                <label className="soc-switch">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />
                                    <span className="soc-slider"></span>
                                </label>
                            </div>

                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#f0f6fc' }}>Authenticator Secret (2FA)</div>
                                    <div style={{ fontSize: '12px', color: '#8b949e' }}>Manual secret for TOTP authenticator apps.</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input
                                        name="totpSecret"
                                        type="text"
                                        style={{ background: '#161b22', border: '1px solid #30363d', color: '#58a6ff', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', width: '220px', fontFamily: 'monospace' }}
                                        placeholder="Secret Key..."
                                        value={formData.totpSecret}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
                                            let secret = '';
                                            for (let i = 0; i < 32; i++) secret += chars.charAt(Math.floor(Math.random() * chars.length));
                                            setFormData(prev => ({ ...prev, totpSecret: secret }));
                                        }}
                                        style={{ background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        <i className='bx bx-refresh'></i> Generate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT */}
                    <div style={{ display: 'flex', gap: '16px', paddingTop: '16px', borderTop: '1px solid #30363d' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/users')}
                            style={{ flex: 1, background: 'transparent', border: '1px solid #30363d', color: '#c9d1d9', padding: '14px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{ flex: 2, background: '#238636', border: 'none', color: '#fff', padding: '14px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <i className='bx bx-user-plus'></i> Provision User Identity
                        </button>
                    </div>
                </form>

                <p style={{ textAlign: 'center', color: '#8b949e', fontSize: '11px', marginTop: '24px' }}>
                    By provisioning this identity, you confirm that the user has undergone the necessary background security checks and authorized access protocols.
                </p>
            </div>

            <style>{`
                .soc-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 24px;
                }
                .soc-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .soc-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #30363d;
                    transition: .4s;
                    border-radius: 24px;
                }
                .soc-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: #f0f6fc;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .soc-slider {
                    background-color: #238636;
                }
                input:checked + .soc-slider:before {
                    transform: translateX(26px);
                }
                .form-group input::placeholder {
                    color: #484f58;
                    font-size: 13px;
                }
            `}</style>
        </div>
    );
}
