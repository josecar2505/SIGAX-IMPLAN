import React, { createContext, useState, useEffect } from "react";

// Crear el contexto de autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Función para iniciar sesión
  const login = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem("authToken", "your-auth-token"); // Guarda un token o un identificador único
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
    if (token && role) { // Verifica que ambos existan
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
