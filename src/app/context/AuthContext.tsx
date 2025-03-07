// src/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  tokenPayload: unknown | null;
  login: (token: string) => void;
  logout: () => void;
  setTokenPayload: (payload: unknown | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  tokenPayload: null,
  login: () => {},
  logout: () => {},
  setTokenPayload: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [tokenPayload, setTokenPayload] = useState<unknown | null>(null);

  // Función para decodificar el JWT, similar a la del NavBar
  const parseJwt = (token: string): unknown | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // Al montar el componente, intentamos recuperar el token de localStorage o sessionStorage
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      setTokenPayload(payload);
    }
  }, []);

  // Función para iniciar sesión: guarda el token y actualiza el payload
  const login = (token: string) => {
    localStorage.setItem('token', token);
    const payload = parseJwt(token);
    setTokenPayload(payload);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setTokenPayload(null);
  };

  return (
    <AuthContext.Provider value={{ tokenPayload, login, logout, setTokenPayload }}>
      {children}
    </AuthContext.Provider>
  );
};
