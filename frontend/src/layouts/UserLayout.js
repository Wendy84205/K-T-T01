import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MfaSetupBanner from '../components/MfaSetupBanner';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MfaSetupBanner user={user} />
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <Link to="/user/home" className="font-semibold text-slate-800">
          CyberSecure
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink
            to="/user/home"
            end
            className={({ isActive }) =>
              `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-slate-600 hover:text-slate-900'}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/user/profile"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-slate-600 hover:text-slate-900'}`
            }
          >
            Profile
          </NavLink>
          <span className="text-sm text-slate-500">
            {user?.firstName} {user?.lastName}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
