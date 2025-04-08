import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, UserIcon, CalendarIcon, UsersIcon, 
  DocumentTextIcon, Cog6ToothIcon as CogIcon, ArrowRightOnRectangleIcon as LogoutIcon, 
  UserGroupIcon, ClipboardDocumentCheckIcon, ChartBarIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onClose?: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const normalizedUserType = user?.user_type?.toUpperCase() || 'CLIENT';

  const getMenuItems = () => {
    const roleSpecificItems = {
      CLIENT: [
        { path: '/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/dashboard/profile', label: 'Mi Perfil', icon: UserIcon },
        { path: '/dashboard/appointments', label: 'Mis Citas', icon: CalendarIcon },
        { path: '/dashboard/psychologists', label: 'Buscar Psicólogos', icon: MagnifyingGlassIcon },
      ],
      PSYCHOLOGIST: [
        { path: '/psicologo/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/psicologo/dashboard/profile', label: 'Mi Perfil', icon: UserIcon },
        { path: '/psicologo/dashboard/schedule', label: 'Mi Agenda', icon: CalendarIcon },
        { path: '/psicologo/dashboard/patients', label: 'Mis Pacientes', icon: UsersIcon },
      ],
      ADMIN: [
        { path: '/admin/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/admin/dashboard/profile', label: 'Mi Perfil', icon: UserIcon },
        { path: '/admin/dashboard/pacients', label: 'Pacientes', icon: UsersIcon },
        { path: '/admin/dashboard/psychologists', label: 'Psicólogos', icon: UserGroupIcon },
      ],
    };

    return [...(roleSpecificItems[normalizedUserType] || roleSpecificItems.CLIENT)];
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