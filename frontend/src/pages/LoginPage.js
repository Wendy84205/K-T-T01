import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Building2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>

      {/* Header / Branding */}
      <div className="absolute top-4 left-6 flex items-start gap-4 z-20">
        <div className="flex -space-x-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Building2 className="text-white" size={18} strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <h2 className="text-[#0f172a] font-bold leading-tight tracking-wide text-sm">TechCorp</h2>
          <p className="text-[9px] text-[#64748b] font-bold uppercase tracking-widest mt-0.5">Enterprise Security</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex justify-center p-4">
        <SecureLogin />
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center z-10">
        <p className="text-[10px] text-[#64748b] font-medium tracking-wide">
          © {new Date().getFullYear()} TechCorp Systems & Infrastructure. Secure Authentication Endpoint.
        </p>
      </div>
    </div>
  );
}
