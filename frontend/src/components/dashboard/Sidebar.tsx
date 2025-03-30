import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  UserIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  userType?: string;
  onClose?: () => void;
}

const Sidebar = ({ userType, onClose }: SidebarProps) => {
  const location = useLocation();
  
  // Normalize user type to uppercase for consistency with the menu items
  const normalizedUserType = userType?.toUpperCase() as 'CLIENT' | 'PSYCHOLOGIST' | 'ADMIN';
  
  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Inicio', icon: HomeIcon },
      { path: '/dashboard/profile', label: 'Mi Perfil', icon: UserIcon },
    ];

    const roleSpecificItems = {
      CLIENT: [
        { path: '/dashboard/appointments', label: 'Mis Citas', icon: CalendarIcon },
        { path: '/dashboard/psychologists', label: 'Buscar Psicólogos', icon: MagnifyingGlassIcon },
      ],
      PSYCHOLOGIST: [
        { path: '/dashboard/schedule', label: 'Mi Agenda', icon: CalendarIcon },
        { path: '/dashboard/patients', label: 'Mis Pacientes', icon: UsersIcon },
        { path: '/dashboard/documents', label: 'Mis Documentos', icon: DocumentTextIcon },
      ],
      ADMIN: [
        { path: '/dashboard/users', label: 'Usuarios', icon: UsersIcon },
        { path: '/dashboard/psychologists', label: 'Psicólogos', icon: UserIcon },
        { path: '/dashboard/verifications', label: 'Verificaciones', icon: ClipboardDocumentCheckIcon },
        { path: '/dashboard/reports', label: 'Reportes', icon: ChartBarIcon },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[normalizedUserType] || roleSpecificItems.CLIENT)];
  };

  return (
    <aside className="h-full bg-white shadow-lg">
      <div className="h-full flex flex-col">
        <nav className="flex-1 py-4 space-y-1">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="relative group"
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 group-hover:text-[#2A6877] transition-colors ${
                    isActive ? 'bg-gray-50 text-[#2A6877]' : ''
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-colors ${
                    isActive ? 'text-[#2A6877]' : 'text-gray-400 group-hover:text-[#2A6877]'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-0 top-0 bottom-0 w-1 bg-[#2A6877] rounded-l"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;