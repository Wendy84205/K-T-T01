import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function AdminHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, teams: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [users, teams] = await Promise.all([
          api.getUsers().catch(() => []),
          api.getTeams().catch(() => []),
        ]);
        setStats({
          users: Array.isArray(users) ? users.length : users?.total ?? 0,
          teams: Array.isArray(teams) ? teams.length : teams?.total ?? 0,
        });
      } catch (_) {}
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Admin Dashboard</h1>
      <p className="text-slate-600 mb-8">
        Welcome, {user?.firstName} {user?.lastName}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wide">Users</h2>
          <p className="text-3xl font-bold text-slate-800 mt-1">{stats.users}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wide">Teams</h2>
          <p className="text-3xl font-bold text-slate-800 mt-1">{stats.teams}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-slate-500 text-sm font-medium uppercase tracking-wide">Your role</h2>
          <p className="text-lg font-medium text-slate-800 mt-1">
            {user?.roles?.join(', ') || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
