// PrivateRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userRole } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Si no está autenticado, redirige a login
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" />; // Si no tiene el rol correcto, redirige a una página de "No autorizado"
  }

  return children; // Si está autenticado, muestra el contenido
};

export default PrivateRoute;
