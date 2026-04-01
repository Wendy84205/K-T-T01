import React, { useState, useRef } from 'react';
import { useE2EE } from '../../context/E2EEContext';

/**
 * 🔑 E2EE PASSPHRASE MODAL COMPONENT
 * Mandatory 6-digit PIN verification to unlock private keys.
 */
export default function E2EEPassphraseModal({ mode, userId, onSkip }) {
  const { unlock, setup } = useE2EE();
  const PIN_LENGTH = 6;
  const [pin, setPin] = useState(Array(PIN_LENGTH).fill(''));
  const [confirmPin, setConfirmPin] = useState(Array(PIN_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pinRefs = useRef([]);
  const confirmRefs = useRef([]);

  const isSetup = mode === 'setup_needed';
  const pinValue = pin.join('');
  const confirmPinValue = confirmPin.join('');

  const handlePinChange = (index, val, arr, setArr, refs) => {
    if (!/^[0-9]?$/.test(val)) return;
    const updated = [...arr];
    updated[index] = val;
    setArr(updated);
    setError('');
    if (val && index < PIN_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const handlePinKeyDown = (e, index, refs) => {
    if (e.key === 'Backspace' && !refs.current[index]?.value && index > 0)
      refs.current[index - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    
    if (pinValue.length < PIN_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }
    if (isSetup && pinValue !== confirmPinValue) {
      setError('PINs do not match. Please try again.');
      return;
    }
    
    setLoading(true);
    try {
      if (isSetup) {
        await setup(pinValue);
      } else {
        await unlock(pinValue);
      }
    } catch (err) {
      console.error('[E2EE Modal]', err);
      setError(isSetup ? 'Setup failed. Try again.' : 'Wrong PIN. Please try again.');
      setPin(Array(PIN_LENGTH).fill(''));
      if (isSetup) setConfirmPin(Array(PIN_LENGTH).fill(''));
      pinRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: 'rgba(2, 4, 10, 0.85)', backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-panel)', borderRadius: '32px',
        padding: '48px 40px', maxWidth: '460px', width: '100%',
        border: '1px solid var(--border-color)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(102,126,234,0.1)',
        animation: 'modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        textAlign: 'center'
      }}>
        {/* Header Icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '24px', margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 30px rgba(99,102,241,0.4)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', inset: 0, 
            background: 'linear-gradient(transparent, rgba(255,255,255,0.2), transparent)',
            height: '200%', transform: 'translateY(-50%)',
            animation: 'scanLine 3s linear infinite'
          }}></div>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <h2 style={{ color: 'var(--text-main)', margin: '0 0 12px', fontSize: '24px', fontWeight: '900', letterSpacing: '-0.02em' }}>
          {isSetup ? 'Enforce E2EE Security' : 'Secure Access Required'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px', lineHeight: 1.6, fontWeight: '500' }}>
          {isSetup
            ? 'Set a 6-digit security PIN to protect your private encryption keys. This PIN is never sent to our servers.'
            : 'Enter your 6-digit PIN to unlock your end-to-end encryption keys and access secure content.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* PIN Input Group */}
          <div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '8px' }}>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={el => pinRefs.current[i] = el}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  onChange={e => handlePinChange(i, e.target.value, pin, setPin, pinRefs)}
                  onKeyDown={e => handlePinKeyDown(e, i, pinRefs)}
                  style={inputStyle(digit)}
                />
              ))}
            </div>
            {isSetup && (
              <div style={{ marginTop: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Confirm Security PIN</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {confirmPin.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => confirmRefs.current[i] = el}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handlePinChange(i, e.target.value, confirmPin, setConfirmPin, confirmRefs)}
                      onKeyDown={e => handlePinKeyDown(e, i, confirmRefs)}
                      style={inputStyle(digit)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ 
              color: '#ef4444', fontSize: '13px', fontWeight: '600', 
              padding: '12px', background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)',
              animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onSkip}
              style={{
                flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)',
                background: 'transparent', color: 'var(--text-secondary)',
                fontSize: '14px', fontWeight: '800', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              SKIP
            </button>
            <button
              type="submit"
              disabled={loading || pinValue.length < 6 || (isSetup && confirmPinValue.length < 6)}
              style={{
                flex: 2, padding: '16px', borderRadius: '16px', border: 'none',
                background: loading ? 'var(--bg-light)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff', fontSize: '16px', fontWeight: '800', cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: (loading || pinValue.length < 6) ? 0.6 : 1
              }}
            >
              {loading ? 'PROCESSING...' : (isSetup ? 'INITIALIZE' : 'UNLOCK')}
            </button>
          </div>
        </form>

        <style>{`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes scanLine {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
          }
        `}</style>
      </div>
    </div>
  );
}

const inputStyle = (hasValue) => ({
  width: '56px', height: '64px', textAlign: 'center', fontSize: '24px',
  fontWeight: '900', borderRadius: '16px',
  background: 'var(--bg-app)',
  border: `2px solid ${hasValue ? 'var(--primary)' : 'var(--border-color)'}`,
  color: 'var(--text-main)', outline: 'none',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: hasValue ? '0 0 0 4px var(--primary-light), 0 8px 20px rgba(0,0,0,0.2)' : 'none'
});
