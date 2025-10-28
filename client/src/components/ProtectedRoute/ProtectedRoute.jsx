import { Navigate } from "react-router-dom";
import { errorToast } from "../../utils/toast";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!token) {
      errorToast("Debes iniciar sesión para acceder");
    } else if (allowedRoles && !allowedRoles.includes(user?.role)) {
      errorToast("No tienes permiso para acceder a esta página");
    }
  }, [loading, token, user, allowedRoles]);

  if (loading) return null;
  
  if (!token) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
};