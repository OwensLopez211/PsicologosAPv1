interface HeaderPageProps {
  title: string;
  description: string;
  imageSrc?: string; // Imagen de fondo opcional
  accentColor?: string; // Color de acento personalizable
}

const HeaderPage = ({
  title,
  description,
  imageSrc,
  accentColor = '#B4E4D3', // Color por defecto alineado con tu requisito
}: HeaderPageProps) => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Capa de fondo con efecto parallax */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-teal-700 to-teal-900"
        style={{
          backgroundImage: imageSrc ? `url(${imageSrc})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: imageSrc ? '0.5' : '1',
        }}
      />
      
      {/* Elementos decorativos */}
      <div className="absolute inset-0 bg-opacity-70">
        {/* Círculos decorativos */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full" 
          style={{ background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)` }} />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full" 
          style={{ background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)` }} />
        
        {/* Líneas decorativas */}
        <div className="absolute top-0 left-0 w-full h-1" 
          style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor}80 50%, transparent 100%)` }} />
      </div>
      
      {/* Contenido principal */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
          <span className="inline-block relative">
            {title}
            <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full transform translate-y-1"
              style={{ background: accentColor }}></span>
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-gray-200 text-lg md:text-xl opacity-90 leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Forma decorativa en la parte inferior */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-16 text-white fill-current">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeaderPage;