import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingSpinner } from "../common/LoadingSpinner/LoadingSpinner";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, roles, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated || !roles.includes("admin")) {
    console.log("Access denied - redirecting to home");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
