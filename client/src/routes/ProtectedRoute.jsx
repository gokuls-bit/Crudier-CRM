import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../store/auth.store';

const ProtectedRoute = () => {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
