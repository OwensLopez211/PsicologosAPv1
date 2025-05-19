import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/animations/PageTransition';
import ContactContainer from '../../components/public-components/ContactContainer';

const ContactPage = () => {
  return (
    <PageTransition>
      <HeaderPage 
        title="Contáctanos"
        description="¿Tienes preguntas sobre nuestros servicios de psicoterapia online? ¿Necesitas ayuda para encontrar el psicólogo adecuado? El equipo de E-Mind está aquí para asistirte. Completa el formulario o contáctanos directamente por WhatsApp."
      />
      <ContactContainer />
    </PageTransition>
  );
};

export default ContactPage;