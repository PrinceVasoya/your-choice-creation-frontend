import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user, isInitializing } = useAuth();
  const token = localStorage.getItem("token");

  console.log("ProtectedRoute checking token");
  console.log("Token found:", !!token);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Verifying Session...</p>
      </div>
    );
  }

  if (!token) {
    localStorage.setItem("redirectAfterLogin", window.location.pathname + window.location.search);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
