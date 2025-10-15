// src/auth/RequireAdmin.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAdmin({ children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a spinner component

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    // send them home or a 403 page
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
