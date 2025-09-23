import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Loading from "../components/loading";

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading label="Please wait..." />;

  if (!isAuthenticated) {
    // send them to login and remember attempted route
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Optional role check
  if (roles?.length && !roles.some(r => user?.roles?.includes(r))) {
    return <Navigate to="/403" replace />; // or render a <Forbidden /> page
  }

  return <Outlet />;
}
