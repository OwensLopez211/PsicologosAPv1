import ContactForm from './ContactForm';

const ContactContainer = () => {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 max-w-5xl mx-auto border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side - Message and social links */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-gray-800">Envíanos un mensaje</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                ¿Tienes preguntas o algún comentario? Estamos aquí para ayudarte en tu camino hacia el bienestar emocional.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 font-medium">Síguenos en nuestras redes:</p>
              <div className="flex gap-6">
                <a 
                  href="https://www.instagram.com/e_mindapp?igsh=MWRrYjRoeGs3NGh3Zg%3D%3D&utm_source=qr" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#2A6877] transition-all transform hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02c0-1.5-.47-2.7-1.3-3.54a4.82 4.82 0 0 0-3.54-1.25zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <p className="text-gray-700 font-medium">Información de contacto:</p>
              <div className="space-y-2 text-gray-600">
                <p>
                  <a 
                    href="mailto:contacto@emindapp.cl" 
                    className="hover:text-[#2A6877] transition-colors"
                  >
                    📧 contacto@emindapp.cl
                  </a>
                </p>
                <p>
                  <a 
                    href="https://wa.me/56944100640" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-[#2A6877] transition-colors"
                  >
                    📱 WhatsApp: +56 9 4410 0640
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Contact form */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactContainer;