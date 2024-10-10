import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('token'); // Check if the token exists

  return isLoggedIn ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
