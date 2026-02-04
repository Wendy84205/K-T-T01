import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../utils/api';

export function DiscoverContent() {
    const [activeDiscoverTab, setActiveDiscoverTab] = useState('trending');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState([]);
    const [users, setUsers] = useState([]);

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.discoverPublicGroups(searchQuery);
            setGroups(data.groups || []);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.discoverSuggestedUsers();
            setUsers(data || []);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeDiscoverTab === 'trending' || activeDiscoverTab === 'groups') {
            fetchGroups();
        } else if (activeDiscoverTab === 'people') {
            fetchUsers();
        }
    }, [activeDiscoverTab, fetchGroups, fetchUsers]);

    const handleJoinGroup = async (groupId) => {
        try {
            await api.joinPublicGroup(groupId);
            alert('Successfully joined the group!');
            fetchGroups(); // Refresh list to update member status
        } catch (error) {
            alert(error.message || 'Failed to join group');
        }
    };

    const handleConnect = async (userId) => {
        try {
            await api.getOrCreateDirectConversation(userId);
            alert('Conversation created! Check your Messages tab.');
        } catch (error) {
            alert(error.message || 'Failed to connect');
        }
    };

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#0e1621',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '30px',
                borderBottom: '1px solid #2a3441',
                background: '#151f2e'
            }}>
                <h2 style={{
                    color: '#fff',
                    margin: '0 0 10px 0',
                    fontSize: '28px',
                    fontWeight: '800'
                }}>
                    Discover
                </h2>
                <p style={{ color: '#8b98a5', margin: 0, fontSize: '14px' }}>
                    Explore trending groups and connect with new people
                </p>

                {/* Search Bar */}
                <div style={{
                    marginTop: '20px',
                    position: 'relative',
                    background: '#1a2332',
                    borderRadius: '12px',
                    border: '1px solid #2a3441',
                    padding: '12px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Search size={20} color="#8b98a5" />
                    <input
                        type="text"
                        placeholder="Search groups, users, topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#fff',
                            width: '100%',
                            fontSize: '14px'
                        }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                padding: '20px 30px',
                borderBottom: '1px solid #2a3441',
                background: '#151f2e'
            }}>
                {['trending', 'groups', 'people'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveDiscoverTab(tab)}
                        style={{
                            background: activeDiscoverTab === tab ? '#667eea' : 'transparent',
                            border: activeDiscoverTab === tab ? 'none' : '1px solid #2a3441',
                            color: activeDiscoverTab === tab ? '#fff' : '#8b98a5',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '30px'
            }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                        <Loader2 size={40} className="animate-spin" color="#667eea" />
                    </div>
                ) : (
                    <>
                        {(activeDiscoverTab === 'trending' || activeDiscoverTab === 'groups') && (
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '20px', fontWeight: '700' }}>
                                    {activeDiscoverTab === 'trending' ? '🔥 Trending Groups' : '📁 All Public Groups'}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {groups.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#8b98a5', padding: '40px' }}>
                                            No groups found matching your criteria.
                                        </div>
                                    ) : (
                                        groups.map(group => (
                                            <div
                                                key={group.id}
                                                style={{
                                                    background: '#151f2e',
                                                    border: '1px solid #2a3441',
                                                    borderRadius: '16px',
                                                    padding: '20px',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#667eea';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#2a3441';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                                                    <div style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        borderRadius: '15px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '24px',
                                                        flexShrink: 0,
                                                        color: '#fff',
                                                        fontWeight: '700'
                                                    }}>
                                                        {group.name.charAt(0)}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                            <h4 style={{ color: '#fff', margin: 0, fontSize: '16px', fontWeight: '700' }}>
                                                                {group.name}
                                                            </h4>
                                                            {group.verified && (
                                                                <ShieldCheck size={16} color="#667eea" />
                                                            )}
                                                            {group.isMember && (
                                                                <span style={{ fontSize: '11px', background: '#10b98122', color: '#10b981', padding: '2px 6px', borderRadius: '4px' }}>Member</span>
                                                            )}
                                                        </div>
                                                        <p style={{ color: '#8b98a5', margin: '5px 0', fontSize: '13px' }}>
                                                            {group.description || 'No description available'}
                                                        </p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                                                            {group.category && (
                                                                <span style={{
                                                                    color: '#667eea',
                                                                    fontSize: '12px',
                                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                                    padding: '4px 10px',
                                                                    borderRadius: '6px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    {group.category}
                                                                </span>
                                                            )}
                                                            <span style={{ color: '#8b98a5', fontSize: '12px' }}>
                                                                <Users size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                                                {group.members || 0} members
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => group.isMember ? alert('You are already a member') : handleJoinGroup(group.id)}
                                                        style={{
                                                            background: group.isMember ? 'transparent' : '#667eea',
                                                            border: group.isMember ? '1px solid #2a3441' : 'none',
                                                            color: group.isMember ? '#8b98a5' : '#fff',
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            cursor: group.isMember ? 'default' : 'pointer',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { if (!group.isMember) e.target.style.background = '#5568d3'; }}
                                                        onMouseLeave={(e) => { if (!group.isMember) e.target.style.background = '#667eea'; }}
                                                    >
                                                        {group.isMember ? 'Joined' : 'Join'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {activeDiscoverTab === 'people' && (
                            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '20px', fontWeight: '700' }}>
                                    👥 Suggested Connections
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {users.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#8b98a5', padding: '40px' }}>
                                            No suggestions available at the moment.
                                        </div>
                                    ) : (
                                        users.map(user => (
                                            <div
                                                key={user.id}
                                                style={{
                                                    background: '#151f2e',
                                                    border: '1px solid #2a3441',
                                                    borderRadius: '12px',
                                                    padding: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '15px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#667eea'}
                                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a3441'}
                                            >
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    background: '#667eea',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    fontWeight: '700',
                                                    fontSize: '18px'
                                                }}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>
                                                            {user.name}
                                                        </span>
                                                        {user.verified && <ShieldCheck size={14} color="#667eea" />}
                                                    </div>
                                                    <div style={{ color: '#8b98a5', fontSize: '13px', marginTop: '2px' }}>
                                                        {user.username}
                                                    </div>
                                                    {user.mutualFriends > 0 && (
                                                        <div style={{ color: '#667eea', fontSize: '12px', marginTop: '4px' }}>
                                                            {user.mutualFriends} mutual groups
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleConnect(user.id)}
                                                    style={{
                                                        background: 'rgba(102, 126, 234, 0.1)',
                                                        border: '1px solid #667eea',
                                                        color: '#667eea',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    Connect
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeDiscoverTab === 'groups' && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#8b98a5',
                        maxWidth: '500px',
                        margin: '0 auto'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
                        <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '10px' }}>Browse All Groups</h3>
                        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                            Discover communities based on your interests. Use the search bar above to find specific topics.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export function MiniAppsContent() {
    const miniApps = [
        {
            id: 1,
            name: 'Polls & Surveys',
            icon: '📊',
            description: 'Create interactive polls for your groups',
            category: 'Productivity',
            color: '#667eea'
        },
        {
            id: 2,
            name: 'Sticker Store',
            icon: '😊',
            description: 'Browse and download sticker packs',
            category: 'Entertainment',
            color: '#f59e0b'
        },
        {
            id: 3,
            name: 'File Converter',
            icon: '🔄',
            description: 'Convert files between different formats',
            category: 'Tools',
            color: '#10b981'
        },
        {
            id: 4,
            name: 'Voice Notes',
            icon: '🎤',
            description: 'Record and share voice messages',
            category: 'Communication',
            color: '#ef4444'
        },
        {
            id: 5,
            name: 'QR Scanner',
            icon: '📱',
            description: 'Scan QR codes to connect quickly',
            category: 'Tools',
            color: '#8b5cf6'
        },
        {
            id: 6,
            name: 'Translator',
            icon: '🌐',
            description: 'Translate messages in real-time',
            category: 'Tools',
            color: '#06b6d4'
        },
    ];

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#0e1621',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '30px',
                borderBottom: '1px solid #2a3441',
                background: '#151f2e'
            }}>
                <h2 style={{
                    color: '#fff',
                    margin: '0 0 10px 0',
                    fontSize: '28px',
                    fontWeight: '800'
                }}>
                    Mini Apps
                </h2>
                <p style={{ color: '#8b98a5', margin: 0, fontSize: '14px' }}>
                    Enhance your messaging experience with powerful utilities
                </p>
            </div>

            {/* Apps Grid */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '30px'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {miniApps.map(app => (
                        <div
                            key={app.id}
                            style={{
                                background: '#151f2e',
                                border: '1px solid #2a3441',
                                borderRadius: '16px',
                                padding: '24px',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = app.color;
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = `0 8px 20px ${app.color}33`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#2a3441';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Background gradient */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100px',
                                height: '100px',
                                background: `radial-gradient(circle, ${app.color}22 0%, transparent 70%)`,
                                pointerEvents: 'none'
                            }} />

                            <div style={{
                                width: '60px',
                                height: '60px',
                                background: `${app.color}22`,
                                borderRadius: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '32px',
                                marginBottom: '15px'
                            }}>
                                {app.icon}
                            </div>

                            <h3 style={{
                                color: '#fff',
                                margin: '0 0 8px 0',
                                fontSize: '18px',
                                fontWeight: '700'
                            }}>
                                {app.name}
                            </h3>

                            <p style={{
                                color: '#8b98a5',
                                margin: '0 0 15px 0',
                                fontSize: '13px',
                                lineHeight: '1.5'
                            }}>
                                {app.description}
                            </p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginTop: '15px'
                            }}>
                                <span style={{
                                    color: app.color,
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    background: `${app.color}22`,
                                    padding: '4px 10px',
                                    borderRadius: '6px'
                                }}>
                                    {app.category}
                                </span>

                                <button
                                    style={{
                                        background: app.color,
                                        border: 'none',
                                        color: '#fff',
                                        padding: '6px 14px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        alert(`Opening ${app.name}...`);
                                    }}
                                >
                                    Open
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coming Soon Section */}
                <div style={{
                    marginTop: '40px',
                    padding: '30px',
                    background: '#151f2e',
                    border: '1px solid #2a3441',
                    borderRadius: '16px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '40px auto 0'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚀</div>
                    <h3 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '20px', fontWeight: '700' }}>
                        More Apps Coming Soon
                    </h3>
                    <p style={{ color: '#8b98a5', margin: 0, fontSize: '14px' }}>
                        We're constantly adding new mini apps to enhance your experience. Stay tuned!
                    </p>
                </div>
            </div>
        </div>
    );
}
