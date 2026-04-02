import React, { useState, useEffect } from 'react';
import {
    Shield, Plus, Search, Filter, Trash2, Edit3,
    Lock, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';

export default function SecurityRulesPage() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    const [showModal, setShowModal] = useState(false);
    const [newRule, setNewRule] = useState({ name: '', policyType: 'FIREWALL', value: 'BLOCK', severity: 'MEDIUM', description: '' });

    const fetchRules = async () => {
        try {
            setLoading(true);
            const data = await api.getSecurityPolicies();
            setRules(data || []);
        } catch (err) {
            console.error('Failed to fetch security rules:', err || 'Check logs');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRule = async (id, currentStatus) => {
        try {
            await api.toggleSecurityPolicy(id, !currentStatus);
            setRules(rules.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDeleteRule = async (id) => {
        if (window.confirm('Delete this security rule permanentely?')) {
            try {
                await api.deleteSecurityPolicy(id);
                setRules(rules.filter(r => r.id !== id));
            } catch (err) {
                alert('Deletion failed');
            }
        }
    };

    const handleAddRule = async (e) => {
        e.preventDefault();
        try {
            // Mapping UI to backend entity
            const ruleToSave = {
                ...newRule,
                isActive: true,
                config: { value: newRule.value, severity: newRule.severity }
            };
            const saved = await api.createSecurityPolicy(ruleToSave);
            setRules([saved, ...rules]);
            setShowModal(false);
            setNewRule({ name: '', policyType: 'FIREWALL', value: 'BLOCK', severity: 'MEDIUM', description: '' });
        } catch (err) {
            alert('Failed to deploy new rule');
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const filteredRules = rules.filter(rule => {
        const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rule.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' || 
            (activeTab === 'Active' && rule.isActive) || 
            (activeTab === 'Inactive' && !rule.isActive);
        return matchesSearch && matchesTab;
    });

    const getSeverityColor = (sev) => {
        switch (sev) {
            case 'CRITICAL': return 'var(--red-color)';
            case 'HIGH': return 'var(--accent-amber)';
            case 'MEDIUM': return 'var(--primary)';
            case 'LOW': return 'var(--green-color)';
            default: return 'var(--text-muted)';
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
                <div className="soc-dot-pulse" style={{ marginBottom: '20px' }}></div>
                <div style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: '12px', letterSpacing: '2px' }}>CALIBRATING DEFENSE SYSTEMS...</div>
            </div>
        );
    }

    return (
        <div className="soc-dashboard" style={{ padding: '32px', background: 'var(--bg-app)' }}>
            <div className="soc-title-section">
                <div className="soc-title-left">
                    <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '800' }}>
                        <Shield className="text-blue-500" style={{ marginRight: '12px' }} />
                        Traffic & Access Rules
                    </h1>
                    <div className="card-desc">Define intrusion detection patterns and automatic response policies</div>
                </div>
                <div className="soc-header-btns">
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            background: 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        <Plus size={18} />
                        CREATE NEW RULE
                    </button>
                </div>
            </div>

            <div className="content-card" style={{ marginTop: '30px' }}>
                <div className="soc-filter-row" style={{ marginBottom: '24px' }}>
                    <div className="time-filter-btns">
                        <button className={activeTab === 'All' ? 'active' : ''} onClick={() => setActiveTab('All')}>All Rules</button>
                        <button className={activeTab === 'Active' ? 'active' : ''} onClick={() => setActiveTab('Active')}>Active</button>
                        <button className={activeTab === 'Inactive' ? 'active' : ''} onClick={() => setActiveTab('Inactive')}>Disabled</button>
                    </div>

                    <div className="search-container-mobile" style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '300px' }}>
                        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                            <Search
                                size={16}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    color: 'var(--text-muted)',
                                    zIndex: 2
                                }}
                            />
                            <input
                                type="text"
                                className="search-input-modern"
                                placeholder="Find rule by ID or name..."
                                style={{
                                    borderRadius: '12px',
                                    paddingLeft: '40px',
                                    height: '42px',
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="filter-btn-modern">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="rules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {filteredRules.map(rule => (
                        <div key={rule.id} className="stat-card" style={{ height: 'auto', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                            {/* Severity Side Bar */}
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: getSeverityColor(rule.severity) }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>{rule.id}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{
                                        fontSize: '9px',
                                        fontWeight: '900',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: `${getSeverityColor(rule.config?.severity || rule.severity)}20`,
                                        color: getSeverityColor(rule.config?.severity || rule.severity),
                                        border: `1px solid ${getSeverityColor(rule.config?.severity || rule.severity)}40`
                                    }}>
                                        {rule.config?.severity || rule.severity}
                                    </span>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: rule.isActive ? 'var(--green-color)' : 'var(--text-muted)', alignSelf: 'center', boxShadow: rule.isActive ? '0 0 10px var(--green-color)' : 'none' }}></div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>{rule.name}</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '20px' }}>
                                {rule.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px', marginBottom: '20px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>ACTION:</div>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: (rule.config?.value === 'BLOCK' || rule.value === 'BLOCK') ? 'var(--red-color)' : '#fff', fontFamily: 'JetBrains Mono' }}>{rule.config?.value || rule.value}</div>
                                <div style={{ marginLeft: 'auto', opacity: 0.3 }}><Lock size={14} /></div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="icon-btn" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}><Edit3 size={16} /></button>
                                    <button
                                        className="icon-btn"
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red-color)' }}
                                        onClick={() => handleDeleteRule(rule.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleToggleRule(rule.id, rule.isActive)}
                                    style={{
                                        background: rule.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: rule.isActive ? 'var(--red-color)' : 'var(--green-color)',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {rule.isActive ? 'DISABLE RULE' : 'ENABLE RULE'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredRules.length === 0 && (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                        <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                        <div style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>No rules found matching your selection.</div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
                <div className="content-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px', background: 'linear-gradient(90deg, #1e1b4b 0%, var(--bg-panel) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield className="text-blue-400" size={30} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '16px' }}>Safe Mode Active</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>All inbound traffic is being filtered through the global firewall.</div>
                    </div>
                    <button style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>VIEW POLICY</button>
                </div>
            </div>

            {/* Modal for adding new rule */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: 'var(--bg-panel)',
                        padding: '32px',
                        borderRadius: '20px',
                        width: '500px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h2 style={{ marginBottom: '24px', color: '#fff' }}>Deploy New Security Rule</h2>
                        <form onSubmit={handleAddRule}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>RULE NAME</label>
                                <input
                                    type="text"
                                    required
                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }}
                                    value={newRule.name}
                                    onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>RULE TYPE</label>
                                <select
                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }}
                                    value={newRule.policyType}
                                    onChange={e => setNewRule({ ...newRule, policyType: e.target.value })}
                                >
                                    <option>FIREWALL</option>
                                    <option>WAF</option>
                                    <option>RATE_LIMIT</option>
                                    <option>ACCESS</option>
                                    <option>DLP</option>
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>SEVERITY</label>
                                    <select
                                        style={{ width: '100%', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }}
                                        value={newRule.severity}
                                        onChange={e => setNewRule({ ...newRule, severity: e.target.value })}
                                    >
                                        <option>LOW</option>
                                        <option>MEDIUM</option>
                                        <option>HIGH</option>
                                        <option>CRITICAL</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>ACTION</label>
                                    <select
                                        style={{ width: '100%', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }}
                                        value={newRule.value}
                                        onChange={e => setNewRule({ ...newRule, value: e.target.value })}
                                    >
                                        <option>BLOCK</option>
                                        <option>ALLOW</option>
                                        <option>MFA_REQUIRED</option>
                                        <option>QUARANTINE</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>DESCRIPTION</label>
                                <textarea
                                    rows="3"
                                    style={{ width: '100%', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px' }}
                                    value={newRule.description}
                                    onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '10px', cursor: 'pointer' }}
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    DEPLOY RULE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                .icon-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .icon-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }
                .search-input-modern {
                    outline: none;
                    color: #fff;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .search-input-modern:focus {
                    border-color: var(--primary) !important;
                    background: rgba(59, 130, 246, 0.08) !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
                }
                .search-input-modern::placeholder {
                    color: #475569;
                }
                .filter-btn-modern {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-btn-modern:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: rgba(255,255,255,0.2);
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
