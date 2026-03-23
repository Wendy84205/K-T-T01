import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Shield, Zap, Lock, Loader2, ShieldAlert, KeyRound } from 'lucide-react';
import api from '../utils/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  );

  useEffect(() => {
    // If no token or email in URL, they shouldn't be here
    if (!token || !email) {
      setError('Invalid or missing secure token. Please request a new link.');
    }

    const onMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      setError('Missing secure token or email.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.resetPasswordWithToken(token, email, password);
      // Simulate slight delay for effect
      setTimeout(() => setSuccess(true), 600);
    } catch (err) {
      setError(err.message || 'Token expired or invalid. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const gx = mousePos.x * 40;
  const gy = mousePos.y * 40;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#02040a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Animated BG ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: '-50%',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(55deg)',
          animation: 'rpGridMove 25s linear infinite',
        }} />
        <div style={{
          position: 'absolute', top: '-15%', left: '-15%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: `translate(${(mousePos.x - 0.5) * -30}px, ${(mousePos.y - 0.5) * -30}px)`,
          transition: 'transform 0.4s ease-out',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 20}px)`,
          transition: 'transform 0.5s ease-out',
        }} />
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%',
            background: '#10b981',
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px rgba(16,185,129,0.5)`,
            animation: `rpFloat ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(2,4,10,0.6) 100%)',
        }} />
      </div>

      {/* ── Main Panel ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '920px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        borderRadius: '32px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 0 80px rgba(16,185,129,0.1), 0 60px 120px rgba(0,0,0,0.7)',
        animation: 'rpSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        background: 'rgba(13,17,26,0.9)',
        backdropFilter: 'blur(40px)',
      }}>

        {/* ── Left Info Panel ── */}
        <div style={{
          padding: '56px 48px',
          background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(16,185,129,0.1) 0%, rgba(13,17,26,0) 60%), rgba(8,12,22,0.95)`,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          transition: 'background 0.3s ease',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #10b981, transparent)' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(16,185,129,0.2)',
              }}>
                <img src="/ktt01_logo_square.png" alt="KTT01" style={{ width: '26px', height: '26px', borderRadius: '6px' }}
                  onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="color:#34d399;font-weight:900;font-size:13px">KT</span>'; }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '15px', color: '#fff', letterSpacing: '-0.02em' }}>KTT01</div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(52,211,153,0.7)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>CSEP</div>
              </div>
            </div>

            <h1 style={{ fontSize: '38px', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.03em' }}>
              Creds<br />
              <span style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Re-Keying
              </span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '40px', fontWeight: 500 }}>
              Verify your identity and set a new, secure passcode. Ensure your new sequence meets corporate encryption standards.
            </p>

            {[
              { icon: Shield, label: 'Bcrypt Hash', sub: 'Salted & derived' },
              { icon: Zap, label: 'Instant commit', sub: 'Zero-downtime update' },
              { icon: Lock, label: 'Session flush', sub: 'Revokes old tokens' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} style={{ color: '#34d399' }} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', borderRadius: '100px',
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
            width: 'fit-content',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 8px #818cf8', animation: 'blink 2s infinite' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(129,140,248,0.8)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Network Secured
            </span>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{ padding: '56px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {!success ? (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 700,
                  letterSpacing: '0.04em', marginBottom: '36px', padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              >
                <ArrowLeft size={14} /> Cancel Action
              </button>

              <div style={{ marginBottom: '36px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 0 30px rgba(16,185,129,0.2)',
                  position: 'relative',
                }}>
                  <div style={{ position: 'absolute', inset: '-8px', borderRadius: '22px', background: 'rgba(16,185,129,0.06)', zIndex: -1 }} />
                  <KeyRound size={24} style={{ color: '#34d399' }} />
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                  Commit New Key
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
                  Enter a strong, unpredictable password string.
                </p>
              </div>

              {error && (
                <div style={{
                  display: 'flex', gap: '10px', alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '12px', marginBottom: '20px',
                  color: '#fca5a5', fontSize: '13px', fontWeight: 600,
                }}>
                  <ShieldAlert size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{
                    position: 'absolute', left: '18px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(16,185,129,0.5)', pointerEvents: 'none',
                  }} />
                  <input
                    type="password"
                    placeholder="New Password (min 8 chars)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      padding: '16px 18px 16px 46px',
                      color: '#fff',
                      fontSize: '14px', fontWeight: 500,
                      outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                      boxSizing: 'border-box',
                      transition: 'all 0.25s',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(16,185,129,0.5)';
                      e.target.style.background = 'rgba(16,185,129,0.05)';
                      e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.08)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.target.style.background = 'rgba(255,255,255,0.04)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ position: 'relative' }}>
                  <Shield size={16} style={{
                    position: 'absolute', left: '18px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(16,185,129,0.5)', pointerEvents: 'none',
                  }} />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      padding: '16px 18px 16px 46px',
                      color: '#fff',
                      fontSize: '14px', fontWeight: 500,
                      outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                      boxSizing: 'border-box',
                      transition: 'all 0.25s',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(16,185,129,0.5)';
                      e.target.style.background = 'rgba(16,185,129,0.05)';
                      e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.08)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.target.style.background = 'rgba(255,255,255,0.04)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword || !token}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: loading || !password ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none', borderRadius: '14px',
                    color: '#fff', fontSize: '13px', fontWeight: 900,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: loading || !password ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: loading || !password ? 'none' : '0 8px 30px rgba(16,185,129,0.4)',
                    transition: 'all 0.3s',
                    position: 'relative', overflow: 'hidden',
                    marginTop: '8px'
                  }}
                  onMouseEnter={e => { if (!loading && password) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(16,185,129,0.55)'; } }}
                  onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 30px rgba(16,185,129,0.4)'; }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Matrix & Login'}
                </button>
              </form>
            </>
          ) : (
            /* ── Success State ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 28px',
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', boxShadow: '0 0 40px rgba(99,102,241,0.15)',
                animation: 'rpSuccessPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
              }}>
                <div style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.1)', animation: 'rpRipple 2s ease-out infinite' }} />
                <CheckCircle size={44} style={{ color: '#818cf8', filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.6))' }} />
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
                Key Updated
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '24px' }}>
                Your authentication credentials have been successfully rotated and securely hashed.
              </p>

              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%', padding: '16px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '14px',
                  color: '#fff', fontWeight: 900, fontSize: '13px',
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.4)'; }}
              >
                Proceed to Login Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes rpGridMove { 0% { background-position: 0 0; } 100% { background-position: 0 60px; } }
        @keyframes rpFloat { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(-20px) translateX(10px); } }
        @keyframes rpSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes rpSuccessPop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes rpRipple { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.8); opacity: 0; } }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(13,17,26,0.9) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
        @media (max-width: 640px) {
          .rp-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
