import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth'; // Eliminamos signInAnonymously de aquí
import { auth } from './firebase'; // Importamos el servicio de auth

// 1. Definir la interfaz para el contexto
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Componente Proveedor (Provider)
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Escucha los cambios de estado de autenticación (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Configuramos el usuario con el estado devuelto por Firebase.
      // Si firebaseUser es null (no logueado), el formulario de login se mostrará.
      setUser(firebaseUser);
      setIsLoading(false);
    });

    // La función de limpieza se ejecuta cuando el componente se desmonta
    return () => unsubscribe();
  }, []); // Se ejecuta solo una vez al inicio

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
  };

  // 3. Proporciona el contexto a la aplicación
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};