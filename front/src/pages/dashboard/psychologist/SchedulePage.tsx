import { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import axios from 'axios';

// Componentes modulares
import ScheduleHeader from './schedule/ScheduleHeader';
import ScheduleControls from './schedule/ScheduleControls';
import StatusLegend from './schedule/StatusLegend';
import MobileDayView from './schedule/MobileDayView';
import DayView from './schedule/DayView';
import WeekView from './schedule/WeekView';
import AppointmentDetails from '../../../components/dashboard/psychologist/AppointmentDetails';

// Tipos y utilidades
import { Appointment, AppointmentStatus } from './schedule/appointment-types';

const SchedulePage = () => {
  // Estado del componente
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'day' | 'week'>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Comprobar si el dispositivo es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // En móvil, cambiar a vista diaria por defecto
      if (window.innerWidth < 768 && currentView === 'week') {
        setCurrentView('day');
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [currentView]);

  // Obtener citas de la API
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Formatear fechas para consulta API
      const startDate = format(
        currentView === 'day' ? currentDate : startOfWeek(currentDate, { weekStartsOn: 1 }),
        'yyyy-MM-dd'
      );
      
      const endDate = format(
        currentView === 'day' 
          ? currentDate 
          : addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6),
        'yyyy-MM-dd'
      );
      
      // Obtener token de autenticación de localStorage
      const token = localStorage.getItem('token');
      
      // Realizar petición API con cabecera de autorización
      const response = await axios.get('/api/appointments/my-appointments/', {
        params: {
          start_date: startDate,
          end_date: endDate
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setAppointments(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Error al cargar las citas. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener citas cuando cambia la fecha o la vista
  useEffect(() => {
    fetchAppointments();
  }, [currentDate, currentView]);

  // Funciones de navegación
  const goToToday = () => setCurrentDate(new Date());
  
  const goToPrevious = () => {
    if (currentView === 'day') {
      setCurrentDate(subDays(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };
  
  const goToNext = () => {
    if (currentView === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  // Manejadores de eventos
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    // Actualizar citas al cerrar detalles
    fetchAppointments();
  };

  const handleStatusChange = (id: number, newStatus: AppointmentStatus) => {
    // Actualizar estado local inmediatamente para mejor UX
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
    
    // Si tenemos una cita seleccionada, actualizar también
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment({
        ...selectedAppointment,
        status: newStatus
      });
    }
  };

  const handleNotesChange = (id: number, notes: string) => {
    // Actualizar estado local inmediatamente para mejor UX
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === id ? { ...app, psychologist_notes: notes } : app
      )
    );
    
    // Si tenemos una cita seleccionada, actualizar también
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment({
        ...selectedAppointment,
        psychologist_notes: notes
      });
    }
  };

  // Funciones auxiliares
  const getAppointmentsForTimeSlot = (date: Date, time: string) => {
    return appointments.filter(app => {
      const isSameDate = isSameDay(parseISO(app.date), date);
      const timeMatches = app.start_time.startsWith(time);
      return isSameDate && timeMatches;
    });
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(app => isSameDay(parseISO(app.date), date))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 md:py-8">
      {/* Cabecera */}
      <ScheduleHeader 
        title="Mi Agenda" 
        subtitle=""
      />

      {/* Controles */}
      <ScheduleControls 
        currentDate={currentDate}
        currentView={currentView}
        isMobile={isMobile}
        goToToday={goToToday}
        goToPrevious={goToPrevious}
        goToNext={goToNext}
        setCurrentView={setCurrentView}
      />

      {/* Leyenda de estados */}
      <StatusLegend />

      {/* Vista móvil día (lista) */}
      {isMobile && currentView === 'day' && (
        <MobileDayView 
          currentDate={currentDate}
          dayAppointments={getAppointmentsForDay(currentDate)}
          isLoading={isLoading}
          error={error}
          onAppointmentClick={handleAppointmentClick}
          onRetry={fetchAppointments}
        />
      )}

      {/* Calendario - Solo mostrar en desktop o cuando se selecciona vista semanal */}
      {(!isMobile || currentView === 'week') && (
        <>
          {currentView === 'day' ? (
            <DayView 
              currentDate={currentDate}
              getAppointmentsForTimeSlot={getAppointmentsForTimeSlot}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : (
            <WeekView 
              currentDate={currentDate}
              getAppointmentsForTimeSlot={getAppointmentsForTimeSlot}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
        </>
      )}

      {/* Modal de detalles de cita */}
      <AppointmentDetails 
        appointment={selectedAppointment}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
        refreshAppointments={fetchAppointments}
      />
    </div>
  );
};

export default SchedulePage;