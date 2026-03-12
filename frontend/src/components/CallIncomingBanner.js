import React from 'react';
import { Phone, X } from 'lucide-react';
import { useCall } from '../context/CallContext';

export default function CallIncomingBanner() {
  const { incomingCall, declineIncomingCall, openMessengerForCall } = useCall();

  if (!incomingCall) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.92)',
        border: '1px solid rgba(148, 163, 184, 0.25)',
        backdropFilter: 'blur(14px)',
        color: '#fff',
        borderRadius: 16,
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>Incoming {incomingCall.type || 'call'}</div>
        <div style={{ fontSize: 12, color: 'rgba(226, 232, 240, 0.75)' }}>
          Open messenger to accept.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={declineIncomingCall}
          title="Decline"
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            border: 'none',
            background: '#ef4444',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>
        <button
          onClick={openMessengerForCall}
          title="Open messenger"
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            border: 'none',
            background: '#10b981',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Phone size={18} />
        </button>
      </div>
    </div>
  );
}

