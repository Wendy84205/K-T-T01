import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

export default function AdminRoute({ children }) {
  const { isAdmin } = useAuth();

  return (
    <ProtectedRoute>
      {!isAdmin ? <Navigate to="/dashboard" replace /> : children}
    </ProtectedRoute>
  );
}
