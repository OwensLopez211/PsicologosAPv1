import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Social media links
  const socialLinks = [
    /* {
      name: "LinkedIn",
      url: "https://linkedin.com/company/bienestar-cl",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    }, */
    {
      name: "Instagram",
      url: "https://www.instagram.com/e_mindapp?igsh=MWRrYjRoeGs3NGh3Zg%3D%3D&utm_source=qr",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    /* {
      name: "Facebook",
      url: "#",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    }, */
    /* {
      name: "Twitter",
      url: "#",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    } */
  ];

  // Quick links
  const quickLinks = [
    { name: "Inicio", path: "/" },
    { name: "Especialistas", path: "/especialistas" },
    { name: "Quiénes Somos", path: "/quienes-somos" },
    { name: "Contacto", path: "/contacto" },
    { name: "Términos y Condiciones", path: "/terminos-y-condiciones" },
    { name: "Preguntas frecuentes", path: "/preguntas-frecuentes" }
  ];

  // Services removed as requested

  return (
    <footer className="relative overflow-hidden">
      {/* Wave divider */}
      <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute top-0 w-full h-20 text-white fill-current transform rotate-180">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>

      {/* Footer content */}
      <div className="bg-gradient-to-b from-[#2A6877] to-[#235A67] text-white pt-24 pb-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#B4E4D3] opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8"
          >
            {/* Company Info */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div>
                <Link to="/" className="inline-block">
                  <h3 className="text-3xl font-bold relative">
                    E-mind
                    <span className="absolute -bottom-1 left-0 w-12 h-1 bg-[#B4E4D3] rounded-full"></span>
                  </h3>
                </Link>
              </div>
              
              <p className="text-gray-200 leading-relaxed">
                Tu plataforma de terapia online. Conectamos personas con psicólogos profesionales para un acompañamiento seguro y efectivo.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-white/10 hover:bg-[#B4E4D3]/20 p-2.5 rounded-full transition-all duration-300 hover:scale-110"
                    aria-label={social.name}
                  >
                    <span className="sr-only">{social.name}</span>
                    {social.icon}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants} className="lg:ml-8">
              <h4 className="text-lg font-semibold mb-6 border-b border-white/10 pb-2">Enlaces Rápidos</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.path} 
                      className="text-gray-200 hover:text-[#B4E4D3] transition-colors flex items-center group"
                    >
                      <svg className="w-3 h-3 mr-2 text-[#B4E4D3] transform transition-transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services section removed as requested */}

            {/* Contact Info */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-6 border-b border-white/10 pb-2">Contacto</h4>
              <ul className="space-y-4 text-gray-200">
                <li className="flex items-start gap-3">
                  <div className="bg-white/10 p-2 rounded-full mt-1">
                    <svg className="w-4 h-4 text-[#B4E4D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-300 mb-1">Email</span>
                    <a href="mailto:contacto@bienestar.cl" className="hover:text-[#B4E4D3] transition-colors">
                      contacto@bienestar.cl
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-white/10 p-2 rounded-full mt-1">
                    <svg className="w-4 h-4 text-[#B4E4D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-300 mb-1">Teléfono</span>
                    <a href="tel:+56912345678" className="hover:text-[#B4E4D3] transition-colors">
                      +56 9 1234 5678
                    </a>
                  </div>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div 
            variants={itemVariants}
            className="border-t border-white/10 mt-16 pt-8 text-center text-sm text-gray-300"
          >
            <div className="flex flex-wrap justify-center gap-6 mb-4">
              <Link to="/terminos-y-condiciones" className="hover:text-[#B4E4D3] transition-colors">
                Términos y Condiciones
              </Link>
              <Link to="/privacidad" className="hover:text-[#B4E4D3] transition-colors">
                Política de Privacidad
              </Link>

            </div>
            
            <p>© {currentYear} E-mind. Todos los derechos reservados.</p>
            
{/*             <div className="mt-4 text-xs opacity-70">
              <p>E-mind no reemplaza la atención médica profesional. En caso de emergencia, contacte a su médico o servicio de urgencia local.</p>
            </div> */}
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;