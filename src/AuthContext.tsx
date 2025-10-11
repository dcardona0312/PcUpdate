import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth'; // Importamos signOut
// Importamos la configuración de auth correcta.
// CORRECCIÓN DE RUTA Y EXTENSIÓN: Apuntamos a './firebase.ts' para asegurar que el módulo se resuelva correctamente.
import { auth } from './firebase.ts'; 

// 1. Definir la interfaz para el contexto
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  handleLogout: () => Promise<void>; // Añadimos la función de cierre de sesión
}

// Implementación del cierre de sesión
const logout = async (): Promise<void> => {
    console.log("Intentando cerrar sesión..."); // LOG DE DEPURACIÓN: Verifica si esta función se llama al presionar SALIR
    try {
        await signOut(auth);
        console.log("Cierre de sesión exitoso."); // LOG DE DEPURACIÓN
    } catch (error) {
        // MUY IMPORTANTE: Este error debe mostrarse si falla la conexión o el token
        console.error("Error al cerrar sesión:", error);
    }
}

// Valor por defecto (incluimos logout para evitar errores de undefined)
const AuthContext = createContext<AuthContextType | undefined>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    handleLogout: logout,
});

// 2. Componente Proveedor (Provider)
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Escucha los cambios de estado de autenticación (login/logout)
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        // Configuramos el usuario con el estado devuelto por Firebase.
        setUser(firebaseUser);
        setIsLoading(false);
      });
      
      // La función de limpieza se ejecuta cuando el componente se desmonta
      return () => unsubscribe();

    } catch (error) {
      // Manejo de error de inicialización.
      console.error("Error al inicializar Firebase Auth:", error);
      setIsLoading(false);
      return () => {}; 
    }

  }, []); // Se ejecuta solo una vez al inicio

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    handleLogout: logout, // Exponemos la función de cierre de sesión
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
