import React, { createContext, useState, useEffect } from "react";

// Crear el contexto de autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializa el estado con los valores de localStorage, si existen
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("authToken"));
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");

  // Función para iniciar sesión
  const login = (role, uid) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem("authToken", uid); // Guarda el token generado
    localStorage.setItem("userRole", role); // Guarda el rol del usuario
  };

  // Función para cerrar sesión
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole("");
    localStorage.removeItem("authToken"); // Elimina el token de localStorage
    localStorage.removeItem("userRole"); // Elimina el rol del usuario
  };

  // Verificar la autenticación al cargar el contexto
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
