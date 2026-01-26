import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getTeams()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.teams ?? [];
        setTeams(list);
      })
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
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Teams</h1>
      <div className="grid gap-4">
        {teams.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex justify-between items-center"
          >
            <div>
              <h2 className="font-medium text-slate-800">{t.name}</h2>
              <p className="text-sm text-slate-500">{t.code}</p>
            </div>
            <span className="text-sm text-slate-500">
              {t.members?.length ?? 0} members
            </span>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-12 text-center text-slate-500">
            No teams found.
          </div>
        )}
      </div>
    </div>
  );
}
