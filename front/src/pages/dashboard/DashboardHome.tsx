import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import AdminDashboard from './components/AdminDashboard';

// Componentes específicos para cada tipo de usuario (por implementar)
const ClientDashboard = () => (
  <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Bienvenido a tu Panel de Cliente</h2>
    <p className="text-gray-600">
      Aquí podrás gestionar tus citas, ver tu historial y conectar con profesionales.
    </p>
    {/* Aquí se añadirán más componentes específicos para clientes */}
  </div>
);

const PsychologistDashboard = () => (
  <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Bienvenido a tu Panel de Psicólogo</h2>
    <p className="text-gray-600">
      Aquí podrás gestionar tu agenda, ver tus pacientes y administrar tu perfil profesional.
    </p>
    {/* Aquí se añadirán más componentes específicos para psicólogos */}
  </div>
);

// Componente de estadísticas genérico (ejemplo)
const StatsCard = ({ title, value, icon, color }: { title: string, value: string, icon: string, color: string }) => (
  <motion.div 
    className={`p-4 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center`}
    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
    transition={{ duration: 0.2 }}
  >
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mr-4`}>
      <span className="text-xl">{icon}</span>
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  </motion.div>
);

const DashboardHome = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    // Determinar el saludo según la hora del día
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);
  
  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 } 
    }
  };
  
  // Renderizar componentes según el tipo de usuario
  const renderDashboardByUserType = () => {
    if (!user) return null;
    
    switch(user.user_type?.toLowerCase()) {
      case 'client':
        return <ClientDashboard />;
      case 'psychologist':
        return <PsychologistDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Bienvenido</h2>
            <p className="text-gray-600">
              No se ha podido determinar tu tipo de usuario. Por favor, contacta con soporte.
            </p>
          </div>
        );
    }
  };
  
  // Estadísticas de ejemplo (personalizar según tipo de usuario)
  const renderStats = () => {
    // No mostramos las estadísticas genéricas para el panel de admin
    // ya que ahora usamos el componente AdminDashboard especializado
    if (!user || user.user_type?.toLowerCase() === 'admin') return null;
    
    const statsItems = [];
    
    switch(user.user_type?.toLowerCase()) {
      case 'client':
        statsItems.push(
          { title: 'Citas Pendientes', value: '2', icon: '📅', color: 'bg-blue-100' },
          { title: 'Mensajes', value: '5', icon: '💬', color: 'bg-green-100' },
          { title: 'Psicólogos Favoritos', value: '3', icon: '⭐', color: 'bg-yellow-100' }
        );
        break;
      case 'psychologist':
        statsItems.push(
          { title: 'Citas Hoy', value: '4', icon: '📅', color: 'bg-blue-100' },
          { title: 'Pacientes Activos', value: '12', icon: '👥', color: 'bg-green-100' },
          { title: 'Valoración', value: '4.8', icon: '⭐', color: 'bg-yellow-100' }
        );
        break;
      default:
        return null;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statsItems.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
    );
  };
  
  // No renderizamos las secciones adicionales para el administrador
  const shouldShowAdditionalSections = () => {
    return !user || user.user_type?.toLowerCase() !== 'admin';
  };
  
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Encabezado con saludo personalizado */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {greeting}, {user?.first_name || 'Usuario'}
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </motion.div>
      
      {/* Tarjetas de estadísticas (solo para cliente y psicólogo) */}
      <motion.div variants={itemVariants}>
        {renderStats()}
      </motion.div>
      
      {/* Contenido principal específico según tipo de usuario */}
      <motion.div variants={itemVariants}>
        {renderDashboardByUserType()}
      </motion.div>
      
      {/* Sección adicional (solo para cliente y psicólogo) */}
      {shouldShowAdditionalSections() && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
          variants={itemVariants}
        >
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {/* Aquí se pueden añadir componentes de actividad reciente */}
              <p className="text-gray-500 text-sm italic">No hay actividad reciente para mostrar.</p>
            </div>
          </div>
          
          <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Próximos Eventos</h3>
            <div className="space-y-4">
              {/* Aquí se pueden añadir componentes de próximos eventos */}
              <p className="text-gray-500 text-sm italic">No hay eventos próximos para mostrar.</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardHome;