import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  HomeIcon, UserIcon, CalendarIcon, UsersIcon, 
  UserGroupIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon,
  ArrowLeftIcon, CreditCardIcon,
} from '@heroicons/react/24/outline';
import {  AnimatePresence } from 'framer-motion';

// Evento personalizado para recargar datos
export const triggerDataRefresh = (module: string) => {
  console.log(`Triggering refresh event for module: ${module}`);
  const event = new CustomEvent('refreshData', { detail: { module } });
  window.dispatchEvent(event);
};

const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const normalizedUserType = user?.user_type?.toUpperCase() || 'CLIENT';

  // Detectar scroll para cambios visuales, pero no para mover la barra
  useEffect(() => {
    const handleScroll = () => {
      // Solo cambiamos la apariencia visual, no la posición
      if (window.scrollY > 5) {
        if (!scrolled) setScrolled(true);
      } else {
        if (scrolled) setScrolled(false);
      }
    };

    // Usar passive listener para mejor rendimiento
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Manejador para clic en elementos de menú
  const handleMenuItemClick = (path: string) => {
    // Cerrar menú móvil si está abierto
    if (isMenuOpen) setIsMenuOpen(false);
    
    // Si es el enlace de pacientes, disparar evento de recarga
    if (path.includes('/patients') || path.includes('/pacients')) {
      console.log('Patient module clicked, triggering refresh');
      triggerDataRefresh('patients');
    }
  };

  const getMenuItems = () => {
    const roleSpecificItems = {
      CLIENT: [
        { path: '/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/dashboard/profile', label: 'Perfil', icon: UserIcon },
        { path: '/dashboard/appointments', label: 'Citas', icon: CalendarIcon },
        { path: '/dashboard/psychologists', label: 'Buscar', icon: MagnifyingGlassIcon },
      ],
      PSYCHOLOGIST: [
        { path: '/psicologo/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/psicologo/dashboard/profile', label: 'Perfil', icon: UserIcon },
        { path: '/psicologo/dashboard/schedule', label: 'Agenda', icon: CalendarIcon },
        { path: '/psicologo/dashboard/patients', label: 'Pacientes', icon: UsersIcon },
        { path: '/psicologo/dashboard/payments', label: 'Pagos', icon: CreditCardIcon },
      ],
      ADMIN: [
        { path: '/admin/dashboard', label: 'Inicio', icon: HomeIcon },
        { path: '/admin/dashboard/profile', label: 'Perfil', icon: UserIcon },
        { path: '/admin/dashboard/payments', label: 'Pagos', icon: CreditCardIcon },
        { path: '/admin/dashboard/pacients', label: 'Pacientes', icon: UsersIcon },
        { path: '/admin/dashboard/psychologists', label: 'Psicólogos', icon: UserGroupIcon },
      ],
    };

    return [...(roleSpecificItems[normalizedUserType as keyof typeof roleSpecificItems] || roleSpecificItems.CLIENT)];
  };

  // Resto del código...
}

export default TopBar; 