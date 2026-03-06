import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MfaSetupBanner from '../components/MfaSetupBanner';
import { Building2, User, LogOut } from 'lucide-react';

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-panel)] transition-colors duration-300">
      <MfaSetupBanner user={user} />
      <header className="bg-[var(--bg-main)] border-b border-[var(--border-color)] px-8 py-4 flex items-center justify-between shadow-[var(--shadow)] sticky top-0 z-[100]">
        <Link to="/user/home" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-[0_4px_12px_rgba(0,123,255,0.3)] transition-transform group-hover:scale-105">
            <Building2 size={19} color="#fff" />
          </div>
          <span className="font-black text-xl text-[var(--text-main)] tracking-tighter uppercase">TechCorp</span>
        </Link>
        <nav className="flex items-center gap-8">
          <NavLink
            to="/user/home"
            end
            className={({ isActive }) =>
              `text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`
            }
          >
            Communication
          </NavLink>
          <NavLink
            to="/user/profile"
            className={({ isActive }) =>
              `text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`
            }
          >
            Identity
          </NavLink>
          <div className="h-4 w-[1px] bg-[var(--border-color)]"></div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-black text-[var(--text-main)] leading-none">{user?.firstName} {user?.lastName}</span>
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase mt-0.5 tracking-widest opacity-70">Authenticated User</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[#dc2626] hover:bg-[#fff5f5] hover:border-[#feb2b2] dark:hover:bg-[#451212] transition-all"
              title="Deauthorize Session"
            >
              <LogOut size={18} />
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        <Outlet />
      </main>
    </div>
  );
}
