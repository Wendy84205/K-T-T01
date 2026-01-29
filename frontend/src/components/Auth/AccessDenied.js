import React, { useState, useEffect } from 'react';

const AccessDenied = ({ lockedUntil, remainingSeconds: initialRemainingSeconds }) => {
    const [timeLeft, setTimeLeft] = useState(initialRemainingSeconds || 0);

    useEffect(() => {
        if (!lockedUntil) return;

        // Calculate initial time left if not provided (fallback)
        const calculateTimeLeft = () => {
            const end = new Date(lockedUntil).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, Math.ceil((end - now) / 1000));
            return diff;
        };

        if (!initialRemainingSeconds) {
            setTimeLeft(calculateTimeLeft());
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    window.location.reload(); // Refresh to allow login again when time is up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [lockedUntil, initialRemainingSeconds]);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return {
            h: hours.toString().padStart(2, '0'),
            m: minutes.toString().padStart(2, '0'),
            s: seconds.toString().padStart(2, '0')
        };
    };

    const time = formatTime(timeLeft);

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center font-mono text-red-600 selection:bg-red-900/30">

            {/* Background Grid - Darker and Red tinted */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#2a0a0a_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)] pointer-events-none"></div>

            {/* Header Bar */}
            <div className="absolute top-0 w-full border-b border-red-900/30 p-4 flex justify-between items-center bg-black/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <i className='bx bxs-shield-x text-2xl animate-pulse'></i>
                    <span className="font-bold tracking-widest text-sm">SECURE_CORE // TERMINAL_LOCK</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs bg-red-950 text-red-500 px-2 py-1 border border-red-900/50 rounded">STATUS: CRITICAL</span>
                    <i className='bx bxs-lock text-slate-500'></i>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full p-8 animate-fade-in">

                {/* Big Lock/Warning Icon */}
                <div className="w-24 h-24 border border-red-600 rounded-lg flex items-center justify-center mb-10 bg-red-950/20 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                    <i className='bx bxs-error text-6xl drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]'></i>
                </div>

                {/* Glitchy Text Effect Title */}
                <h1 className="text-6xl font-black tracking-tighter mb-2 text-white relative">
                    <span className="absolute -left-[2px] -top-[2px] text-red-500 opacity-70 animate-pulse">ACCESS DENIED</span>
                    <span className="relative z-10">ACCESS DENIED</span>
                    <span className="absolute -right-[2px] -bottom-[2px] text-red-800 opacity-70">ACCESS DENIED</span>
                </h1>

                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent mt-4 mb-8"></div>

                <p className="text-slate-300 text-lg mb-12 tracking-wide text-center">
                    Security protocols initiated. Connection terminated.
                </p>

                {/* Error Details Box */}
                <div className="w-full bg-black/60 border border-red-900/50 rounded p-6 mb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>

                    <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm font-bold">
                        <div className="text-red-700">ERROR_CODE:</div>
                        <div className="text-slate-200 text-right">ERR_IP_BLACKLIST_0x99</div>

                        <div className="text-red-700">DETECTED_IP:</div>
                        <div className="text-slate-200 text-right">192.168.45.201</div>

                        <div className="text-red-700">TIMESTAMP:</div>
                        <div className="text-slate-200 text-right">{new Date().toISOString().replace('T', ' ').split('.')[0]}Z</div>
                    </div>

                    <div className="mt-6 text-xs text-slate-500 font-normal leading-relaxed border-t border-red-900/30 pt-4">
                        &gt; SYSTEM MESSAGE: Your IP address has been flagged for suspicious activity resembling brute-force entry attempts. Temporary ban active.
                    </div>
                </div>

                {/* Cooldown Timer */}
                <div className="text-center mb-12">
                    <h3 className="text-red-600 font-bold tracking-[0.2em] text-sm mb-6 uppercase">System Cooldown Active</h3>

                    <div className="inline-flex items-center gap-4 bg-red-950/10 border border-red-900/30 px-10 py-6 rounded-2xl">
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-white mb-2 font-mono">{time.h}</span>
                            <span className="text-[10px] text-red-700 uppercase tracking-wider">Hours</span>
                        </div>
                        <span className="text-4xl text-red-600 mb-6">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-red-500 mb-2 font-mono">{time.m}</span>
                            <span className="text-[10px] text-red-700 uppercase tracking-wider">Minutes</span>
                        </div>
                        <span className="text-4xl text-red-600 mb-6">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-white mb-2 font-mono">{time.s}</span>
                            <span className="text-[10px] text-red-700 uppercase tracking-wider">Seconds</span>
                        </div>
                    </div>
                </div>

                {/* Contact Button */}
                <button className="group relative px-8 py-3 bg-transparent overflow-hidden rounded border border-red-800 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all">
                    <div className="absolute inset-0 w-0 bg-red-700 transition-all duration-[250ms] ease-out group-hover:w-full opacity-20"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <i className='bx bxs-shield-x text-red-500'></i>
                        <span className="font-bold tracking-wider text-sm">CONTACT SECURITY ADMIN</span>
                    </div>
                </button>

            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-[10px] text-red-900/60 font-mono tracking-widest uppercase flex gap-4">
                <span>Reference ID: #SEC-{Math.floor(Math.random() * 9000) + 1000}-LKC</span>
                <span>|</span>
                <span>Secure Connection Terminated</span>
            </div>
        </div>
    );
};

export default AccessDenied;
