const MissionSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif text-gray-800 mb-6">Nuestra Misión</h2>
          <p className="text-gray-600 mb-10 leading-relaxed">
            Transformar el acceso a la salud mental en Chile, conectando a las personas con profesionales calificados a través de una plataforma digital intuitiva y segura. Nos comprometemos a eliminar barreras y estigmas, haciendo que el cuidado de la salud mental sea accesible, conveniente y efectivo para todos.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#B4E4D3] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Accesibilidad</h3>
                <p className="text-gray-600">Facilitamos el acceso a atención psicológica de calidad desde cualquier lugar.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#B4E4D3] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#2A6877]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Personalización</h3>
                <p className="text-gray-600">Conectamos a cada persona con el profesional más adecuado para sus necesidades.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;