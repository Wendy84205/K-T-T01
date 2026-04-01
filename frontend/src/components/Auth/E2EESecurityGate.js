import React from 'react';
import { useE2EE } from '../../context/E2EEContext';
import { useAuth } from '../../context/AuthContext';
import E2EEPassphraseModal from './E2EEPassphraseModal';

/**
 * 🛡️ E2EE SECURITY GATE
 * Prevents access to the application content until E2EE is unlocked or set up.
 * Enforces the mandatory 6-digit PIN requirement after login.
 */
export default function E2EESecurityGate({ children }) {
  const { e2eeStatus, isSkipped, skip } = useE2EE();
  const { user, loading: authLoading } = useAuth();

  // If still checking status or loading auth, show a minimal loading overlay
  if (e2eeStatus === 'checking' || authLoading) {
    return (
      <div style={{
        height: '100vh', width: '100vw', background: 'var(--bg-app)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px'
      }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary)', borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '800', letterSpacing: '0.2em' }}>
          VERIFYING ENCRYPTION STATE...
        </p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // If status is locked or setup needed, show the mandatory 6-digit PIN modal
  // BUT allow them to pass if they explicitly skip it
  if (!isSkipped && (e2eeStatus === 'locked' || e2eeStatus === 'setup_needed')) {
    return <E2EEPassphraseModal mode={e2eeStatus} userId={user?.id} onSkip={skip} />;
  }

  // Permit access if unlocked OR skipped
  return children;
}
