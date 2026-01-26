import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : data?.users ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Users</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-800">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{u.department || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500">No users found.</div>
        )}
      </div>
    </div>
  );
}
