import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PatientService, { Patient } from '../services/PatientService';

interface UsePatientsResult {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePatients = (): UsePatientsResult => {
  const { token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await PatientService.getAllPatients(token);
      setPatients(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Error al cargar los pacientes. Por favor, intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [token]);

  return { patients, loading, error, refetch: fetchPatients };
};