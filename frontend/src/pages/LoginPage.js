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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <AuthContainer />
    </div>
  );
}
