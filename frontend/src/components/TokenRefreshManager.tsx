// TokenRefreshManager.tsx - versión simplificada
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
}

const TokenRefreshManager = () => {
  const { refreshUserSession } = useAuth();

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
      }
    };
    
    // Verificar token al montar
    checkToken();
    
    // Establecer un intervalo para verificar periódicamente (por si cambia externamente)
    checkInterval = window.setInterval(() => {
      checkToken();
    }, 60000); // Verificar cada minuto
    
    // Limpieza en desmontaje
    return () => {
      clearTimers();
    };
  }, [refreshUserSession]);
  
  return null;
};

export default TokenRefreshManager;