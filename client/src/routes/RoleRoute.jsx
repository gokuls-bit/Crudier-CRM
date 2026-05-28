import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasPermission } from '../config/roles.config';
import { useAuthStore } from '../store/auth.store';

const RoleRoute = ({ allowedRoles }) => {
  const user = useAuthStore((state) => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(user.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
