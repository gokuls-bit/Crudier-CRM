import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasPermission } from '../config/roles.config';

const RoleRoute = ({ allowedRoles }) => {
  const userString = localStorage.getItem('crudier_user');
  
  if (!userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);

  if (!hasPermission(user.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
