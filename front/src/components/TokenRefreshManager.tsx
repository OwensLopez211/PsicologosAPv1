// TokenRefreshManager.tsx - versión simplificada
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

const TokenRefreshManager = () => {
  const { refreshUserSession, setToken } = useAuth();

  // Verificar y sincronizar el token al montar el componente
  useEffect(() => {
    const syncStoredToken = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log('TokenRefreshManager: Sincronizando token al iniciar');
        setToken(storedToken);
        return true;
      }
      return false;
    };

    // Ejecutar sincronización inmediatamente
    syncStoredToken();

    // También configurar un intervalo para verificar regularmente
    const syncInterval = setInterval(syncStoredToken, 10000);
    
    return () => {
      clearInterval(syncInterval);
    };
  }, [setToken]);

  useEffect(() => {
    let refreshTimeout: number | null = null;
    let checkInterval: number | null = null;

    const clearTimers = () => {
      if (refreshTimeout) {
        window.clearTimeout(refreshTimeout);
        refreshTimeout = null;
      }
      if (checkInterval) {
        window.clearInterval(checkInterval);
        checkInterval = null;
      }
    };

    const setupRefreshTimer = (token: string) => {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        
        // Refrescar 5 minutos antes de que expire
        const timeUntilRefresh = expirationTime - currentTime - (5 * 60 * 1000);
        
        clearTimers();
        
        if (timeUntilRefresh > 0) {
          console.log(`Token expira en ${Math.floor(timeUntilRefresh / 60000)} minutos. Programando refresh.`);
          refreshTimeout = window.setTimeout(() => {
            refreshUserSession().then(() => {
              const newToken = localStorage.getItem('token');
              if (newToken) {
                setupRefreshTimer(newToken);
              }
            });
          }, timeUntilRefresh);
        } else {
          console.log('Token necesita refresh inmediato');
          refreshUserSession();
        }
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    };
    
    // Función inicial que verifica el token
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setupRefreshTimer(token);
        // Asegurar que el contexto tenga el token
        setToken(token);
      }
    };
    
    // Verificar token al montar
    checkToken();
    
    // Establecer un intervalo para verificar periódicamente (por si cambia externamente)
    checkInterval = window.setInterval(() => {
      checkToken();
    }, 60000);
    
    return () => {
      clearTimers();
    };
  }, [refreshUserSession, setToken]);

  // Agregar un listener para detectar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue) {
        console.log('Token actualizado en localStorage, sincronizando...');
        setToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setToken]);

  return null;
};

export default TokenRefreshManager;