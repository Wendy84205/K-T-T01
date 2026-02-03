import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ManagerRoute from './components/ManagerRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminLayout from './layouts/AdminLayout';
import ManageLayout from './layouts/ManageLayout';
import UserLayout from './layouts/UserLayout';
import AdminHomePage from './pages/admin/AdminHomePage';
import ManageHomePage from './pages/manage/ManageHomePage';
import UsersPage from './pages/admin/UsersPage';
import TeamsPage from './pages/admin/TeamsPage';
import SecurityPage from './pages/admin/SecurityPage';
import UserHomePage from './pages/user/UserHomePage';
import ProfilePage from './pages/user/ProfilePage';
import LogsPage from './pages/admin/LogsPage';
import AddUserPage from './pages/admin/AddUserPage';
import NetworkPage from './pages/admin/NetworkPage';
import SecurityRulesPage from './pages/admin/SecurityRulesPage';
import SettingsPage from './pages/admin/SettingsPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* USER: Full-screen chat interface */}
          <Route
            path="/user/home"
            element={
              <ProtectedRoute>
                <UserHomePage />
              </ProtectedRoute>
            }
          />

          {/* USER: /user/drive with layout */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/user/home" replace />} />
            <Route path="drive" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* MANAGER: /manage/dashboard */}
          <Route
            path="/manage"
            element={
              <ManagerRoute>
                <ManageLayout />
              </ManagerRoute>
            }
          >
            <Route index element={<Navigate to="/manage/dashboard" replace />} />
            <Route path="dashboard" element={<ManageHomePage />} />
          </Route>

          {/* ADMIN: /admin/dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminHomePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/add" element={<AddUserPage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="network" element={<NetworkPage />} />
            <Route path="rules" element={<SecurityRulesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/user/drive" replace />} />
          <Route path="/dashboard" element={<Navigate to="/user/drive" replace />} />
          <Route path="*" element={<Navigate to="/user/drive" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
