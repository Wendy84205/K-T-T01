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
        <div className="relative w-16 h-16 flex items-center justify-center mb-6">
           <div className="absolute inset-0 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin border-opacity-50" style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
           <HardDrive size={24} className="text-[var(--primary)] animate-pulse" />
        </div>
        <span className="font-black tracking-widest text-[10px] uppercase text-white opacity-80" style={{ textShadow: '0 0 10px rgba(99,102,241,0.5)' }}>Synchronizing Vault...</span>
      </div>
    );
  }

  return (
    <div
      className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-8 relative"
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragActive(false); }}
      onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e); }}
    >
      {/* Full-page drag overlay */}
      {dragActive && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(13, 17, 26, 0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="w-[80vw] h-[80vh] border-[3px] border-dashed border-[var(--primary)] rounded-3xl flex items-center justify-center bg-[rgba(99,102,241,0.05)] shadow-[0_0_50px_rgba(99,102,241,0.3)]">
            <div className="text-center text-[var(--primary)] animate-pulse">

              <p className="font-black text-2xl uppercase tracking-[0.2em] text-white" style={{ textShadow: '0 0 20px rgba(99,102,241,0.8)' }}>Drop to Encrypt & Vault</p>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[rgba(255,255,255,0.05)] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[rgba(56,189,248,0.15)] rounded-xl border border-[rgba(56,189,248,0.3)] shadow-[0_0_20px_rgba(56,189,248,0.3)]">
              <HardDrive size={24} className="text-[var(--blue-color)]" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Secure Vault</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-sm font-medium ml-12">E2EE storage for mission-critical assets.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search secure assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-xl font-black text-xs text-white placeholder-[var(--text-muted)] w-72 transition-all outline-none"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
          <label className="group relative flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-95 overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)', border: '1px solid rgba(99,102,241,0.5)' }}>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            <Plus size={16} className="relative z-10" />
            <span className="relative z-10">Upload</span>
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-[32px] overflow-hidden flex flex-col" style={{ background: 'rgba(13, 17, 26, 0.4)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
          <div className="col-span-6 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Document Name</div>
          <div className="col-span-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] hidden md:block">Capacity</div>
          <div className="col-span-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] hidden md:block">Clearance</div>
          <div className="col-span-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">Actions</div>
        </div>

        {/* File List */}
        <div className="divide-y divide-[rgba(255,255,255,0.03)] min-h-[400px] p-2">
          {filteredFiles.length > 0 ? filteredFiles.map((file) => (
            <div key={file.id} className="grid grid-cols-12 gap-4 mx-2 my-1 px-6 py-4 rounded-2xl items-center hover:bg-[rgba(255,255,255,0.03)] transition-all group">
              <div className="col-span-12 md:col-span-6 flex items-center gap-5">
                <div className="p-3.5 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] group-hover:bg-[rgba(99,102,241,0.15)] group-hover:border-[var(--primary)] transition-all text-white group-hover:text-[var(--primary)] shadow-inner">
                  <File size={20} className="drop-shadow-[0_0_5px_currentColor]" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-base truncate tracking-tight group-hover:text-[var(--primary)] transition-colors" title={file.originalName}>
                    {file.originalName}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[rgba(16,185,129,0.15)] text-[var(--green-color)] uppercase tracking-widest flex items-center gap-1 border border-[rgba(16,185,129,0.3)] shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <Shield size={10} /> 
                      E2EE
                    </span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                      {new Date(file.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2 hidden md:block">
                <span className="text-sm font-bold text-[var(--text-secondary)] tracking-tight">
                  {formatSize(file.size || 0)}
                </span>
              </div>

              <div className="col-span-2 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--primary)] to-indigo-900 border border-[rgba(255,255,255,0.2)] flex items-center justify-center text-[11px] font-black uppercase text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                    {file.user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-tighter">
                    {file.user?.firstName || 'User'}
                  </span>
                </div>
              </div>

              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2 pr-2">
                <button 
                  onClick={() => api.downloadFile(file.id, file.originalName)}
                  className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(99,102,241,0.15)] text-[var(--text-secondary)] hover:text-[var(--primary)] border border-transparent hover:border-[rgba(99,102,241,0.3)] transition-all shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  title="Secure Download"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(file.id)}
                  className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(248,113,113,0.1)] text-[var(--text-secondary)] hover:text-[var(--red-color)] border border-transparent hover:border-[rgba(248,113,113,0.3)] transition-all shadow-sm hover:shadow-[0_0_15px_rgba(248,113,113,0.2)]"
                  title="Purge"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )) : (
            <div 
              className={`flex flex-col items-center justify-center h-full min-h-[400px] border-[3px] border-dashed rounded-[24px] m-6 transition-all duration-300 ${dragActive ? 'border-[var(--primary)] bg-[rgba(99,102,241,0.05)] shadow-[inset_0_0_30px_rgba(99,102,241,0.1)]' : 'border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]'}`}
            >
              <div className="relative mb-6">
                 <div className="absolute inset-0 bg-[var(--primary)] blur-[40px] opacity-20 rounded-full" />
                 <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] relative z-10">

                 </div>
              </div>
              <p className="font-black text-white text-lg uppercase tracking-[0.2em] mb-3">The vault is currently empty</p>
              <p className="text-[var(--text-secondary)] text-sm font-medium pl-8 pr-8 text-center leading-relaxed">
                Drag and drop files here to encrypt and sync them to your team's secure mission workspace.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-center justify-between text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.15em] gap-4">
            <div className="flex items-center gap-4">
              <span className="bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-lg text-white">{filteredFiles.length} Object(s)</span>
              <span className="bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-lg text-white">{formatSize(files.reduce((acc, f) => acc + (f.size || 0), 0))} Capacity Used</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--primary)] px-3 py-1.5 rounded-lg bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              <Shield size={12} className="animate-pulse drop-shadow-[0_0_5px_var(--primary)]" />
              End-to-End Encryption Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
