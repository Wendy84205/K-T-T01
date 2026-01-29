import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

export default function ManagerRoute({ children }) {
    const { isManager } = useAuth();

    return (
        <ProtectedRoute>
            {!isManager ? <Navigate to="/dashboard" replace /> : children}
        </ProtectedRoute>
    );
}
