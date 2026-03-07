import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { generateKeyPair } from "../../utils/crypto";
import { Shield, User as UserIcon, Lock, Eye, EyeOff, Loader2, Key as KeyIcon, ChevronRight, ShieldCheck, ShieldAlert } from "lucide-react";
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

    const { login, loadUser } = useAuth();
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
        e.preventDefault(); // ngăn chặn trang web tải trang khi nhấn nút submit
        setError(""); // xóa lỗi    
        setLoading(true); // bật loading 

        try {
            const response = await api.login(identifier, password); // gửi thông tin định danh (email, username) và mật khẩu đến api 

            if (response.requiresMfa) {
                setMfaRequired(true);
                setTempToken(response.tempToken);
                setMfaMethods(response.mfaMethods);
            } else {
                login(response);

                // E2EE Key Management
                await ensureE2EEKeys(response.user);

                // ROLE-BASED REDIRECTION
                const roles = response.user?.roles || [];
                const roleNames = roles.map(r => typeof r === 'string' ? r : r.name);

                const isAdmin = roleNames.includes('Admin');
                const isManager = roleNames.includes('Manager');

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

            // E2EE Key Management
            await ensureE2EEKeys(response.user);

            // ROLE-BASED REDIRECTION
            const roles = response.user?.roles || [];
            const roleNames = roles.map(r => typeof r === 'string' ? r : r.name);

            const isAdmin = roleNames.includes('Admin');
            const isManager = roleNames.includes('Manager');

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

    const ensureE2EEKeys = async (user) => {
        try {
            const privateKey = localStorage.getItem(`e2ee_private_key_${user.id}`); // localStrong.getItem để xem máy user đã có private key chưa

            // If no private key locally OR user has no public key on server, (re)generate
            if (!privateKey || !user.publicKey) {
                console.log("[E2EE] Generating secure key pair...");
                const { publicKey, privateKey: newPrivateKey } = await generateKeyPair(); // generateKeyPair để tạo cặp khóa

                // Save private key locally
                localStorage.setItem(`e2ee_private_key_${user.id}`, newPrivateKey); // localStrong.setItem để lưu private key

                // Upload public key to server
                await api.updateProfile({ publicKey }); // Gửi khoá công khai lên server qua api updateProfile để user khác dùng nó mã hoá tin nhắn gửi cho user

                // CRITICAL: Refresh user profile in AuthContext so we have the NEW publicKey for encryption
                if (loadUser) await loadUser();

                console.log("[E2EE] Keys synchronized with server cluster.");
            }
        } catch (err) {
            console.error("[E2EE] Key stabilization failed:", err);
            // Non-blocking error for login, but might affect chat later
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
    const labelStyle = "block text-[10px] font-bold text-[#64748b] mb-2 uppercase tracking-wide";
    const inputContainerStyle = "relative group";
    const inputStyle =
        "w-full bg-[#f8fafc] text-[#0f172a] border border-[#e2e8f0] rounded-xl px-11 py-3.5 focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all placeholder-[#94a3b8] text-sm font-medium";
    const iconStyle = "absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] group-focus-within:text-[#3b82f6] transition-colors";

    if (isLocked && lockInfo) {
        return (
            <AccessDenied
                lockedUntil={lockInfo.lockedUntil}
                remainingSeconds={lockInfo.remainingSeconds}
            />
        );
    }

    return (
        <div className="w-full max-w-[420px] relative mx-auto z-10">
            {/* Card Container */}
            <div className="bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-[#e2e8f0] overflow-hidden relative flex flex-col pt-1.5">

                {/* Top Rounded Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#007bff] rounded-t-2xl"></div>

                {/* Content Area */}
                <div className="p-10 pt-12 pb-8">
                    <div key={mfaRequired ? 'mfa' : 'login'} className="animate-fade-in">
                        {!mfaRequired ? (
                            <>
                                {/* LOGIN HEADER */}
                                <div className="flex flex-col items-center mb-10 text-center">
                                    <div className="w-12 h-12 bg-[#eff6ff] rounded-xl flex items-center justify-center border border-[#bfdbfe] mb-5">
                                        <Shield className="text-[#3b82f6]" size={22} strokeWidth={2.5} />
                                    </div>
                                    <h1 className="text-[22px] font-black text-[#0f172a] tracking-tight uppercase">
                                        System Access
                                    </h1>
                                    <p className="text-[10px] font-bold text-[#64748b] mt-1.5 uppercase tracking-widest">
                                        Secure Identity Verification
                                    </p>
                                </div>

                                {/* LOGIN FORM */}
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div>
                                        <label className={labelStyle}>Identity Identifier</label>
                                        <div className={inputContainerStyle}>
                                            <UserIcon className={iconStyle} size={18} />
                                            <input
                                                type="text"
                                                placeholder="Username or Staff ID"
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
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-[10px] font-bold text-[#64748b] uppercase tracking-wide">Security Password</label>
                                        </div>
                                        <div className={inputContainerStyle}>
                                            <Lock className={iconStyle} size={18} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`${inputStyle} pr-11 font-mono tracking-widest text-[#0f172a]`}
                                                required
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0f172a] transition-colors focus:outline-none"
                                                tabIndex="-1"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3 animate-shake">
                                            <ShieldAlert className="text-red-500 shrink-0" size={18} />
                                            <p className="text-xs text-red-600 font-bold leading-tight">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#007bff] hover:bg-[#0069d9] text-white font-black py-3.5 mt-2 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-xs"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin" size={18} />
                                                <span>Authorizing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Initiate Login</span>
                                                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                {/* MFA HEADER */}
                                <div className="text-center mb-10">
                                    <div className="mx-auto w-14 h-14 bg-[#eff6ff] rounded-2xl flex items-center justify-center border border-[#bfdbfe] mb-5">
                                        <KeyIcon className="text-[#3b82f6]" size={26} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-[22px] font-black text-[#0f172a] tracking-tight uppercase">MFA PROTECTION</h2>
                                    <p className="text-[11px] font-bold text-[#64748b] mt-1.5 uppercase tracking-widest">
                                        Enter Multi-Factor Code
                                    </p>
                                </div>

                                {/* MFA FORM */}
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between gap-3" onPaste={handleOtpPaste}>
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
                                                    className={`w-[52px] h-[56px] text-center text-xl font-medium outline-none transition-all rounded-xl border
                                                    ${digit ? "border-[#3b82f6] text-[#3b82f6] bg-[#eff6ff]" : "bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"}
                                                    focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 bg-white`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3 animate-shake">
                                            <ShieldAlert className="text-red-500 shrink-0" size={18} />
                                            <p className="text-xs text-red-600 font-bold leading-tight">{error}</p>
                                        </div>
                                    )}

                                    <div className="space-y-5">
                                        <button
                                            onClick={() => handleMfaVerify()}
                                            disabled={loading || mfaOtp.join("").length !== 6}
                                            className="w-full bg-[#93c5fd] text-white font-black py-3.5 rounded-xl active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center uppercase tracking-widest text-[11px] hover:bg-[#60a5fa] disabled:cursor-not-allowed"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Verify Security</span>}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMfaRequired(false);
                                                setMfaOtp(new Array(6).fill(""));
                                                setTempToken("");
                                                setError("");
                                            }}
                                            className="w-full text-[#64748b] hover:text-[#0f172a] text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center"
                                        >
                                            Abort & Return
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer bar */}
                <div className="px-10 py-5 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-center gap-2">
                    <ShieldCheck className="text-[#64748b]" size={14} />
                    <p className="text-[9px] text-[#64748b] font-bold uppercase tracking-widest mt-[1px]">
                        Protected by Enterprise Data Encryption
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SecureLogin;
