import React from 'react';

export default function SecurityPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Security</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <p className="text-slate-600">
          Security dashboard: audit logs, alerts, and policies. Connect to <code className="bg-slate-100 px-1 rounded">/api/v1/security</code> when ready.
        </p>
      </div>
    </div>
  );
}
