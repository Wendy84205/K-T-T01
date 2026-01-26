import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Profile</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-500">Name</label>
          <p className="text-slate-800">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500">Email</label>
          <p className="text-slate-800">{user?.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500">Username</label>
          <p className="text-slate-800">{user?.username}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500">Department</label>
          <p className="text-slate-800">{user?.department || '—'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-500">Employee ID</label>
          <p className="text-slate-800">{user?.employeeId || '—'}</p>
        </div>
      </div>
    </div>
  );
}
