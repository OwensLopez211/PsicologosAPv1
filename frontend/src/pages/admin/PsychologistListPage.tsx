import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PsychologistService, { Psychologist } from '../../services/PsychologistService';
import { 
  CheckBadgeIcon as BadgeCheckIcon, 
  ExclamationCircleIcon, 
  ClockIcon,
  PhoneIcon,
  AcademicCapIcon,
  IdentificationIcon,
  UserCircleIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import PageTransition from '../../components/animations/PageTransition';

const PsychologistListPage = () => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPsychologists();
  }, []);

  const fetchPsychologists = async () => {
    try {
      setLoading(true);
      const data = await PsychologistService.getAllPsychologists();
      setPsychologists(data);
    } catch (error) {
      console.error('Error fetching psychologists:', error);
      toast.error('Error al cargar la lista de psicólogos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <BadgeCheckIcon className="w-4 h-4 mr-1" />
            Verificado
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="w-4 h-4 mr-1" />
            Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-4 h-4 mr-1" />
            Pendiente
          </span>
        );
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Psicólogos</h1>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="Buscar por nombre o email" 
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877]"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A6877]">
              <option value="all">Todos los estados</option>
              <option value="VERIFIED">Verificados</option>
              <option value="PENDING">Pendientes</option>
              <option value="REJECTED">Rechazados</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A6877]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {psychologists.map((psychologist) => (
              <div 
                key={psychologist.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        {psychologist.profile_image ? (
                          <img 
                            src={psychologist.profile_image} 
                            alt={`${psychologist.user.first_name} ${psychologist.user.last_name}`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#2A6877]"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-[#2A6877]">
                            <UserCircleIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {psychologist.user.first_name} {psychologist.user.last_name}
                        </h2>
                        <p className="text-sm text-gray-500">{psychologist.user.email}</p>
                        <div className="mt-1">
                          {getStatusBadge(psychologist.verification_status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <AcademicCapIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                      <span className="font-medium">Título:</span>
                      <span className="ml-2 truncate">{psychologist.professional_title || 'No especificado'}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <IdentificationIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                      <span className="font-medium">RUT:</span>
                      <span className="ml-2">{psychologist.rut || 'No especificado'}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                      <span className="font-medium">Teléfono:</span>
                      <span className="ml-2">{psychologist.phone || 'No especificado'}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                      <span className="font-medium">Ubicación:</span>
                      <span className="ml-2 truncate">
                        {psychologist.city && psychologist.region 
                          ? `${psychologist.city}, ${psychologist.region}` 
                          : 'No especificado'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex justify-end">
                    <Link 
                      to={`/admin/dashboard/psychologists/${psychologist.id}`}
                      className="inline-flex items-center px-4 py-2 bg-[#2A6877] text-white text-sm font-medium rounded-md hover:bg-[#1d4e5f] transition-colors"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 text-right text-xs text-gray-500">
                  Registro: {new Date(psychologist.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && psychologists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron psicólogos registrados</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PsychologistListPage;