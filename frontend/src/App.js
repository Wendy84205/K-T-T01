import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { E2EEProvider } from './context/E2EEContext';
import { CallProvider } from './context/CallContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ManagerRoute from './components/ManagerRoute';
import CallIncomingBanner from './components/CallIncomingBanner';

import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLayout from './layouts/AdminLayout';
import ManageLayout from './layouts/ManageLayout';
import AdminHomePage from './pages/admin/AdminHomePage';
import ManageOverview from './pages/manage/ManageOverview';
import ManageChat from './pages/manage/ManageChat';
import ManageTeam from './pages/manage/ManageTeam';
import ManageProjects from './pages/manage/ManageProjects';
import ManageDocuments from './pages/manage/ManageDocuments';
import ManageReports from './pages/manage/ManageReports';
import ManageSettings from './pages/manage/ManageSettings';
import UserLayout from './layouts/UserLayout';
import UsersPage from './pages/admin/UsersPage';
import TeamsPage from './pages/admin/TeamsPage';
import SecurityPage from './pages/admin/SecurityPage';
import UserHomePage from './pages/user/UserHomePage';
import UserDashboard from './pages/user/UserDashboard';
import DocumentsPage from './pages/user/DocumentsPage';
import UserAnalytics from './pages/user/UserAnalytics';
import ProfilePage from './pages/user/ProfilePage';
import LogsPage from './pages/admin/LogsPage';
import AddUserPage from './pages/admin/AddUserPage';
import NetworkPage from './pages/admin/NetworkPage';
import SecurityRulesPage from './pages/admin/SecurityRulesPage';
import SettingsPage from './pages/admin/SettingsPage';

import './App.css';

const DashboardRedirect = () => {
  const { user, isAdmin, isManager, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isManager) return <Navigate to="/manage/dashboard" replace />;
  return <Navigate to="/user/home" replace />;
};

function App() {
  return (
    <AuthProvider>
      <E2EEProvider>
        <BrowserRouter>
          <CallProvider>
            <CallIncomingBanner />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* USER Routes */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/user/home" replace />} />
                <Route path="dashboard" element={<Navigate to="/user/home" replace />} />
                <Route path="home" element={<UserHomePage />} />
                <Route path="drive" element={<Navigate to="/user/home" state={{ initialTab: 'vault' }} replace />} />
                <Route path="analytics" element={<Navigate to="/user/home" state={{ initialTab: 'analytics' }} replace />} />
                <Route path="profile" element={<Navigate to="/user/home" state={{ initialTab: 'settings' }} replace />} />
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
                <Route path="dashboard" element={<ManageOverview />} />
                <Route path="chat" element={<ManageChat />} />
                <Route path="team" element={<ManageTeam />} />
                <Route path="projects" element={<ManageProjects />} />
                <Route path="documents" element={<ManageDocuments />} />
                <Route path="reports" element={<ManageReports />} />
                <Route path="settings" element={<ManageSettings />} />
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

              <Route path="/" element={<DashboardRedirect />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="*" element={<DashboardRedirect />} />
            </Routes>
          </CallProvider>
        </BrowserRouter>
      </E2EEProvider>
    </AuthProvider>
  );
}

export default App;
