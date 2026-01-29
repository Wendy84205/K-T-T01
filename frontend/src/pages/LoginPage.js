import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SecureLogin from '../components/Auth/SecureLogin';

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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] pointer-events-none"></div>

      {/* Header Elements */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-default">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <div className="w-2 h-4 border-l-2 border-r-2 border-white/60"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold tracking-tight text-sm">SecureSys</span>
            <span className="text-slate-500 text-[10px] font-mono tracking-widest uppercase">Protocol v4.2</span>
          </div>
        </div>

        <button className="px-4 py-2 rounded-full border border-slate-700 bg-slate-900/50 text-slate-400 text-xs font-medium hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2 group backdrop-blur-sm">
          <i className="bx bxs-help-circle text-base group-hover:text-blue-400 transition-colors"></i>
          <span>Support Access</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex justify-center p-4">
        <SecureLogin />
      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-6 text-center z-10 opacity-40">
        <p className="text-[10px] text-slate-500 font-mono tracking-wide">
          © {new Date().getFullYear()} SecureSys Industries. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
