import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function UserHomePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">
        Hello, {user?.firstName} {user?.lastName}
      </h1>
      <p className="text-slate-600 mb-6">
        Welcome to CyberSecure. Use the menu above to access your profile.
      </p>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-medium text-slate-800 mb-2">Quick info</h2>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>Email: {user?.email}</li>
          <li>Department: {user?.department || '—'}</li>
          <li>Employee ID: {user?.employeeId || '—'}</li>
        </ul>
      </div>
    </div>
  );
}
