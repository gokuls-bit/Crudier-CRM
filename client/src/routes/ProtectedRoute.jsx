import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check auth status from localStorage or store
  const token = localStorage.getItem('crudier_token');
  const user = localStorage.getItem('crudier_user');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
