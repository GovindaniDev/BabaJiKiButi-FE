import { Navigate, Outlet, useLocation } from "react-router-dom";

import Loading from "@/components/loading";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="Please wait..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.some((r) => user?.roles?.includes(r))) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
