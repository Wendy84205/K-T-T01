import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

import AccessDenied from "./AccessDenied";

function SecureLogin() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Lockout State
    const [isLocked, setIsLocked] = useState(false);
    const [lockInfo, setLockInfo] = useState(null);

    // MFA states
    const [mfaRequired, setMfaRequired] = useState(false);
    const [tempToken, setTempToken] = useState("");
    const [mfaOtp, setMfaOtp] = useState(new Array(6).fill(""));
    const [mfaMethods, setMfaMethods] = useState([]);
    const [otpSeconds, setOtpSeconds] = useState(60);
    const mfaInputRefs = useRef([]);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Check for persisted lock on mount
    useEffect(() => {
        const storedLock = localStorage.getItem('secure_sys_lockdown');
        if (storedLock) {
            const { lockedUntil } = JSON.parse(storedLock);
            const endDate = new Date(lockedUntil).getTime();
            const now = Date.now();

            if (endDate > now) {
                // Still locked
                setIsLocked(true);
                setLockInfo({
                    lockedUntil,
                    remainingSeconds: Math.ceil((endDate - now) / 1000)
                });
            } else {
                // Lock expired
                localStorage.removeItem('secure_sys_lockdown');
                setIsLocked(false);
            }
        }
    }, []);

    // Reset errors when inputs change
    useEffect(() => {
        if (error) setError("");
    }, [identifier, password, mfaOtp, error]);

    // MFA Countdown Timer
    useEffect(() => {
        let timer = null;
        if (mfaRequired && otpSeconds > 0) {
            timer = setInterval(() => setOtpSeconds(s => s - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [mfaRequired, otpSeconds]);

    // Auto-focus first MFA input when enabled
    useEffect(() => {
        if (mfaRequired) {
            setOtpSeconds(60);
            setTimeout(() => mfaInputRefs.current[0]?.focus(), 100);
        }
    }, [mfaRequired]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.login(identifier, password);

            if (response.requiresMfa) {
                setMfaRequired(true);
                setTempToken(response.tempToken);
                setMfaMethods(response.mfaMethods);
            } else {
                login(response);

                // ROLE-BASED REDIRECTION
                const roles = response.user?.roles || [];
                const isAdmin = roles.some(r => ['System Admin', 'Security Admin'].includes(r));
                const isManager = roles.some(r => ['Department Manager', 'Team Manager'].includes(r));

                if (isAdmin) {
                    navigate("/admin/dashboard", { replace: true });
                } else if (isManager) {
                    navigate("/manage/dashboard", { replace: true });
                } else {
                    navigate("/user/drive", { replace: true });
                }
            }
        } catch (err) {
            if (err.data && err.data.error === 'ACCOUNT_LOCKED') {
                setIsLocked(true);
                setLockInfo(err.data);

                // PERSIST LOCK: Cybersecurity Trick
                localStorage.setItem('secure_sys_lockdown', JSON.stringify({
                    lockedUntil: err.data.lockedUntil,
                    remainingSeconds: err.data.remainingSeconds
                }));
            } else {
                setError(err.message || "Authentication failed. Access denied.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMfaVerify = async (otpValue) => {
        const finalOtp = otpValue || mfaOtp.join("");
        if (finalOtp.length !== 6) return;

        setError("");
        setLoading(true);

        try {
            const response = await api.verifyMfa(finalOtp, tempToken);
            login(response);

            // ROLE-BASED REDIRECTION
            const roles = response.user?.roles || [];
            const isAdmin = roles.some(r => ['System Admin', 'Security Admin'].includes(r));
            const isManager = roles.some(r => ['Department Manager', 'Team Manager'].includes(r));

            if (isAdmin) {
                navigate("/admin/dashboard", { replace: true });
            } else if (isManager) {
                navigate("/manage/dashboard", { replace: true });
            } else {
                navigate("/user/drive", { replace: true });
            }
        } catch (err) {
            setError(err.message || "Invalid security token.");
            // Reset OTP on error to allow retry
            setMfaOtp(new Array(6).fill(""));
            mfaInputRefs.current[0]?.focus();
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

        if (value && index < 5) {
            mfaInputRefs.current[index + 1].focus();
        }

        if (newOtp.join("").length === 6) {
            handleMfaVerify(newOtp.join(""));
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !mfaOtp[index] && index > 0) {
            mfaInputRefs.current[index - 1].focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").trim();
        if (data.length === 6 && !isNaN(data)) {
            const newOtp = data.split("");
            setMfaOtp(newOtp);
            handleMfaVerify(data);
        }
    };

    // Shared Styles
    const labelStyle = "block text-xs font-mono text-slate-400 mb-1.5 uppercase tracking-wider";
    const inputContainerStyle = "relative group";
    const inputStyle =
        "w-full bg-slate-950/50 text-slate-200 border border-slate-700/50 rounded-lg px-10 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-slate-600 font-mono text-sm";
    const iconStyle = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-blue-400 transition-colors";

    if (isLocked && lockInfo) {
        return (
            <AccessDenied
                lockedUntil={lockInfo.lockedUntil}
                remainingSeconds={lockInfo.remainingSeconds}
            />
        );
    }

    return (
        <div className="w-full max-w-[420px] relative">
            {/* Card Container */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden relative z-10 transition-all duration-300 hover:shadow-blue-900/20 hover:border-slate-600/50 min-h-[500px] flex flex-col">

                {/* Top Highlight Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>

                {/* Content Area with Animation Switch */}
                <div className="flex-1 flex flex-col relative">
                    {/* We use a key to trigger fade-in animation on switch */}
                    <div key={mfaRequired ? 'mfa' : 'login'} className="p-8 pb-6 animate-fade-in flex-1 flex flex-col">
                        {!mfaRequired ? (
                            <>
                                {/* LOGIN HEADER */}
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative group">
                                        <div className="absolute -inset-2 bg-blue-500 rounded-full opacity-20 group-hover:opacity-30 blur-lg transition-opacity duration-500"></div>
                                        <div className="relative w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner">
                                            <i className="bx bxs-shield-alt-2 text-3xl text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"></i>
                                        </div>
                                    </div>
                                    <h1 className="mt-5 text-2xl font-bold text-white tracking-tight uppercase">
                                        System Access
                                    </h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <p className="text-xs font-mono text-slate-400 tracking-widest uppercase opacity-80">
                                            Restricted Entry Point: Level 1
                                        </p>
                                    </div>
                                </div>

                                {/* LOGIN FORM */}
                                <form onSubmit={handleLogin} className="space-y-5 flex-1">
                                    <div>
                                        <label className={labelStyle}>Username / ID</label>
                                        <div className={inputContainerStyle}>
                                            <i className={`bx bxs-user-circle ${iconStyle}`}></i>
                                            <input
                                                type="text"
                                                placeholder="Enter system ID"
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                className={inputStyle}
                                                required
                                                autoComplete="username"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Password</label>
                                            <button type="button" className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-mono">
                                                Forgot credentials?
                                            </button>
                                        </div>
                                        <div className={inputContainerStyle}>
                                            <i className={`bx bxs-lock-alt ${iconStyle}`}></i>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`${inputStyle} pr-10`}
                                                required
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                                                tabIndex="-1"
                                            >
                                                <i className={`bx ${showPassword ? 'bx-show' : 'bx-hide'} text-xl`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-3 flex gap-3 items-start backdrop-blur-sm">
                                        <i className="bx bxs-error text-red-500/80 text-lg shrink-0 mt-0.5"></i>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-red-500/90 uppercase tracking-wide">Security Alert</p>
                                            <p className="text-[10px] text-red-400/80 font-mono leading-relaxed">
                                                Logging active. IP will be locked after 5 failed attempts.
                                            </p>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-center p-2 bg-red-500/10 rounded border border-red-500/20 animate-shake">
                                            <p className="text-xs text-red-400 font-mono">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-lg active:scale-[0.98] transition-all shadow-lg shadow-blue-900/20 mt-2 flex items-center justify-center gap-2 group"
                                    >
                                        {loading ? (
                                            <>
                                                <i className="bx bx-loader-alt animate-spin text-xl"></i>
                                                <span className="uppercase tracking-wider text-xs">Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="uppercase tracking-wider text-xs">Initiate Session</span>
                                                <i className="bx bx-right-arrow-alt text-lg group-hover:translate-x-1 transition-transform"></i>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* MFA HEADER */}
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                        <i className="bx bxs-shield-plus text-2xl text-blue-500"></i>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">SECURITY VERIFICATION</h2>
                                    <p className="text-xs font-mono text-slate-400 mt-2 uppercase tracking-widest">
                                        Multi-Factor Authentication Required
                                    </p>
                                </div>

                                {/* MFA FORM */}
                                <div className="space-y-6 flex-1 flex flex-col justify-center">
                                    <div>
                                        <label className={labelStyle}>
                                            {mfaMethods.includes("totp") ? "TOTP AUTHENTICATION" : "IDENTITY VERIFICATION"}
                                        </label>

                                        <div className="flex justify-between gap-2 mt-4" onPaste={handleOtpPaste}>
                                            {mfaOtp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={el => mfaInputRefs.current[index] = el}
                                                    type="text"
                                                    maxLength="1"
                                                    value={digit}
                                                    onChange={e => handleOtpChange(e, index)}
                                                    onKeyDown={e => handleOtpKeyDown(e, index)}
                                                    disabled={loading}
                                                    className="w-12 h-14 bg-slate-950/50 border border-slate-700/50 rounded-xl text-center text-xl font-bold text-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all font-mono"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-4 text-center font-mono">
                                            Enter the 6-digit code from your security device
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="text-center p-2 bg-red-500/10 rounded border border-red-500/20 animate-shake">
                                            <p className="text-xs text-red-400 font-mono">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleMfaVerify()}
                                            disabled={loading || mfaOtp.join("").length !== 6}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-lg active:scale-[0.98] transition-all shadow-[0_4px_20px_-5px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                        >
                                            {loading ? (
                                                <>
                                                    <i className="bx bx-loader-alt animate-spin text-xl"></i>
                                                    <span className="uppercase tracking-widest text-xs">Verifying...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="uppercase tracking-widest text-xs">Verify & Authorize</span>
                                                    <i className="bx bxs-lock-open-alt group-hover:scale-110 transition-transform"></i>
                                                </>
                                            )}
                                        </button>

                                        <div className="flex flex-col items-center gap-4 mt-6">
                                            {otpSeconds > 0 ? (
                                                <p className="text-slate-500 text-[10px] font-mono italic">
                                                    REQUEST NEW CODE IN <span className="text-blue-400 font-bold">{otpSeconds}S</span>
                                                </p>
                                            ) : (
                                                <button className="text-blue-400 text-[10px] font-bold hover:underline tracking-widest uppercase">
                                                    RESEND SECURITY CODE
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMfaRequired(false);
                                                    setMfaOtp(new Array(6).fill(""));
                                                    setTempToken("");
                                                    setError("");
                                                }}
                                                className="text-slate-500 hover:text-slate-300 text-[10px] font-mono transition-colors tracking-widest uppercase"
                                            >
                                                Abort Sequence / Return to Login
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-center gap-2">
                    <i className="bx bxs-shield-check text-slate-600"></i>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">
                        256-bit SSL Encrypted Connection
                    </p>
                </div>
            </div>

            {/* Decorative Background Glows */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
        </div>
    );
}

export default SecureLogin;
