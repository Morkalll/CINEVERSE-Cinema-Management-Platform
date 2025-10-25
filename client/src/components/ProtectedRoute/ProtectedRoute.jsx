import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect } from "react";


export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); 
  
  useEffect(() => {
  console.log("Token:", token);
  console.log("Rol:", userRole);
}, [token, userRole]);

  
  if (!token) {
    useEffect(() => {
      toast.error("Debes iniciar sesión para acceder");
    }, []);
    return <Navigate to="/login" replace />;
  }
  
  if (userRole !== "admin" && userRole !== "sysadmin") {
    useEffect(() => {
        toast.error("No tienes permiso para acceder a esta página");
    }, [])
    return <Navigate to="/home" replace />;
  }
  
  
  return children;
};