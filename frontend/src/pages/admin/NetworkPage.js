import React, { useState, useEffect, useCallback } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    Activity, Shield, Globe, Zap, ArrowUp, ArrowDown,
    Search, RefreshCw, AlertTriangle
} from 'lucide-react';
import api from '../../utils/api';

export default function NetworkPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [isLive, setIsLive] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const data = await api.getNetworkTraffic();
            setData(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching network data:', error);
        }
    }, []);

    const handleBlockIP = async (ip) => {
        if (!window.confirm(`Are you sure you want to block IP ${ip}? This will terminate all active sessions.`)) return;
        try {
            await api.blockIP({ ipAddress: ip, reason: 'Manual block from Network Traffic analysis', durationHours: 24 });
            alert(`IP ${ip} has been successfully blacklisted.`);
            fetchData();
        } catch (error) {
            console.error('Error blocking IP:', error);
            alert('Failed to block IP. Please check console for details.');
        }
    };

    useEffect(() => {
        fetchData();
        let interval;
        if (isLive) {
            interval = setInterval(fetchData, 3000); // Update every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isLive, fetchData]);

    const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#030712', color: '#8b949e' }}>
                <RefreshCw className="animate-spin" size={48} style={{ marginBottom: '16px', color: '#3b82f6' }} />
                <div style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '2px' }}>INITIALIZING NETWORK ANALYTICS...</div>
            </div>
        );
    }

    const connections = data?.connections || [];
    const metrics = data?.metrics || {
        totalBandwidth: 0,
        activeConnections: 0,
        packetsPerSecond: 0,
        threatBlocks: 0,
        protocolDistribution: [],
        historicalData: []
    };

    const filteredConnections = connections.filter(c => {
        const matchesFilter = filter === 'All' || c.protocol === filter;
        const sIp = (c.sourceIp || '').toString();
        const dIp = (c.destinationIp || '').toString();
        const matchesSearch = sIp.includes(searchQuery) || dIp.includes(searchQuery);
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="soc-dashboard" style={{ padding: '24px', background: '#030712' }}>
            {/* Header Section */}
            <div className="soc-title-section">
                <div className="soc-title-left">
                    <h1 style={{ color: '#fff' }}>
                        <Activity className="text-blue-500" />
                        Network Traffic Sentinel
                    </h1>
                    <div className="card-desc">Real-time packet analysis & deep session inspection</div>
                </div>
                <div className="soc-header-btns">
                    <button
                        className={`time-filter-btn ${isLive ? 'active' : ''}`}
                        onClick={() => setIsLive(!isLive)}
                        style={{
                            padding: '8px 16px',
                            background: isLive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${isLive ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '8px',
                            color: isLive ? '#3b82f6' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <div className={`soc-dot ${isLive ? 'animate-pulse' : ''}`} style={{ width: '8px', height: '8px', background: isLive ? '#3b82f6' : '#94a3b8' }} />
                        {isLive ? 'LIVE CAPTURE' : 'PAUSED'}
                    </button>
                </div>
            </div>

            {/* Hero Metrics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-main">
                        <div>
                            <div className="stat-label">Throughput</div>
                            <div className="stat-value">{metrics.totalBandwidth} <span style={{ fontSize: '14px', color: '#94a3b8' }}>Mbps</span></div>
                        </div>
                        <Zap style={{ color: '#3b82f6', opacity: 0.5 }} size={32} />
                    </div>
                    <div className="stat-progress">
                        <div className="stat-progress-fill" style={{ width: '65%', background: '#3b82f6' }} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-main">
                        <div>
                            <div className="stat-label">Packet Flow</div>
                            <div className="stat-value">{metrics.packetsPerSecond.toLocaleString()} <span style={{ fontSize: '14px', color: '#94a3b8' }}>pps</span></div>
                        </div>
                        <Activity style={{ color: '#10b981', opacity: 0.5 }} size={32} />
                    </div>
                    <div className="stat-progress">
                        <div className="stat-progress-fill" style={{ width: '42%', background: '#10b981' }} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-main">
                        <div>
                            <div className="stat-label">Active Sessions</div>
                            <div className="stat-value">{metrics.activeConnections}</div>
                        </div>
                        <Globe style={{ color: '#8b5cf6', opacity: 0.5 }} size={32} />
                    </div>
                    <div className="stat-progress">
                        <div className="stat-progress-fill" style={{ width: '78%', background: '#8b5cf6' }} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-main">
                        <div>
                            <div className="stat-label">Threat Blocks</div>
                            <div className="stat-value">{metrics.threatBlocks}</div>
                        </div>
                        <Shield style={{ color: '#ef4444', opacity: 0.5 }} size={32} />
                    </div>
                    <div className="stat-progress">
                        <div className="stat-progress-fill" style={{ width: '12%', background: '#ef4444' }} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-row">
                <div className="content-card">
                    <div className="card-header-flex">
                        <div>
                            <div className="card-title">Bandwidth Utilization</div>
                            <div className="card-desc">Historical data transmission patterns</div>
                        </div>
                        <div className="time-filter-btns">
                            <button className="active">1H</button>
                            <button>6H</button>
                            <button>24H</button>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics.historicalData}>
                                <defs>
                                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} />
                                <Tooltip
                                    contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="sent" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSent)" />
                                <Area type="monotone" dataKey="received" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="content-card">
                    <div className="card-title">Protocol Distribution</div>
                    <div className="card-desc">Real-time layer-4 traffic breakdown</div>
                    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics.protocolDistribution || []}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationDuration={1000}
                                >
                                    {(metrics.protocolDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>{metrics.activeConnections}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Sockets</div>
                        </div>
                    </div>
                    {/* Dynamic Legend */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px', justifyContent: 'center' }}>
                        {(metrics.protocolDistribution || []).map((entry, index) => (
                            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{entry.name} ({entry.value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Connection Table */}
            <div className="content-card" style={{ marginTop: '24px', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative background element */}
                <div style={{
                    position: 'absolute', top: '-100px', right: '-100px',
                    width: '300px', height: '300px',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                    zIndex: 0, pointerEvents: 'none'
                }} />

                <div className="table-header" style={{ position: 'relative', zIndex: 1 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="card-title">Live Active Connections</div>
                            <span style={{
                                padding: '2px 8px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                borderRadius: '100px',
                                fontSize: '10px',
                                fontWeight: '800',
                                letterSpacing: '0.5px'
                            }}>STABLE</span>
                        </div>
                        <div className="card-desc">Detailed session audit through /proc/net interface</div>
                    </div>
                    <div className="soc-header-btns">
                        <div className="search-container-mobile" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search
                                size={16}
                                style={{
                                    position: 'absolute',
                                    left: '14px',
                                    color: '#64748b',
                                    zIndex: 2
                                }}
                            />
                            <input
                                type="text"
                                className="search-input-modern"
                                placeholder="Scan by IP address..."
                                style={{
                                    borderRadius: '12px',
                                    paddingLeft: '40px',
                                    height: '40px',
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                background: '#111827',
                                color: '#fff',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '0 16px',
                                fontSize: '13px',
                                fontWeight: '600'
                            }}
                        >
                            <option>All</option>
                            <option>TCP</option>
                            <option>UDP</option>
                        </select>
                    </div>
                </div>

                <div className="audit-table-container" style={{ position: 'relative', zIndex: 1, marginTop: '20px' }}>
                    <table className="audit-table">
                        <thead>
                            <tr>
                                <th>SOURCE PERSPECTIVE</th>
                                <th>DESTINATION NODE</th>
                                <th>PROTOCOL</th>
                                <th>STATUS</th>
                                <th>THROUGHPUT</th>
                                <th>RISK ANALYTICS</th>
                                <th style={{ textAlign: 'center' }}>INTERVENTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredConnections.length > 0 ? filteredConnections.slice(0, 50).map((conn) => (
                                <tr key={conn.id} style={{ transition: 'background 0.2s' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Zap size={14} style={{ color: '#3b82f6' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '700', color: '#fff', letterSpacing: '0.5px' }}>{conn.sourceIp}</span>
                                                <span style={{ fontSize: '10px', color: '#64748b' }}>PORT: {conn.sourcePort}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '700', color: '#e2e8f0' }}>{conn.destinationIp}</span>
                                            <span style={{ fontSize: '10px', color: '#64748b' }}>PORT: {conn.destinationPort}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: conn.protocol === 'TCP' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                            color: conn.protocol === 'TCP' ? '#3b82f6' : '#8b5cf6',
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            fontWeight: '800'
                                        }}>
                                            {conn.protocol}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: conn.status === 'ESTABLISHED' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                                            color: conn.status === 'ESTABLISHED' ? '#10b981' : '#94a3b8',
                                            border: `1px solid ${conn.status === 'ESTABLISHED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                                            borderRadius: '6px',
                                            fontSize: '10px',
                                            fontWeight: '700'
                                        }}>
                                            {conn.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
                                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}><ArrowUp size={10} /> {conn.dataSent}B</span>
                                            <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '3px' }}><ArrowDown size={10} /> {conn.dataReceived}B</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: conn.threatLevel === 'HIGH' ? '#ef4444' : '#10b981',
                                            fontSize: '11px',
                                            fontWeight: '700'
                                        }}>
                                            {conn.threatLevel === 'HIGH' ? <AlertTriangle size={14} /> : <Shield size={14} />}
                                            {conn.threatLevel}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleBlockIP(conn.sourceIp)}
                                            className="block-btn-modern"
                                        >
                                            TERMINATE
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                        <Activity size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
                                        <div>No matching network signals detected.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .block-btn-modern {
                    background: rgba(239, 68, 68, 0.05);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    padding: 6px 14px;
                    border-radius: 8px;
                    font-size: 10px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                    letter-spacing: 0.5px;
                }
                .block-btn-modern:hover {
                    background: #ef4444;
                    color: #fff;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                .search-input-modern {
                    outline: none;
                    color: #fff;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .search-input-modern:focus {
                    border-color: #3b82f6 !important;
                    background: rgba(59, 130, 246, 0.08) !important;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
                }
                .search-input-modern::placeholder {
                    color: #475569;
                }
                .audit-table tr:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
