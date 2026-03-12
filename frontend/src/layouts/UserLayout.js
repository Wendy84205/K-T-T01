import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MfaSetupBanner from '../components/MfaSetupBanner';

export default function UserLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0e1621]">
      <MfaSetupBanner user={user} />
      <main className="h-screen overflow-hidden">
         <Outlet />
      </main>
    </div>
  );
}
