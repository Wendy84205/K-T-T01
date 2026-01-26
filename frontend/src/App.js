import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import AdminHomePage from './pages/admin/AdminHomePage';
import UsersPage from './pages/admin/UsersPage';
import TeamsPage from './pages/admin/TeamsPage';
import SecurityPage from './pages/admin/SecurityPage';
import UserHomePage from './pages/user/UserHomePage';
import ProfilePage from './pages/user/ProfilePage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="home" element={<UserHomePage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminHomePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
