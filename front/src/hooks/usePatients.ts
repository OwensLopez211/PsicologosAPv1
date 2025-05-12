import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientService, { Patient as ServicePatient } from '../services/PatientService';
import { Patient as TypePatient } from '../types/patients';

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

export const usePatients = (options?: UsePatientsOptions): UsePatientsResult => {
  const { token, user } = useAuth();
  const [patients, setPatients] = useState<TypePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Determinar tipo de usuario
  const userType = options?.userType || user?.user_type || 'client';
  const useMocks = options?.useMocks || false;

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Si estamos en desarrollo y se solicitan mocks, usar datos de ejemplo
      if (useMocks && import.meta.env.DEV) {
        await loadMockPatients();
        return;
      }
      
      // Determinar el tipo de usuario para la llamada al servicio
      const data = await PatientService.getAllPatients(token, userType);
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Error al cargar los pacientes. Por favor, intente de nuevo más tarde.');
      
      // Si estamos en modo desarrollo, cargar mocks como fallback
      if (import.meta.env.DEV) {
        await loadMockPatients();
      }
    } finally {
      setLoading(false);
    }
  }, [token, userType, useMocks]);
  
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
    
    setPatients(mockPatients);
    setLoading(false);
  }, []);

  // Cargar datos solo cuando cambian las dependencias relevantes
  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      if (isMounted) {
        await fetchPatients();
      }
    };
    
    load();
    
    // Cleanup function para evitar cambios de estado en componentes desmontados
    return () => {
      isMounted = false;
    };
  }, [fetchPatients]); // fetchPatients ya incluye las dependencias token y userType

  return { patients, loading, error, refetch: fetchPatients };
};