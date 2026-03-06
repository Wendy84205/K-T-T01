import React, { useState, useEffect } from 'react';

const AccessDenied = ({ lockedUntil }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!lockedUntil) return;

        const end = new Date(lockedUntil).getTime();

        const tick = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.ceil((end - now) / 1000));
            setTimeLeft(diff);

            if (diff <= 0) {
                window.location.reload();
            }
        };

        tick(); // Immediate update
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [lockedUntil]);

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

    // Extract time for timestamp display
    const timestampStr = lockedUntil ? new Date(lockedUntil).toISOString().replace('T', ' ').substring(0, 19) + 'Z' : '';

    return (
        <div className="fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center font-mono selection:bg-red-900/30">
            {/* Top Left Text */}
            <div className="absolute top-4 left-6 flex items-start gap-4 z-20">
                <div className="flex -space-x-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <i className='bx bx-buildings text-white text-xl'></i>
                    </div>
                </div>
                <div>
                    <h2 className="text-white font-bold leading-tight tracking-wide text-lg">TechCorp</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Enterprise Security</p>
                </div>
            </div>

            {/* Background Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#110000_1px,transparent_1px),linear-gradient(to_bottom,#110000_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>

            {/* Header Bar */}
            <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3 ml-[200px] text-red-600">
                    <i className='bx bxs-shield-x text-xl'></i>
                    <span className="font-bold tracking-widest text-sm">SECURE_CORE // TERMINAL_LOCK</span>
                </div>
                <div className="flex items-center gap-4 mr-6">
                    <span className="text-[10px] bg-red-950/40 text-red-500 px-3 py-1.5 border border-red-900/50 rounded font-bold uppercase tracking-widest">STATUS: CRITICAL</span>
                    <i className='bx bxs-lock-alt text-slate-500 text-lg'></i>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center max-w-2xl w-full p-8">

                {/* Big Lock/Warning Icon */}
                <div className="w-20 h-20 border border-red-900/80 rounded-lg flex items-center justify-center mb-8 bg-red-950/10 shadow-[0_0_40px_rgba(220,38,38,0.15)] relative">
                    <i className='bx bxs-error text-5xl text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]'></i>
                    <div className="absolute bottom-0 w-16 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent translate-y-[32px] opacity-50"></div>
                </div>

                {/* Glitchy Text Effect Title */}
                <h1 className="text-6xl font-black tracking-tighter mb-8 text-white relative">
                    <span className="absolute -left-[2px] -top-[2px] text-red-500 opacity-60 mix-blend-screen">ACCESS DENIED</span>
                    <span className="relative z-10">ACCESS DENIED</span>
                    <span className="absolute -right-[2px] -bottom-[2px] text-cyan-500 opacity-40 mix-blend-screen">ACCESS DENIED</span>
                </h1>

                <p className="text-[#a0a0a0] text-sm mb-12 tracking-wider text-center font-mono">
                    Security protocols initiated. Connection terminated.
                </p>

                {/* Error Details Box */}
                <div className="w-full max-w-[600px] bg-black border border-red-900/40 rounded p-6 mb-12 relative">
                    <div className="absolute top-0 left-0 w-[3px] h-full bg-red-600"></div>

                    <div className="grid grid-cols-[140px_1fr] gap-y-4 text-[13px] font-bold tracking-wider">
                        <div className="text-red-700">ERROR_CODE:</div>
                        <div className="text-[#e2e8f0] text-right">ERR_IP_BLACKLIST_0x99</div>

                        <div className="text-red-700">DETECTED_IP:</div>
                        <div className="text-[#e2e8f0] text-right">192.168.45.201</div>

                        <div className="text-red-700">TIMESTAMP:</div>
                        <div className="text-[#e2e8f0] text-right">{timestampStr}</div>
                    </div>

                    <div className="mt-6 text-[11px] text-[#64748b] font-normal leading-relaxed border-t border-red-900/20 pt-5 tracking-widest">
                        &gt; SYSTEM MESSAGE: Your IP address has been flagged for suspicious activity resembling brute-force entry attempts. Temporary ban active.
                    </div>
                </div>

                {/* Cooldown Timer */}
                <div className="text-center mb-10 w-full max-w-[600px]">
                    <h3 className="text-red-600 font-bold tracking-[0.25em] text-[11px] mb-6 uppercase">System Cooldown Active</h3>

                    <div className="flex items-center justify-center gap-6 bg-black border border-red-900/30 py-6 rounded-2xl mx-auto w-max px-12 relative">
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-white mb-2 font-mono leading-none">{time.h}</span>
                            <span className="text-[9px] text-red-700 uppercase tracking-widest">HOURS</span>
                        </div>
                        <span className="text-3xl text-red-600 mb-6 font-mono">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-red-500 mb-2 font-mono leading-none">{time.m}</span>
                            <span className="text-[9px] text-red-700 uppercase tracking-widest">MINUTES</span>
                        </div>
                        <span className="text-3xl text-red-600 mb-6 font-mono">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-bold text-white mb-2 font-mono leading-none">{time.s}</span>
                            <span className="text-[9px] text-red-700 uppercase tracking-widest">SECONDS</span>
                        </div>
                        {/* Cut corner effect via border borders */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-600 rounded-tl-xl opacity-50"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red-600 rounded-br-xl opacity-50"></div>
                    </div>
                </div>

                {/* Contact Button */}
                <button className="group relative px-6 py-2.5 bg-black rounded border border-red-900/50 hover:border-red-600 transition-colors flex items-center gap-3">
                    <i className='bx bxs-shield-check text-red-600'></i>
                    <span className="font-bold tracking-[0.15em] text-[11px] text-[#e2e8f0] uppercase">CONTACT SECURITY ADMIN</span>
                </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 text-[9px] text-[#475569] font-mono tracking-widest uppercase flex gap-4">
                <span>© 2026 TechCorp Systems & Infrastructure. Secure Authentication Endpoint.</span>
            </div>
        </div>
    );
};

export default AccessDenied;
