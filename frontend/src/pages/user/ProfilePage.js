import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Building2, BadgeCheck, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 py-5 border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--active-bg)] px-2 -mx-2 rounded-xl transition-colors">
      <div className="w-11 h-11 rounded-xl bg-[var(--bg-panel)] flex items-center justify-center border border-[var(--border-color)] shadow-sm">
        <Icon className="text-[var(--primary)]" size={20} />
      </div>
      <div className="flex-1">
        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em]">{label}</label>
        <p className="text-[15px] font-black text-[var(--text-main)] mt-0.5">{value || 'NOT SPECIFIED'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter">Enterprise Identity</h1>
        <p className="text-[var(--text-muted)] text-sm mt-2 font-medium">Verify and manage your corporate credentials and security clearance.</p>
      </div>

      <div className="bg-[var(--bg-main)] rounded-3xl shadow-[var(--shadow)] border border-[var(--border-color)] overflow-hidden transition-all duration-300">
        <div className="h-2 bg-[var(--primary)] shadow-[0_4px_12px_rgba(0,123,255,0.4)]"></div>
        <div className="p-10">
          <InfoRow
            icon={User}
            label="Designated Name"
            value={`${user?.firstName} ${user?.lastName}`}
          />
          <InfoRow
            icon={Mail}
            label="Corporate Email"
            value={user?.email}
          />
          <InfoRow
            icon={Building2}
            label="Workgroup / Department"
            value={user?.department || "Core Operations"}
          />
          <InfoRow
            icon={BadgeCheck}
            label="Personnel Identifier"
            value={user?.employeeId || user?.username}
          />
          <InfoRow
            icon={ShieldAlert}
            label="Clearance Status"
            value={user?.role?.toUpperCase() || "STANDARD PERSONNEL"}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 p-5 bg-[var(--active-bg)] rounded-2xl border border-[var(--border-color)]">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
        </div>
        <p className="text-[11px] font-black text-[var(--primary)] uppercase tracking-widest">
          Session integrity: verified & secure
        </p>
      </div>
    </div>
  );
}
