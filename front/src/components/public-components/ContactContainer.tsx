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
                  href="https://linkedin.com/company/bienestar-cl" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#2A6877] transition-all transform hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com/bienestar.cl" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#2A6877] transition-all transform hover:scale-110"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02c0-1.5-.47-2.7-1.3-3.54a4.82 4.82 0 0 0-3.54-1.25zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
                  </svg>
                </a>
                <a 
                  href="https://facebook.com/bienestar.cl" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#2A6877] transition-all transform hover:scale-110"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <p className="text-gray-700 font-medium">Información de contacto:</p>
              <div className="space-y-2 text-gray-600">
                <p>📧 contacto@bienestar.cl</p>
                <p>📱 +56 9 1234 5678</p>
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