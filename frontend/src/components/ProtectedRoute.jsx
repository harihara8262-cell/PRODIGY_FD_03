import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function ProtectedRoute({ children }) {
  const token = useStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    // Redirect to Sign In while preserving original navigation target
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
