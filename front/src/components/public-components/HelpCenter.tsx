import { useState, useRef } from 'react';
import { 
  QuestionMarkCircleIcon, 
  MagnifyingGlassIcon, 
  ChevronRightIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

// Definición de las preguntas frecuentes
const preguntasFrecuentes = [
  {
    id: 'agendar',
    titulo: '¿Cómo agendar una cita?',
    icon: CalendarDaysIcon,
    resumen: 'Selecciona un psicólogo, elige un horario disponible y realiza el pago.',
    contenido: `
      <p>Para agendar una cita con un psicólogo, sigue estos pasos:</p>
      <ol>
        <li>Ingresa a la sección "Especialistas" en el menú principal</li>
        <li>Busca y selecciona el psicólogo de tu preferencia</li>
        <li>En su perfil, haz clic en "Agendar cita"</li>
        <li>Selecciona la fecha y hora disponible que más te convenga</li>
        <li>Confirma tu reserva y realiza el pago correspondiente</li>
        <li>¡Listo! Recibirás un correo de confirmación con los detalles</li>
      </ol>
    `
  },
  {
    id: 'elegir',
    titulo: '¿Cómo elegir un psicólogo?',
    icon: UserGroupIcon,
    resumen: 'Revisa sus especialidades, enfoque terapéutico y disponibilidad.',
    contenido: `
      <p>Para elegir al psicólogo adecuado, te recomendamos:</p>
      <ul>
        <li>Identificar qué área de especialidad necesitas (terapia individual, de pareja, etc.)</li>
        <li>Revisar los perfiles de nuestros profesionales, sus especialidades y enfoque terapéutico</li>
        <li>Leer las reseñas de otros pacientes</li>
        <li>Considerar aspectos prácticos como disponibilidad horaria y tarifa</li>
        <li>Si después de la primera sesión sientes que no hay conexión, puedes solicitar cambiar de profesional</li>
      </ul>
    `
  },
  {
    id: 'cancelar',
    titulo: '¿Qué hacer si no puedo asistir?',
    icon: XCircleIcon,
    resumen: 'Puedes cancelar hasta 24 horas antes sin cargo adicional.',
    contenido: `
      <p>Si no puedes asistir a tu cita programada:</p>
      <ol>
        <li>Ingresa a "Mi cuenta" > "Mis citas"</li>
        <li>Encuentra la cita que deseas cancelar</li>
        <li>Haz clic en "Cancelar cita"</li>
        <li>Selecciona el motivo de la cancelación</li>
      </ol>
      <p><strong>Política de cancelación:</strong></p>
      <ul>
        <li>Cancelaciones con más de 24 horas de anticipación: reembolso completo</li>
        <li>Cancelaciones con menos de 24 horas: cargo del 50% del valor de la sesión</li>
        <li>No presentarse sin aviso: cargo del 100% del valor de la sesión</li>
      </ul>
      <p>Si necesitas reprogramar, te recomendamos cancelar y agendar una nueva cita.</p>
    `
  },
  {
    id: 'pago',
    titulo: 'Métodos de pago disponibles',
    icon: ChatBubbleLeftRightIcon,
    resumen: 'Aceptamos tarjetas de crédito, débito y transferencias bancarias.',
    contenido: `
      <p>En Bienestar puedes pagar tus sesiones mediante:</p>
      <ul>
        <li>Tarjetas de crédito o débito (Visa, Mastercard, American Express)</li>
        <li>Transferencia bancaria directa</li>
        <li>Aplicaciones de pago móvil</li>
      </ul>
      <p>Todos los pagos son procesados de manera segura y recibirás un comprobante por email.</p>
    `
  }
];

const HelpCenter = () => {
  const [busqueda, setBusqueda] = useState('');
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState<string | null>(null);
  const resultadosRef = useRef<HTMLDivElement | null>(null);

  // Filtrar preguntas basadas en la búsqueda
  const preguntasFiltradas = preguntasFrecuentes.filter(
    pregunta => 
      pregunta.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      pregunta.resumen.toLowerCase().includes(busqueda.toLowerCase()) ||
      pregunta.contenido.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función para seleccionar una pregunta
  const seleccionarPregunta = (id: string) => {
    if (preguntaSeleccionada === id) {
      setPreguntaSeleccionada(null);
    } else {
      setPreguntaSeleccionada(id);
      // Scroll al elemento cuando se expande
      setTimeout(() => {
        const element = document.getElementById(`pregunta-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Función para manejar la búsqueda
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoValor = e.target.value;
    setBusqueda(nuevoValor);
    
    // Reset pregunta seleccionada al buscar
    if (nuevoValor && preguntaSeleccionada) {
      setPreguntaSeleccionada(null);
    }
    
    // Scroll a resultados al buscar
    if (nuevoValor && resultadosRef.current) {
      setTimeout(() => {
        if (resultadosRef.current) {
          resultadosRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {/* Header con título y búsqueda */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#2A6877]/10 to-[#2A6877]/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-[#2A6877] rounded-full p-2">
            <QuestionMarkCircleIcon className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-medium text-gray-800">Centro de Ayuda</h2>
        </div>
        
        <div className="relative mt-4 max-w-xl">
          <input
            type="text"
            placeholder="¿Cómo podemos ayudarte?"
            value={busqueda}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-white border-0 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2A6877]/50"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {/* Contenido principal */}
      <div ref={resultadosRef} className="divide-y divide-gray-100">
        {busqueda ? (
          // Resultados de búsqueda
          preguntasFiltradas.length > 0 ? (
            <div className="p-4 sm:p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                {preguntasFiltradas.length} {preguntasFiltradas.length === 1 ? 'resultado' : 'resultados'} encontrados
              </h3>
              <div className="space-y-3">
                {preguntasFiltradas.map((pregunta) => (
                  <div 
                    key={pregunta.id}
                    id={`pregunta-${pregunta.id}`}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => seleccionarPregunta(pregunta.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <pregunta.icon className="h-5 w-5 text-[#2A6877] mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">{pregunta.titulo}</h4>
                          <p className="text-sm text-gray-500 mt-1">{pregunta.resumen}</p>
                        </div>
                      </div>
                      <ChevronRightIcon 
                        className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                          preguntaSeleccionada === pregunta.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    
                    {preguntaSeleccionada === pregunta.id && (
                      <div className="px-4 py-4 sm:px-5 sm:py-5 bg-gray-50/80 border-t border-gray-100">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: pregunta.contenido }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // No hay resultados
            <div className="py-12 px-4 text-center">
              <QuestionMarkCircleIcon className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-3 text-gray-500">No encontramos resultados para "{busqueda}"</p>
              <button 
                onClick={() => setBusqueda('')}
                className="mt-3 text-[#2A6877] hover:underline font-medium"
              >
                Ver todas las preguntas
              </button>
            </div>
          )
        ) : (
          // Listado de preguntas frecuentes (sin búsqueda)
          <div className="p-4 sm:p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Preguntas frecuentes</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {preguntasFrecuentes.map((pregunta) => (
                <div 
                  key={pregunta.id}
                  id={`pregunta-${pregunta.id}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => seleccionarPregunta(pregunta.id)}
                    className="w-full h-full px-4 py-3 flex items-start text-left"
                  >
                    <pregunta.icon className="h-5 w-5 text-[#2A6877] mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800">{pregunta.titulo}</h4>
                      <p className="text-sm text-gray-500 mt-1">{pregunta.resumen}</p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
            
            {preguntaSeleccionada && (
              <div className="mt-6 p-5 bg-gray-50/80 rounded-xl border border-gray-100">
                <div className="flex items-center mb-3">
                  {(() => {
                    const pregunta = preguntasFrecuentes.find(p => p.id === preguntaSeleccionada);
                    const Icon = pregunta?.icon;
                    return Icon ? <Icon className="h-5 w-5 text-[#2A6877] mr-2" /> : null;
                  })()}
                  <h3 className="font-medium text-gray-800">
                    {preguntasFrecuentes.find(p => p.id === preguntaSeleccionada)?.titulo}
                  </h3>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: preguntasFrecuentes.find(p => p.id === preguntaSeleccionada)?.contenido || ''
                  }}
                />
                <button 
                  onClick={() => setPreguntaSeleccionada(null)}
                  className="mt-4 text-[#2A6877] hover:underline text-sm font-medium"
                >
                  Volver a todas las preguntas
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer con contacto */}
      <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100">
        <p className="text-gray-600 text-sm">¿No encontraste lo que buscabas?</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <a 
            href="/contacto" 
            className="inline-flex items-center px-4 py-2 bg-[#2A6877] text-white text-sm font-medium rounded-md hover:bg-[#1d4b56] transition-colors"
          >
            Contactar soporte
          </a>
          <a 
            href="/faq" 
            className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-[#2A6877] text-sm font-medium rounded-md hover:bg-[#2A6877]/5 transition-colors"
          >
            Ver todas las FAQ
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;