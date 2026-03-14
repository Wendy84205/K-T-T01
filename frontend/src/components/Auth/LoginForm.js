import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2, ChevronRight, KeyIcon } from 'lucide-react';

function LoginForm() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mfaRequired, setMfaRequired] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [mfaOtp, setMfaOtp] = useState(new Array(6).fill(''));
    const [mfaMethods, setMfaMethods] = useState([]);
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
            setError(err.message || 'Login failed. Please check your credentials.');
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

        // Move to next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !mfaOtp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

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
                        onClick={() => {
                            setMfaRequired(false);
                            setMfaOtp(new Array(6).fill(''));
                            setTempToken('');
                            setError('');
                        }}
                        className="mt-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-slate-300 transition-colors animate-fade-in stagger-3"
                    >
                        Abort Access Attempt
                    </button>
                </div>
            </div>
        );
    }

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
