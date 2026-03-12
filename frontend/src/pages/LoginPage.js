import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthContainer from '../components/Auth/AuthContainer';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-mono text-xs animate-pulse">ESTABLISHING CONNECTION...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] floating-bg animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] floating-bg animate-pulse-slow" style={{ animationDelay: '-6s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.05]"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex flex-col items-center p-6">
        
        {/* Centered Branding Header */}
        <div className="flex flex-col items-center mb-10 group cursor-default animate-fade-in">
          <div className="relative overflow-hidden mb-2 flex flex-col items-center">
            <img src="/ktt01_logo_square.png" alt="KTT01 Logo" className="w-20 h-20 mb-4 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)] animate-pulse-slow" />
            <h1 className="text-8xl font-black text-white tracking-[0.3em] italic animate-glow drop-shadow-[0_0_40px_rgba(59,130,246,0.3)] px-6 py-4">
              KTT01
            </h1>
            {/* Subtle Scanning Line on Title */}
            <div className="absolute left-0 w-full h-[2px] bg-blue-400 opacity-40 blur-sm animate-scan z-20"></div>
          </div>
          <div className="h-[2px] w-64 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mt-2"></div>
        </div>

        <div className="w-full flex justify-center animate-slide-up stagger-1">
          <AuthContainer />
        </div>

        {/* Footer Technical Metadata */}
        <div className="mt-16 flex flex-col items-center gap-4 opacity-30 animate-fade-in stagger-3">
          <p className="text-[12px] text-slate-500 font-bold uppercase tracking-[0.5em]">
            © {new Date().getFullYear()} KTT01 GLOBAL OPERATIONS
          </p>
          <div className="flex gap-8 text-[10px] text-slate-600 font-mono italic">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 opacity-60">SYSTEM:</span>
              <span className="text-emerald-500">OPTIMIZED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500 opacity-60">PROTOCOL:</span>
              <span className="text-slate-400">SECURE_v4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
