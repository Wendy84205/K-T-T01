import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2, ChevronRight, KeyIcon, Lock, Timer, ShieldOff, RefreshCw } from 'lucide-react';

// ─── Account Locked Screen ─────────────────────────────────────────────────────
function AccountLockedScreen({ remainingSeconds: initSeconds, lockedUntil, onRetry }) {
    const [seconds, setSeconds] = useState(initSeconds || 1800);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (lockedUntil) {
            const update = () => {
                const diff = Math.max(0, Math.ceil((new Date(lockedUntil) - Date.now()) / 1000));
                setSeconds(diff);
                if (diff <= 0) {
                    clearInterval(intervalRef.current);
                    onRetry();
                }
            };
            update();
            intervalRef.current = setInterval(update, 1000);
        } else {
            intervalRef.current = setInterval(() => {
                setSeconds(s => {
                    if (s <= 1) { clearInterval(intervalRef.current); onRetry(); return 0; }
                    return s - 1;
                });
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [lockedUntil, onRetry]);

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const progress = Math.max(0, (seconds / (initSeconds || 1800)) * 100);

    return (
        <div style={{ textAlign: 'center', padding: '8px' }}>
            {/* Icon */}
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    position: 'absolute', inset: '-10px',
                    background: 'radial-gradient(circle, rgba(239,68,68,0.25) 0%, transparent 70%)',
                    borderRadius: '50%', animation: 'lockedPulse 2s ease-in-out infinite'
                }} />
                <div style={{
                    width: '80px', height: '80px', background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)', borderRadius: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(239,68,68,0.2)'
                }}>
                    <ShieldOff size={36} color="#ef4444" />
                </div>
            </div>

            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '900', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Account Temporarily Locked
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 32px', lineHeight: '1.6', fontWeight: '500' }}>
                Quá nhiều lần đăng nhập sai. Tài khoản sẽ tự động mở khóa sau:
            </p>

            {/* Countdown */}
            <div style={{
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: '20px', padding: '24px', marginBottom: '24px', position: 'relative', overflow: 'hidden'
            }}>
                {/* Progress ring background */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
                    <Timer size={16} color="rgba(239,68,68,0.7)" />
                    <span style={{ color: 'rgba(239,68,68,0.7)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Thời gian còn lại</span>
                </div>

                {/* Timer display */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                    {[String(mins).padStart(2, '0'), ':', String(secs).padStart(2, '0')].map((part, i) => (
                        <span key={i} style={{
                            fontSize: i === 1 ? '36px' : '52px',
                            fontWeight: '900',
                            fontFamily: 'JetBrains Mono, monospace',
                            color: seconds < 60 ? '#ef4444' : '#fff',
                            lineHeight: 1,
                            textShadow: seconds < 60 ? '0 0 20px rgba(239,68,68,0.5)' : '0 0 20px rgba(255,255,255,0.1)',
                            transition: 'color 0.5s'
                        }}>{part}</span>
                    ))}
                </div>

                {/* Progress bar */}
                <div style={{ height: '4px', background: 'rgba(239,68,68,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${progress}%`,
                        background: 'linear-gradient(90deg, #ef4444, #f97316)',
                        borderRadius: '2px', transition: 'width 1s linear',
                        boxShadow: '0 0 10px rgba(239,68,68,0.5)'
                    }} />
                </div>
            </div>

            {/* Info */}
            <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '16px', marginBottom: '24px', textAlign: 'left'
            }}>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0, lineHeight: '1.7', fontWeight: '500' }}>
                    🛡️ Tính năng bảo mật này <strong style={{ color: 'rgba(255,255,255,0.6)' }}>tự động khóa tài khoản</strong> sau 5 lần đăng nhập sai để ngăn chặn tấn công brute-force.<br />
                    Vui lòng chờ hết thời gian, hoặc liên hệ quản trị viên để mở khóa sớm.
                </p>
            </div>

            {/* Actions */}
            <button
                onClick={onRetry}
                style={{
                    width: '100%', padding: '14px', marginBottom: '12px',
                    background: seconds === 0 ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${seconds === 0 ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '14px', color: seconds === 0 ? '#fff' : 'rgba(255,255,255,0.4)',
                    fontSize: '13px', fontWeight: '900', cursor: seconds === 0 ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'all 0.3s'
                }}
            >
                <RefreshCw size={16} />
                {seconds === 0 ? 'Thử đăng nhập lại' : 'Đang chờ...'}
            </button>

            <button
                onClick={onRetry}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(129,140,248,0.6)', fontSize: '12px', fontWeight: '700',
                    letterSpacing: '0.04em', width: '100%'
                }}
            >
                ← Quay lại trang đăng nhập
            </button>

            <style>{`
                @keyframes lockedPulse {
                    0%, 100% { transform: scale(1); opacity: 0.6; }
                    50% { transform: scale(1.15); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

// ─── LoginForm ─────────────────────────────────────────────────────────────────
function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [mfaOtp, setMfaOtp] = useState(new Array(6).fill(''));
    const [mfaMethods, setMfaMethods] = useState([]);
    const [lockedState, setLockedState] = useState(null); // { remainingSeconds, lockedUntil }
    const { login } = useAuth();
    const navigate = useNavigate();

    const getRedirectPath = (user) => {
        if (!user || !user.roles) return '/user/home';
        const roles = user.roles.map(r => typeof r === 'string' ? r : r.name);
        if (roles.includes('Admin')) return '/admin/dashboard';
        if (roles.includes('Manager')) return '/manage/dashboard';
        return '/user/home';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.login(identifier, password);
            if (response.requiresMfa) {
                setMfaRequired(true);
                setTempToken(response.tempToken);
                setMfaMethods(response.mfaMethods);
            } else {
                login(response);
                navigate(getRedirectPath(response.user), { replace: true });
            }
        } catch (err) {
            // Check for account locked error
            if (err.data?.error === 'ACCOUNT_LOCKED') {
                setLockedState({
                    remainingSeconds: err.data.remainingSeconds || 1800,
                    lockedUntil: err.data.lockedUntil,
                });
            } else {
                setError(err.message || 'Login failed. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMfaVerify = async (e) => {
        if (e) e.preventDefault();
        const code = mfaOtp.join('');
        if (code.length !== 6) return;
        setError('');
        setLoading(true);
        try {
            const response = await api.verifyMfa(code, tempToken);
            login(response);
            navigate(getRedirectPath(response.user), { replace: true });
        } catch (err) {
            setError(err.message || 'Invalid MFA token. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;
        const newOtp = [...mfaOtp];
        newOtp[index] = value.substring(value.length - 1);
        setMfaOtp(newOtp);
        if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !mfaOtp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    // ─── Account Locked Screen ─────────────────────────────────────────────────
    if (lockedState) {
        return (
            <div className="form-box login p-8" style={{ width: '100%', right: 0, background: 'transparent', color: '#fff' }}>
                <AccountLockedScreen
                    remainingSeconds={lockedState.remainingSeconds}
                    lockedUntil={lockedState.lockedUntil}
                    onRetry={() => {
                        setLockedState(null);
                        setError('');
                        setPassword('');
                    }}
                />
            </div>
        );
    }

    // ─── MFA Screen ───────────────────────────────────────────────────────────
    if (mfaRequired) {
        return (
            <div className="form-box login p-8" style={{ width: '100%', right: 0, background: 'transparent', color: '#fff' }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 mx-auto mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <KeyIcon className="text-blue-500" size={30} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase italic mb-2">
                            KTT01 Security Protocol
                        </h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            Enter 6-digit verification token
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 mb-6 animate-shake">
                            <ShieldAlert className="text-red-400 shrink-0" size={18} />
                            <p className="text-xs text-red-300 font-bold leading-tight">{error}</p>
                        </div>
                    )}

                    <div className="flex justify-center gap-3 mb-10 animate-slide-up stagger-1">
                        {mfaOtp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={e => handleOtpChange(e, index)}
                                onKeyDown={e => handleOtpKeyDown(e, index)}
                                disabled={loading}
                                className={`w-12 h-16 text-center text-2xl font-black outline-none transition-all rounded-2xl border-2 
                                    ${digit ? "border-blue-500 text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-white/5 border-white/10 text-white"} 
                                    focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/5`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => handleMfaVerify()}
                        disabled={loading || mfaOtp.join('').length !== 6}
                        className="btn w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-600/20 animate-slide-up stagger-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <div className="flex items-center gap-2">
                                <span>Verify Identity</span>
                                <ChevronRight size={18} />
                            </div>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setMfaRequired(false); setMfaOtp(new Array(6).fill('')); setTempToken(''); setError(''); }}
                        className="mt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-300 transition-colors animate-fade-in stagger-3"
                    >
                        Abort Access Attempt
                    </button>
                </div>
            </div>
        );
    }

    // ─── Main Login Form ───────────────────────────────────────────────────────
    return (
        <div className="form-box login p-8" style={{ width: '100%', right: 0, background: 'transparent', color: '#fff' }}>
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
                <div className="mb-4 animate-fade-in stagger-1">
                    <h1 className="text-3xl font-black tracking-tight text-white mb-2 italic">Welcome back</h1>
                    <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 animate-shake">
                        <ShieldAlert className="text-red-400 shrink-0" size={18} />
                        <p className="text-xs text-red-300 font-bold leading-tight">{error}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="input-box relative animate-slide-up stagger-2">
                        <input
                            type="text"
                            placeholder="Email or username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            autoComplete="username"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500">
                            <i className="bx bxs-user text-xl"></i>
                        </div>
                    </div>

                    <div className="input-box relative animate-slide-up stagger-3">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500">
                            <i className="bx bxs-lock-alt text-xl"></i>
                        </div>
                    </div>

                    {/* Forgot password */}
                    <div style={{ textAlign: 'right' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'rgba(129,140,248,0.7)', fontSize: '12px', fontWeight: '700',
                                letterSpacing: '0.04em', transition: 'color 0.2s', padding: '2px 0'
                            }}
                            onMouseEnter={e => e.target.style.color = '#818cf8'}
                            onMouseLeave={e => e.target.style.color = 'rgba(129,140,248,0.7)'}
                        >
                            Forgot password?
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center uppercase tracking-[0.2em] text-xs shadow-lg shadow-blue-600/20 animate-slide-up stagger-4"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Initiate Session</span>}
                </button>
            </form>
        </div>
    );
}

export default LoginForm;
