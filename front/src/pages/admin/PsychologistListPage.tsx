import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PsychologistService, { Psychologist } from '../../services/PsychologistService';
import { motion } from 'framer-motion';
import { 
  CheckBadgeIcon as BadgeCheckIcon, 
  ExclamationCircleIcon, 
  ClockIcon,
  PhoneIcon,
  AcademicCapIcon,
  IdentificationIcon,
  UserCircleIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import PageTransition from '../../components/animations/PageTransition';

const PsychologistListPage = () => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Filtrar psicólogos según búsqueda y filtro de estado
  const filteredPsychologists = psychologists.filter(psych => {
    const matchesSearch = searchTerm === '' || 
      `${psych.user.first_name} ${psych.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (psych.user.email && psych.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || psych.verification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <PageTransition>
      <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8">
        {/* Header mejorado */}
        <motion.div 
          className="mb-4 md:mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h1 
            className="text-2xl md:text-3xl font-bold text-[#2A6877] mb-1 md:mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            Gestión de Psicólogos
          </motion.h1>
        </motion.div>

        {/* Sección de búsqueda y filtros mejorada */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o email" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent"
              />
            </div>
            <div className="relative min-w-[180px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A6877] focus:border-transparent rounded-lg appearance-none bg-white text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="VERIFIED">Verificados</option>
                <option value="PENDING">Pendientes</option>
                <option value="REJECTED">Rechazados</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {filteredPsychologists.length} {filteredPsychologists.length === 1 ? 'resultado' : 'resultados'} encontrados
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2A6877]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPsychologists.map((psychologist) => (
              <motion.div 
                key={psychologist.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="relative">
                        {psychologist.profile_image ? (
                          <img 
                            src={psychologist.profile_image} 
                            alt={`${psychologist.user.first_name} ${psychologist.user.last_name}`}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-[#2A6877]"
                          />
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-[#2A6877]">
                            <UserCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                          {psychologist.user.first_name} {psychologist.user.last_name}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500">{psychologist.user.email}</p>
                        <div className="mt-1">
                          {getStatusBadge(psychologist.verification_status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <AcademicCapIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                      <span className="font-medium">Título:</span>
                      <span className="ml-2 truncate">{psychologist.professional_title || 'No especificado'}</span>
                    </div>
                    
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <IdentificationIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                      <span className="font-medium">RUT:</span>
                      <span className="ml-2">{psychologist.rut || 'No especificado'}</span>
                    </div>
                    
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                      <span className="font-medium">Teléfono:</span>
                      <span className="ml-2">{psychologist.phone || 'No especificado'}</span>
                    </div>
                    
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2 text-[#2A6877]" />
                      <span className="font-medium">Ubicación:</span>
                      <span className="ml-2 truncate">
                        {psychologist.city && psychologist.region 
                          ? `${psychologist.city}, ${psychologist.region}` 
                          : 'No especificado'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-5 flex justify-end">
                    <Link 
                      to={`/admin/dashboard/psychologists/${psychologist.id}`}
                      className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2A6877] text-white text-xs sm:text-sm font-medium rounded-md hover:bg-[#1d4e5f] transition-colors"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 sm:px-5 py-2 sm:py-3 text-right text-xs text-gray-500">
                  Registro: {new Date(psychologist.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!loading && filteredPsychologists.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-sm sm:text-base">No se encontraron psicólogos que coincidan con los criterios de búsqueda</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-[#2A6877] text-white text-sm rounded-md hover:bg-[#1d4e5f] transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PsychologistListPage;