const Benefits = () => {
  return (
    <section className="container mx-auto px-6 py-16">
      <h2 className="text-3xl font-serif text-center mb-4">
        Avanza Hacia Tu Mejor Versión,
      </h2>
      <h3 className="text-xl font-serif text-center mb-12">
        Paz Interior y Vínculos Sanos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Card 1 */}
        <div className="text-center">
          <div className="bg-gray-200 h-48 mb-4 rounded-lg"></div>
          <p className="font-medium">Junto a los mejores profesionales</p>
        </div>

        {/* Card 2 */}
        <div className="text-center">
          <div className="bg-gray-200 h-48 mb-4 rounded-lg"></div>
          <p className="font-medium">Te acompañamos en todo el proceso</p>
        </div>

        {/* Card 3 */}
        <div className="text-center">
          <div className="bg-gray-200 h-48 mb-4 rounded-lg"></div>
          <p className="font-medium">Desde cualquier lugar</p>
        </div>

        {/* Card 4 */}
        <div className="text-center">
          <div className="bg-gray-200 h-48 mb-4 rounded-lg"></div>
          <p className="font-medium">Con un precio a tu alcance</p>
        </div>
      </div>
    </section>
  );
};

export default Benefits;