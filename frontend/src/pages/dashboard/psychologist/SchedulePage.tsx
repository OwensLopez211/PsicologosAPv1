import { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, CalendarIcon } from '@heroicons/react/24/outline';
import AppointmentDetails from '../../../components/dashboard/psychologist/AppointmentDetails';
import axios from 'axios';

// Define appointment status types to match backend
type AppointmentStatus = 'PENDING_PAYMENT' | 'PAYMENT_UPLOADED' | 'PAYMENT_VERIFIED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

// Define appointment interface to match backend
interface Appointment {
  id: number;
  client_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  psychologist_notes?: string;
  client_notes?: string;
  status_display: string;
}

const SchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'day' | 'week'>('week');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // On mobile, default to day view
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

  // Fetch appointments from API
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Format dates for API query
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
      
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token'); // Changed from 'token' to 'token'
      
      // Make the API request with the Authorization header
      const response = await axios.get('/api/appointments/my-appointments/', {
        params: {
          start_date: startDate,
          end_date: endDate
        },
        headers: {
          'Authorization': `Bearer ${token}` // Changed from 'Token' to 'Bearer'
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

  // Fetch appointments when date or view changes
  useEffect(() => {
    fetchAppointments();
  }, [currentDate, currentView]);

  // Handle opening appointment details
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  // Handle closing appointment details
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    // Refresh appointments when closing details
    fetchAppointments();
  };

  // Handle appointment status change
  const handleStatusChange = (id: number, newStatus: AppointmentStatus) => {
    // Update local state immediately for better UX
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
    
    // If we have a selected appointment, update it too
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment({
        ...selectedAppointment,
        status: newStatus
      });
    }
  };

  // Handle appointment notes change
  const handleNotesChange = (id: number, notes: string) => {
    // Update local state immediately for better UX
    setAppointments(prevAppointments => 
      prevAppointments.map(app => 
        app.id === id ? { ...app, psychologist_notes: notes } : app
      )
    );
    
    // If we have a selected appointment, update it too
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment({
        ...selectedAppointment,
        psychologist_notes: notes
      });
    }
  };

  // Navigation functions
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

  // Get status color
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING_PAYMENT':
      case 'PAYMENT_UPLOADED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAYMENT_VERIFIED':
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Generate time slots
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8; // Start from 8 AM
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Generate days for week view
  const generateWeekDays = () => {
    const startDay = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
    return Array.from({ length: 7 }, (_, i) => addDays(startDay, i));
  };

  // Filter appointments for a specific day and time
  const getAppointmentsForTimeSlot = (date: Date, time: string) => {
    console.log('Checking for appointments on:', format(date, 'yyyy-MM-dd'), 'at time:', time);
    console.log('Available appointments:', appointments);
    
    const matchingAppointments = appointments.filter(app => {
      const isSameDate = isSameDay(parseISO(app.date), date);
      const timeMatches = app.start_time.startsWith(time);
      
      console.log('Appointment:', app.id, 'Date match:', isSameDate, 'Time match:', timeMatches);
      
      return isSameDate && timeMatches;
    });
    
    console.log('Matching appointments:', matchingAppointments);
    return matchingAppointments;
  };

  // Get all appointments for a specific day (for mobile list view)
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(app => isSameDay(parseISO(app.date), date))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // Mobile day view - list of appointments
  const MobileDayView = () => {
    const dayAppointments = getAppointmentsForDay(currentDate);
    
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Cargando citas...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={fetchAppointments}
            className="mt-4 px-4 py-2 bg-[#2A6877] text-white rounded-md"
          >
            Reintentar
          </button>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900">
            {format(currentDate, "EEEE d 'de' MMMM", { locale: es })}
          </h3>
        </div>
        
        {dayAppointments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {dayAppointments.map(appointment => (
              <div 
                key={appointment.id}
                className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleAppointmentClick(appointment)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{appointment.client_name}</div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status_display}
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <span className="inline-block w-16">{appointment.start_time}</span>
                  <span>-</span>
                  <span className="inline-block w-16 ml-2">{appointment.end_time}</span>
                </div>
                {appointment.client_notes && (
                  <div className="mt-2 text-sm text-gray-600">{appointment.client_notes}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-gray-500">No hay citas programadas para este día</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">Mi Agenda</h1>
        <p className="text-sm md:text-base text-gray-600">Administra tus citas y horarios de atención</p>
      </div>

      {/* Calendar Controls - Responsive */}
      <div className="flex flex-wrap items-center justify-between mb-6 bg-white p-3 md:p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 md:space-x-4 mb-3 md:mb-0 w-full md:w-auto">
          <button 
            onClick={goToPrevious}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <h2 className="text-base md:text-xl font-semibold text-gray-800 flex-1 text-center md:text-left truncate">
            {currentView === 'day' 
              ? format(currentDate, "EEEE d 'de' MMMM", { locale: es })
              : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d MMM", { locale: es })} - ${format(addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6), "d MMM", { locale: es })}`
            }
          </h2>
          
          <button 
            onClick={goToNext}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
            aria-label="Siguiente"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="flex space-x-2 w-full md:w-auto justify-between md:justify-end">
          <button 
            onClick={goToToday}
            className="px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          >
            Hoy
          </button>
          
          <div className="bg-gray-100 rounded-md p-1">
            <button 
              onClick={() => setCurrentView('day')}
              className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                currentView === 'day' 
                  ? 'bg-white shadow-sm text-[#2A6877]' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Día</span>
            </button>
            <button 
              onClick={() => setCurrentView('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
                currentView === 'week' 
                  ? 'bg-white shadow-sm text-[#2A6877]' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              disabled={isMobile}
            >
              <CalendarDaysIcon className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Semana</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Legend - Responsive */}
      <div className="mb-4 md:mb-6 flex flex-wrap gap-2 md:gap-3">
        <div className="text-xs md:text-sm font-medium text-gray-700 w-full md:w-auto mb-1 md:mb-0">
          Estado de citas:
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pendiente
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Confirmada
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Completada
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Cancelada
          </span>
        </div>
      </div>

      {/* Mobile Day View (List) */}
      {isMobile && currentView === 'day' && <MobileDayView />}

      {/* Calendar Grid - Only show on desktop or when week view is selected */}
      {(!isMobile || currentView === 'week') && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Day headers (for week view) */}
          {currentView === 'week' && (
            <div className="grid grid-cols-8 border-b">
              <div className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                Hora
              </div>
              {generateWeekDays().map((day, index) => (
                <div 
                  key={index} 
                  className={`py-3 px-2 text-center text-sm font-medium ${
                    isSameDay(day, new Date()) ? 'bg-blue-50 text-[#2A6877]' : 'text-gray-700'
                  }`}
                >
                  <div className="hidden md:block">{format(day, 'EEEE', { locale: es })}</div>
                  <div className="md:hidden">{format(day, 'EEE', { locale: es })}</div>
                  <div className="text-lg font-bold">{format(day, 'd')}</div>
                </div>
              ))}
            </div>
          )}

          {/* Time slots */}
          <div className={`grid ${currentView === 'week' ? 'grid-cols-8' : 'grid-cols-2'}`}>
            {/* Time labels */}
            <div className="border-r">
              {timeSlots.map((time, index) => (
                <div 
                  key={index} 
                  className="h-16 md:h-20 py-2 px-2 text-right text-xs font-medium text-gray-500 border-b"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Appointment slots */}
            {currentView === 'day' ? (
              <div>
                {timeSlots.map((time, index) => {
                  const dayAppointments = getAppointmentsForTimeSlot(currentDate, time);
                  console.log(`Time slot ${time}:`, dayAppointments);
                  
                  return (
                    <div key={index} className="h-16 md:h-20 border-b p-1 relative">
                      {dayAppointments.length > 0 ? (
                        dayAppointments.map(appointment => (
                          <div 
                            key={appointment.id}
                            className={`p-1 md:p-2 rounded-md border h-full overflow-hidden ${getStatusColor(appointment.status)} cursor-pointer hover:shadow-md active:shadow-inner transition-shadow`}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="font-medium text-xs md:text-sm truncate">{appointment.client_name}</div>
                            <div className="text-xs">{appointment.start_time} - {appointment.end_time}</div>
                            <div className="text-xs mt-1 truncate hidden md:block">{appointment.client_notes}</div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full w-full border border-dashed border-gray-200 rounded-md"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Week view
              generateWeekDays().map((day, dayIndex) => (
                <div key={dayIndex} className={dayIndex < 6 ? 'border-r' : ''}>
                  {timeSlots.map((time, timeIndex) => {
                    const slotAppointments = getAppointmentsForTimeSlot(day, time);
                    console.log(`Week view - Day ${format(day, 'yyyy-MM-dd')}, Time slot ${time}:`, slotAppointments);
                    
                    return (
                      <div 
                        key={`${dayIndex}-${timeIndex}`} 
                        className={`h-16 md:h-20 border-b p-1 relative ${
                          isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                        }`}
                      >
                        {slotAppointments.length > 0 ? (
                          slotAppointments.map(appointment => (
                            <div 
                              key={appointment.id}
                              className={`p-1 md:p-2 rounded-md border h-full overflow-hidden ${getStatusColor(appointment.status)} cursor-pointer hover:shadow-md active:shadow-inner transition-shadow`}
                              onClick={() => handleAppointmentClick(appointment)}
                            >
                              <div className="font-medium text-xs md:text-sm truncate">{appointment.client_name}</div>
                              <div className="text-xs">{appointment.start_time} - {appointment.end_time}</div>
                              <div className="text-xs mt-1 truncate hidden md:block">{appointment.client_notes}</div>
                            </div>
                          ))
                        ) : (
                          <div className="h-full w-full border border-dashed border-gray-200 rounded-md"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
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