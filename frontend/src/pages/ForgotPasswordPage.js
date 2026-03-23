import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, Shield, Zap, Lock, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import api from '../utils/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
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
    const onMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      await api.requestPasswordReset(email.trim());
    } catch (_) {
      // Security: always show success regardless of result
    } finally {
      setLoading(false);
      setSent(true);
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
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: '-50%',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(55deg)',
          animation: 'fpGridMove 25s linear infinite',
        }} />
        {/* Primary orb */}
        <div style={{
          position: 'absolute', top: '-15%', left: '-15%',
          width: '60vw', height: '60vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: `translate(${(mousePos.x - 0.5) * -30}px, ${(mousePos.y - 0.5) * -30}px)`,
          transition: 'transform 0.4s ease-out',
        }} />
        {/* Secondary orb */}
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 20}px)`,
          transition: 'transform 0.5s ease-out',
        }} />
        {/* Floating particles */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%',
            background: '#6366f1',
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px rgba(99,102,241,0.6)`,
            animation: `fpFloat ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }} />
        ))}
        {/* Bottom fade */}
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
        boxShadow: '0 0 80px rgba(99,102,241,0.12), 0 60px 120px rgba(0,0,0,0.7)',
        animation: 'fpSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        background: 'rgba(13,17,26,0.9)',
        backdropFilter: 'blur(40px)',
      }}>

        {/* ── Left Info Panel ── */}
        <div style={{
          padding: '56px 48px',
          background: `radial-gradient(circle at ${gx}% ${gy}%, rgba(99,102,241,0.15) 0%, rgba(13,17,26,0) 60%), rgba(8,12,22,0.95)`,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden',
          transition: 'background 0.3s ease',
        }}>
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #6366f1, transparent)' }} />

          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99,102,241,0.2)',
              }}>
                <img src="/ktt01_logo_square.png" alt="KTT01" style={{ width: '26px', height: '26px', borderRadius: '6px' }}
                  onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="color:#818cf8;font-weight:900;font-size:13px">KT</span>'; }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: '15px', color: '#fff', letterSpacing: '-0.02em' }}>KTT01</div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(99,102,241,0.7)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>CSEP</div>
              </div>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: '38px', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.03em' }}>
              Account<br />
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Recovery
              </span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '40px', fontWeight: 500 }}>
              Enter your registered email and we'll transmit a secure, time-limited recovery link directly to your inbox.
            </p>

            {/* Features */}
            {[
              { icon: Shield, label: 'Encrypted reset token', sub: 'HMAC-SHA256 signed' },
              { icon: Zap, label: 'Instant delivery', sub: 'Delivered in seconds' },
              { icon: Lock, label: 'Expires in 15 min', sub: 'One-time use link' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom encryption badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', borderRadius: '100px',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
            width: 'fit-content',
          }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'blink 2s infinite' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(16,185,129,0.8)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              TLS 1.3 · AES-256-GCM Active
            </span>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div style={{ padding: '56px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {!sent ? (
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
                <ArrowLeft size={14} /> Back to Login
              </button>

              <div style={{ marginBottom: '36px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 0 30px rgba(99,102,241,0.2)',
                  position: 'relative',
                }}>
                  <div style={{ position: 'absolute', inset: '-8px', borderRadius: '22px', background: 'rgba(99,102,241,0.06)', zIndex: -1 }} />
                  <Mail size={24} style={{ color: '#818cf8' }} />
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                  Reset Password
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 500, lineHeight: 1.6 }}>
                  Enter the email tied to your account.
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
                  <Mail size={16} style={{
                    position: 'absolute', left: '18px', top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(99,102,241,0.5)', pointerEvents: 'none',
                  }} />
                  <input
                    type="email"
                    placeholder="your@enterprise.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
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
                      e.target.style.borderColor = 'rgba(99,102,241,0.5)';
                      e.target.style.background = 'rgba(99,102,241,0.05)';
                      e.target.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.08)';
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
                  disabled={loading || !email.trim()}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: loading || !email.trim() ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none', borderRadius: '14px',
                    color: '#fff', fontSize: '13px', fontWeight: 900,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: loading || !email.trim() ? 'none' : '0 8px 30px rgba(99,102,241,0.4)',
                    transition: 'all 0.3s',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => { if (!loading && email.trim()) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(99,102,241,0.55)'; } }}
                  onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 30px rgba(99,102,241,0.4)'; }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Send Secure Reset Link"}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                Remember your password?{' '}
                <button
                  onClick={() => navigate('/login')}
                  style={{ background: 'none', border: 'none', color: 'rgba(129,140,248,0.6)', cursor: 'pointer', fontWeight: 700, fontSize: '12px', padding: 0, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#818cf8'}
                  onMouseLeave={e => e.target.style.color = 'rgba(129,140,248,0.6)'}
                >
                  Sign in
                </button>
              </p>
            </>
          ) : (
            /* ── Success State ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 28px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', boxShadow: '0 0 40px rgba(16,185,129,0.15)',
                animation: 'successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
              }}>
                <div style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', border: '1px solid rgba(16,185,129,0.1)', animation: 'ripple 2s ease-out infinite' }} />
                <CheckCircle size={44} style={{ color: '#10b981', filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.6))' }} />
              </div>

              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
                Transmission Sent
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '12px' }}>
                If <strong style={{ color: '#818cf8' }}>{email}</strong> is registered, a secure reset link has been dispatched.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '100px', marginBottom: '36px',
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(245,158,11,0.7)', letterSpacing: '0.08em' }}>
                  ⚡ Link expires in 15 minutes
                </span>
              </div>

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
                <ArrowLeft size={16} /> Return to Login
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fpGridMove { 0% { background-position: 0 0; } 100% { background-position: 0 60px; } }
        @keyframes fpFloat { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(-20px) translateX(10px); } }
        @keyframes fpSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes successPop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes ripple { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.8); opacity: 0; } }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(13,17,26,0.9) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
        @media (max-width: 640px) {
          .fp-grid { grid-template-columns: 1fr !important; }
          .fp-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
