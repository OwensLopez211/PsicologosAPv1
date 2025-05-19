import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientService from '../services/PatientService';
import { Patient as TypePatient } from '../types/patients';
import toastService from '../services/toastService';

interface UsePatientsResult {
  patients: TypePatient[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UsePatientsOptions {
  userType?: string; // 'admin' o 'psychologist'
  useMocks?: boolean;
}

// Número máximo de intentos de carga
const MAX_RETRIES = 3;

export const usePatients = (options?: UsePatientsOptions): UsePatientsResult => {
  const { token, user } = useAuth();
  const [patients, setPatients] = useState<TypePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Determinar tipo de usuario
  const userType = options?.userType || user?.user_type || 'client';
  const useMocks = options?.useMocks || false;

  // Verificamos manualmente si hay token en localStorage si no se proporciona por contexto
  const getToken = useCallback(() => {
    if (token) return token;
    
    // Si no hay token en contexto, intentamos obtenerlo de localStorage
    const storedToken = localStorage.getItem('token');
    console.log(`Token from localStorage: ${!!storedToken}`);
    return storedToken;
  }, [token]);

  const fetchPatients = useCallback(async (showLoadingState = true) => {
    const currentToken = getToken();
    
    // Si no hay token o el tipo de usuario no es válido, no hacemos nada
    if (!currentToken || !userType || (userType !== 'admin' && userType !== 'psychologist')) {
      console.error(`Cannot fetch patients: token=${!!currentToken}, userType=${userType}`);
      setError('No se puede cargar la lista de pacientes: credenciales inválidas');
      setLoading(false);
      return;
    }

    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);
      
      // Si estamos en desarrollo y se solicitan mocks, usar datos de ejemplo
      if (useMocks && import.meta.env.DEV) {
        await loadMockPatients();
        return;
      }
      
      console.log(`Fetching patients with userType: ${userType}, token: ${currentToken.substring(0, 10)}...`);
      
      // Determinar el tipo de usuario para la llamada al servicio
      const data = await PatientService.getAllPatients(currentToken, userType);
      
      console.log(`Received ${data.length} patients`);
      
      setPatients(data);
      setRetryCount(0); // Resetear el contador de intentos después de un éxito
    } catch (err) {
      console.error('Error fetching patients:', err);
      
      // Si tenemos menos de MAX_RETRIES intentos, intentamos de nuevo automáticamente
      if (retryCount < MAX_RETRIES) {
        console.log(`Retry attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        setRetryCount(prev => prev + 1);
        
        // Esperar un poco antes de intentar de nuevo (tiempo exponencial)
        const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s...
        setTimeout(() => fetchPatients(false), retryDelay);
      } else {
        const errorMessage = 'Error al cargar los pacientes. Por favor, intente de nuevo más tarde.';
        setError(errorMessage);
        toastService.error(errorMessage);
        
        // Si estamos en modo desarrollo, cargar mocks como fallback
        if (import.meta.env.DEV) {
          await loadMockPatients();
        }
      }
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [token, userType, useMocks, retryCount, getToken]);
  
  const loadMockPatients = useCallback(async () => {
    // Mock data para testing
    const mockPatients: TypePatient[] = [
      {
        id: 1,
        user: {
          id: 101,
          first_name: 'María',
          last_name: 'González',
          email: 'maria.gonzalez@example.com',
          is_active: true
        },
        profile_image: '/default-avatar.png',
        rut: '12.345.678-9',
        region: 'Metropolitana',
        last_appointment_date: '2024-05-05',
        last_appointment_status: 'COMPLETED',
        next_appointment_date: '2024-05-20',
        next_appointment_status: 'CONFIRMED',
        total_appointments: 5
      },
      {
        id: 2,
        user: {
          id: 102,
          first_name: 'Juan',
          last_name: 'Pérez',
          email: 'juan.perez@example.com',
          is_active: true
        },
        profile_image: null,
        rut: '9.876.543-2',
        region: 'Valparaíso',
        last_appointment_date: '2024-04-28',
        last_appointment_status: 'COMPLETED',
        next_appointment_date: null,
        next_appointment_status: null,
        total_appointments: 3
      },
      {
        id: 3,
        user: {
          id: 103,
          first_name: 'Ana',
          last_name: 'Martínez',
          email: 'ana.martinez@example.com',
          is_active: true
        },
        profile_image: null,
        rut: '15.432.987-6',
        region: 'Biobío',
        last_appointment_date: null,
        last_appointment_status: null,
        next_appointment_date: '2024-05-15',
        next_appointment_status: 'PAYMENT_VERIFIED',
        total_appointments: 1
      },
    ];
    
    console.log('Loading mock patients');
    setPatients(mockPatients);
    setLoading(false);
  }, []);

  // Cargar datos solo cuando cambian las dependencias relevantes
  useEffect(() => {
    const currentToken = getToken();
    console.log('usePatients effect running with token and userType', { token: !!currentToken, userType });
    
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    
    // No intentar cargar si no hay token o tipo de usuario
    if (!currentToken || !userType) {
      console.log('Missing token or userType, skipping fetch');
      if (isMounted) {
        setLoading(false);
      }
      return;
    }
    
    const load = async () => {
      if (isMounted) {
        try {
          await fetchPatients();
        } catch (err) {
          console.error('Error during patient fetch in effect:', err);
          // Si ocurre un error, intentamos una vez más después de un breve retraso
          if (isMounted) {
            timeoutId = setTimeout(() => {
              console.log('Attempting one more fetch after delay');
              fetchPatients(false);
            }, 1500);
          }
        }
      }
    };
    
    load();
    
    // Cleanup function para evitar cambios de estado en componentes desmontados
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchPatients, token, userType, getToken]); // Incluimos token, userType y getToken como dependencias

  return { patients, loading, error, refetch: fetchPatients };
};