import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MfaSetupBanner from '../components/MfaSetupBanner';

const nav = [
    { to: '/manage/dashboard', label: 'Dashboard', end: true },
    { to: '/manage/documents', label: 'Documents' },
    { to: '/manage/reports', label: 'Reports' },
];

export default function ManageLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <MfaSetupBanner user={user} />
            <div className="flex flex-1 min-h-0">
                <aside
                    className={`${sidebarOpen ? 'w-56' : 'w-16'
                        } bg-slate-800 text-white flex flex-col transition-all duration-200 shrink-0`}
                >
                    <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                        <Link to="/manage/dashboard" className="font-semibold truncate">
                            {sidebarOpen ? 'Manager Portal' : 'MP'}
                        </Link>
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-1 rounded hover:bg-slate-700"
                            aria-label="Toggle sidebar"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {sidebarOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                )}
                            </svg>
                        </button>
                    </div>
                    <nav className="flex-1 py-4">
                        {nav.map(({ to, label, end }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                    `block px-4 py-2.5 mx-2 rounded-lg transition-colors ${isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-700 text-slate-300'
                                    }`
                                }
                            >
                                {sidebarOpen ? label : label.slice(0, 1)}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1 flex flex-col min-w-0">
                    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
                        <h1 className="text-lg font-medium text-slate-800">Management</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600">
                                {user?.firstName} {user?.lastName} ({user?.email})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm px-3 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                            >
                                Logout
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 p-6 overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
