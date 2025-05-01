import { 
  VideoCameraIcon, 
  CreditCardIcon, 
  ShieldCheckIcon, 
  UserCircleIcon, 
  LockClosedIcon 
} from '@heroicons/react/24/outline';

// Definición de los beneficios
const beneficios = [
  {
    id: 'online',
    titulo: 'Terapia 100% online',
    descripcion: 'Accede a tus sesiones desde cualquier lugar con conexión a internet',
    icono: VideoCameraIcon,
  },
  {
    id: 'tarifas',
    titulo: 'Tarifas accesibles',
    descripcion: 'Precios adaptados a diferentes necesidades y sin costos ocultos',
    icono: CreditCardIcon,
  },
  {
    id: 'verificados',
    titulo: 'Psicólogos verificados',
    descripcion: 'Todos nuestros profesionales pasan por un riguroso proceso de validación',
    icono: ShieldCheckIcon,
  },
  {
    id: 'personalizada',
    titulo: 'Atención personalizada',
    descripcion: 'Tratamiento adaptado a tus necesidades específicas',
    icono: UserCircleIcon,
  },
  {
    id: 'segura',
    titulo: 'Plataforma segura',
    descripcion: 'Confidencialidad garantizada con los más altos estándares de seguridad',
    icono: LockClosedIcon,
  }
];

const Benefits = () => {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Beneficios de Bienestar
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre por qué nuestra plataforma es la mejor opción para iniciar tu proceso terapéutico
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {beneficios.map((beneficio) => {
            const Icon = beneficio.icono;
            
            return (
              <div 
                key={beneficio.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
              >
                <div className="inline-flex items-center justify-center p-3 bg-[#2A6877]/10 rounded-lg mb-4">
                  <Icon className="h-6 w-6 text-[#2A6877]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {beneficio.titulo}
                </h3>
                <p className="text-gray-600">
                  {beneficio.descripcion}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-10">
          <a 
            href="/especialistas" 
            className="inline-flex items-center px-6 py-3 bg-[#2A6877] text-white font-medium rounded-md hover:bg-[#1d4b56] transition-colors"
          >
            Encuentra tu psicólogo
          </a>
        </div>
      </div>
    </section>
  );
};

export default Benefits;