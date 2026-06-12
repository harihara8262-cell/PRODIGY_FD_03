import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function AdminRoute({ children }) {
  const token = useStore((state) => state.token);
  const role = useStore((state) => state.role);

  if (!token || role !== 'admin') {
    // If not authenticated or not an admin, redirect back to landing page
    return <Navigate to="/" replace />;
  }

  return children;
}
