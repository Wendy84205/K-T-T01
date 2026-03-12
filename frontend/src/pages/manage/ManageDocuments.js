import React, { useState, useEffect } from 'react';
import { 
    FileText, Search, Shield, Clock, Download, 
    Upload, Trash2, RefreshCw, AlertCircle, File
} from 'lucide-react';
import api from '../../utils/api';

export default function ManageDocuments() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');

    const loadFiles = async () => {
        try {
            setLoading(true);
            const data = await api.getFiles();
            setFiles(data || []);
        } catch (err) {
            console.error('Failed to load files:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadFiles(); }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            await api.uploadFile(file);
            loadFiles();
        } catch (err) {
            alert('Security breach during upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (file) => {
        try {
            await api.downloadFile(file.id, file.filename);
        } catch (err) {
            alert('Extraction failed: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Confirm permanent deletion of this asset?')) return;
        try {
            await api.deleteFile(id);
            loadFiles();
        } catch (err) {
            alert('Decommission failed: ' + err.message);
        }
    };

    const filtered = files.filter(f => 
        f.filename?.toLowerCase().includes(search.toLowerCase()) ||
        f.owner?.username?.toLowerCase().includes(search.toLowerCase())
    );

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div style={{ padding: '32px', overflowY: 'auto', height: '100%', background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', shadow: 'var(--shadow-primary)' }}>
                            <FileText size={20} color="#fff" />
                        </div>
                        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Intelligence Vault</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em' }}>Centralized Documentation Ledger</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ 
                        background: 'var(--bg-panel)', border: '1px solid var(--border-color)', 
                        borderRadius: '14px', padding: '0 16px', display: 'flex', 
                        alignItems: 'center', gap: '10px', width: '300px', height: '48px'
                    }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search encrypted records..."
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '13px', fontWeight: '600' }}
                        />
                    </div>
                    <label style={{ 
                        background: 'var(--primary)', color: '#fff', 
                        borderRadius: '14px', padding: '0 24px', fontSize: '12px', 
                        fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', 
                        cursor: 'pointer', shadow: 'var(--shadow-primary)', textTransform: 'uppercase',
                        height: '48px', opacity: uploading ? 0.7 : 1
                    }}>
                        {uploading ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
                        {uploading ? 'Processing...' : 'Upload Asset'}
                        <input type="file" onChange={handleUpload} hidden disabled={uploading} />
                    </label>
                </div>
            </div>

            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '0', overflow: 'hidden', shadow: 'var(--shadow)' }}>
                {loading ? (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                        <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <p className="font-black text-[10px] uppercase tracking-[0.2em]">Decrypting Vault Contents...</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-light)' }}>
                                {['Designation', 'Access Level', 'Modified', 'Custodian', 'Actions'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.1em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((file) => (
                                <tr key={file.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-app)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', background: 'var(--bg-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                {file.mimetype?.includes('pdf') ? <FileText size={18} /> : <File size={18} />}
                                            </div>
                                            <div>
                                                <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '800', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.filename}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700' }}>{formatSize(file.size)} • {file.mimetype?.split('/')[1]?.toUpperCase()} Asset</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>Level {file.securityLevel || 3}</span>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700' }}>
                                            <Clock size={14} /> {new Date(file.updatedAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '700' }}>{file.owner?.firstName || 'System'}</div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleDownload(file)} style={{ background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                                <Download size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(file.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#ef4444' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && filtered.length === 0 && (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                        <AlertCircle size={32} style={{ margin: '0 auto 16px', opacity: 0.1 }} />
                        <p className="font-black text-[10px] uppercase tracking-[0.2em] text-muted">No Assets Discovered</p>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '32px', padding: '32px', background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)', borderRadius: '24px', color: '#fff', position: 'relative', overflow: 'hidden', shadow: 'var(--shadow-primary)' }}>
                <Shield size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }} />
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase' }}>Encryption Active</h3>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', maxWidth: '500px', fontWeight: '500', lineHeight: '1.6' }}>All assets in the Intelligence Vault are secured with E2EE. Unauthorized extraction attempts will trigger immediate station lockdown.</p>
            </div>
        </div>
    );
}
