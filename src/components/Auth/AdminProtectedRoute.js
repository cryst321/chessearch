import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
    const { isLoggedIn, isAdmin, isLoading } = useAuth();
    const location = useLocation();
    if (isLoading) {
        return <div>Loading authentication status...</div>;}
    if (!isLoggedIn || !isAdmin) {
        console.warn("Unauthorized access attempt to admin route:", location.pathname);
        return <Navigate to="/" state={{ from: location }} replace />;}
    return children;
};

export default AdminProtectedRoute;