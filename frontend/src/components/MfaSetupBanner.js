import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function MfaSetupBanner({ user, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  if (!user?.mfaSetupRequired || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-4">
      <p className="text-sm text-amber-800">
        MFA is required for your account but not yet configured.{' '}
        <Link to="/dashboard/profile" className="font-medium underline">
          Set up MFA
        </Link>
      </p>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
        className="text-amber-600 hover:text-amber-800 p-1"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
