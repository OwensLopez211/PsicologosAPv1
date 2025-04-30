import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import AppointmentModal from './appointmentModal';
import { useAuth } from '../../context/AuthContext';

interface ProfileHeaderProps {
  name: string;
  title: string;
  registrationNumber: string;
  profileImage: string;
  psychologistId: number;
  verificationStatus?: string;
}

const ProfileHeader: FC<ProfileHeaderProps> = ({
  name,
  title,
  registrationNumber,
  profileImage,
  psychologistId,
  verificationStatus = 'VERIFIED'
}) => {
  const [showModal, setShowModal] = useState(false);
  const [sessionPrice, setSessionPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const showScheduleButton = isAuthenticated && user?.user_type !== 'psychologist';

  // Efecto para cargar el precio de la sesión
  useEffect(() => {
    const fetchSessionPrice = async () => {
      if (!psychologistId) return;
      
      setLoading(true);
      try {
        // No necesitamos incluir headers de autenticación ya que ahora el endpoint es público
        const response = await axios.get(`/api/pricing/psychologist-prices/psychologist/${psychologistId}/`);
        if (response.data && response.data.price !== undefined) {
          setSessionPrice(response.data.price);
        }
      } catch (error) {
        console.error('Error al obtener el precio de la sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionPrice();
  }, [psychologistId]);

  // Formatear el precio para mostrarlo en pesos chilenos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <motion.div 
        className="bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:gap-10">
            {/* Profile Image Section */}
            <div className="md:w-1/4 relative flex justify-center">
              <motion.div
                className="relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <img 
                  src={profileImage}
                  alt={name}
                  className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-lg border-4 border-white"
                />
                {verificationStatus === 'VERIFIED' && (
                  <motion.div 
                    className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                      <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      Verificado
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
            
            {/* Info Section */}
            <div className="md:w-3/4 mt-6 md:mt-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                  <motion.h1 
                    className="text-3xl font-bold text-gray-900"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {name}
                  </motion.h1>
                  <motion.p 
                    className="text-[#2A6877] font-medium text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {title}
                  </motion.p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Mostrar el precio de la sesión con un diseño más destacado */}
                    {sessionPrice !== null && (
                      <motion.div
                        className="flex items-center bg-gradient-to-r from-[#2A6877] to-[#3a8a9e] text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        whileHover={{ y: -2, scale: 1.03 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="whitespace-nowrap">Valor sesión: </span>
                        <span className="ml-1 font-bold">{formatPrice(sessionPrice)}</span>
                      </motion.div>
                    )}
                    
                    {loading && (
                      <div className="inline-flex items-center text-gray-500 text-sm">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#2A6877]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cargando precio...
                      </div>
                    )}
                  
                    {registrationNumber && (
                      <motion.div 
                        className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                        Registro: {registrationNumber}
                      </motion.div>
                    )}
                  </div>
                </div>
                {showScheduleButton ? (
                  <motion.button 
                    className="bg-[#2A6877] text-white px-6 py-3 rounded-lg hover:bg-[#235A67] transition-colors mt-6 md:mt-0 shadow-md hover:shadow-lg font-medium flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    onClick={() => setShowModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Agendar Consulta
                  </motion.button>
                ) : !isAuthenticated ? (
                  <motion.div
                    className="mt-6 md:mt-0 bg-yellow-50 border border-yellow-200 text-yellow-800 px-5 py-3 rounded-lg flex items-center gap-2 shadow-sm font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                    </svg>
                    Debes iniciar sesión para ver la disponibilidad y agendar una consulta.
                  </motion.div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appointment Modal */}
      {showScheduleButton && showModal && (
        <AppointmentModal 
          psychologistId={psychologistId}
          psychologistName={name}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ProfileHeader;