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
    <div className="relative w-full overflow-hidden mt-2 sm:mt-28">
      {/* Capa de fondo con efecto parallax */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-[#2A6877] to-[#235A67]"
        style={{
          backgroundImage: imageSrc ? `url(${imageSrc})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: imageSrc ? '0.5' : '1',
        }}
      />
      
      {/* Contenido principal */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 lg:py-32 text-center">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6 tracking-tight leading-tight">
          <span className="inline-block relative">
            {title}
            <span className="absolute -bottom-2 left-0 right-0 h-1 rounded-full transform translate-y-1"
              style={{ background: accentColor }}></span>
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-gray-200 text-base xs:text-lg sm:text-xl md:text-xl opacity-90 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HeaderPage;