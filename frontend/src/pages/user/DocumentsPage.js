import React, { useEffect, useState } from 'react';
import { 
  File, 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  MoreVertical, 
  Plus, 
  Shield, 
  History,
  HardDrive,
  Filter
} from 'lucide-react';
import api from '../../utils/api';

export default function DocumentsPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFiles = async () => {
    try {
      const data = await api.getFiles();
      setFiles(data || []);
    } catch (e) {
      console.error('Failed to load drive:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e) => {
    const uploadedFiles = e.target.files || e.dataTransfer.files;
    if (!uploadedFiles[0]) return;

    try {
      setLoading(true);
      await api.uploadFile(uploadedFiles[0]);
      await fetchFiles();
    } catch (err) {
      alert('Upload failed: ' + err.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this document?')) return;
    try {
      await api.deleteFile(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      alert('Deletion failed');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => 
    f.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-black tracking-widest text-[9px] uppercase opacity-50">Synchronizing Vault...</span>
      </div>
    );
  }

  return (
    <div
      className="space-y-8 animate-in slide-in-from-bottom-4 duration-500"
      style={{ position: 'relative' }}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragActive(false); }}
      onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e); }}
    >
      {/* Full-page drag overlay */}
      {dragActive && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(102,126,234,0.12)',
          border: '3px dashed var(--primary)', borderRadius: '24px',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)', pointerEvents: 'none'
        }}>
          <div style={{ textAlign: 'center', color: 'var(--primary)' }}>
            <Upload size={48} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Drop to Upload & Encrypt</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Team Documents</h1>
          <p className="text-[var(--text-muted)] text-sm font-medium mt-1">E2EE storage for mission-critical assets.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search secure assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] focus:border-[var(--primary)] transition-all w-64 shadow-sm"
            />
          </div>
          <label className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:shadow-[0_8px_20px_rgba(0,123,255,0.4)] transition-all active:scale-95 shadow-md">
            <Plus size={16} />
            New Upload
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-xl">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-[var(--border-color)] bg-[var(--bg-light)]/50 backdrop-blur-sm">
          <div className="col-span-6 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Document Name</div>
          <div className="col-span-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hidden md:block">Size</div>
          <div className="col-span-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hidden md:block">Owner</div>
          <div className="col-span-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</div>
        </div>

        {/* File List */}
        <div className="divide-y divide-[var(--border-color)] min-h-[400px]">
          {filteredFiles.length > 0 ? filteredFiles.map((file) => (
            <div key={file.id} className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-[var(--bg-light)] transition-colors group">
              <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[var(--bg-light)] group-hover:bg-[var(--bg-primary-soft)] transition-colors text-[var(--text-muted)] group-hover:text-[var(--primary)]">
                  <File size={22} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[var(--text-main)] text-sm truncate uppercase tracking-tight" title={file.originalName}>
                    {file.originalName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
                      <Shield size={10} /> 
                      AES-256
                    </span>
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">•</span>
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2 hidden md:block">
                <span className="text-xs font-bold text-[var(--text-muted)]">
                  {formatSize(file.size || 0)}
                </span>
              </div>

              <div className="col-span-2 hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--bg-light)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-black uppercase">
                    {file.user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-tighter">
                    {file.user?.firstName || 'User'}
                  </span>
                </div>
              </div>

              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2 pr-2">
                <button 
                  onClick={() => api.downloadFile(file.id, file.originalName)}
                  className="p-2.5 rounded-xl hover:bg-[var(--primary-light)] text-[var(--text-muted)] hover:text-[var(--primary)] transition-all"
                  title="Secure Download"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(file.id)}
                  className="p-2.5 rounded-xl hover:bg-red-50 text-[var(--text-muted)] hover:text-[var(--red-color)] transition-all"
                  title="Purge"
                >
                  <Trash2 size={18} />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-[var(--bg-light)] text-[var(--text-muted)] transition-all">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          )) : (
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e); }}
              className={`flex flex-col items-center justify-center h-full min-h-[400px] border-4 border-dashed rounded-3xl m-8 transition-all ${dragActive ? 'border-[var(--primary)] bg-[var(--bg-primary-soft)]' : 'border-[var(--border-color)] opacity-60'}`}
            >
              <div className="p-6 rounded-full bg-[var(--bg-light)] mb-6">
                <HardDrive size={48} className="text-[var(--text-muted)]" />
              </div>
              <p className="font-black text-[var(--text-main)] uppercase tracking-widest mb-2">The vault is currently empty</p>
              <p className="text-[var(--text-muted)] text-xs font-medium max-w-xs text-center leading-relaxed">
                Drag and drop files here to encrypt and sync them to your team's mission workspace.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[var(--border-color)] bg-[var(--bg-light)]/30">
          <div className="flex items-center justify-between text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            <div className="flex items-center gap-4">
              <span>{filteredFiles.length} Object(s)</span>
              <span>•</span>
              <span>{formatSize(files.reduce((acc, f) => acc + (f.size || 0), 0))} Capacity Used</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--primary)]">
              <Shield size={12} />
              End-to-End Encryption Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
