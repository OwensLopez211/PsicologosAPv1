import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

// Preload the hero image
const preloadHeroImage = () => {
  const img = new Image();
  img.src = "/hero-therapy.svg";
};

// Feature items without animation delays for better performance
const featureItems = [
  { text: "Sesiones flexibles", icon: "💻" },
  { text: "Psicólogos certificados", icon: "🔒" },
  { text: "Precios accesibles", icon: "💸" }
];

const MobileHero = () => {
  const navigate = useNavigate();
  const heroImgRef = useRef<HTMLImageElement | null>(null);
  const [, setIsLoaded] = useState(false);

  // Preload the hero image on component mount
  useEffect(() => {
    preloadHeroImage();
    
    // Mark image as loaded once it's visible in DOM
    if (heroImgRef.current && heroImgRef.current.complete) {
      setIsLoaded(true);
    }
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleButtonClick = () => {
    navigate('/especialistas');
  };

  return (
    <section 
      className="relative px-0 pt-12 pb-6 overflow-hidden bg-white"
      aria-labelledby="hero-heading"
    >
      {/* Decorative backgrounds - simplified for performance */}
      <div 
        className="absolute top-0 right-0 w-40 h-40 bg-[#B4E4D3]/10 rounded-full -z-10" 
        style={{ transform: 'translate(30%, -30%)' }}
        aria-hidden="true"
      />
      
      {/* Main hero image - optimized for LCP */}
      <div className="relative w-full h-[220px] xs:h-[260px] sm:h-[300px] rounded-b-2xl overflow-hidden z-10">
        <img
          ref={heroImgRef}
          src="/hero-therapy.svg"
          alt="Sesión de terapia psicológica online"
          className="w-full h-full object-cover"
          width="600"
          height="300"
          fetchPriority="high"
          onLoad={handleImageLoad}
          style={{
            // Pre-allocate space to prevent layout shift
            aspectRatio: '2/1',
            // Add a light background color before image loads
            backgroundColor: '#f8f9fa'
          }}
        />
        
        {/* Simplified gradient overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-[#2A6877]/30 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Text content - simplified animations for better performance */}
      <div
        className="text-center space-y-5 px-4 pt-5 z-20 relative"
      >
        <div className="relative">
          <div
            className="absolute -top-2 left-1/2 h-1 bg-[#2A6877] rounded-full"
            style={{ width: '40%', transform: 'translateX(-50%)' }}
            aria-hidden="true"
          />
          <h1 
            id="hero-heading"
            className="text-2xl xs:text-3xl font-bold leading-tight text-gray-800"
          >
            El psicoterapeuta online que estabas buscando
          </h1>
        </div>

        <p className="text-gray-600 text-base xs:text-lg mx-auto leading-tight">
          Empieza a sentirte mejor con la ayuda de tu psicólogo en
          <span className="text-[#2A6877] font-medium"> E-mind</span>
        </p>

        {/* Feature pills - simplified for performance */}
        <div className="flex flex-wrap justify-center gap-2 py-1">
          {featureItems.map((item, index) => (
            <div
              key={index}
              className="bg-[#2A6877]/10 px-3 py-1.5 rounded-full flex items-center text-xs xs:text-sm font-medium text-[#2A6877]"
            >
              <span className="mr-2 text-base xs:text-lg" aria-hidden="true">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        {/* Optimized CTA Button */}
        <button 
          onClick={handleButtonClick}
          className="w-full bg-[#2A6877] text-white py-3 px-6 rounded-lg font-medium shadow-md flex items-center justify-center gap-2 text-base xs:text-lg mt-2 hover:bg-[#235A67] transition-colors"
          aria-label="Agenda con tu psicólogo"
        >
          <span>Agenda con tu psicólogo</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-5 h-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M14 5l7 7m0 0l-7 7m7-7H3" 
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default MobileHero;