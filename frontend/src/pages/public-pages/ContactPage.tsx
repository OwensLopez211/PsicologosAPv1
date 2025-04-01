import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/public-components/PageTransition';
import ContactContainer from '../../components/public-components/ContactContainer';

const ContactPage = () => {
  return (
    <PageTransition>
      <HeaderPage 
        title="Contáctanos"
        description="¿Tienes preguntas o necesitas ayuda? Estamos aquí para asistirte. Completa el formulario a continuación y nuestro equipo se pondrá en contacto contigo lo antes posible."
      />
      <ContactContainer />
    </PageTransition>
  );
};

export default ContactPage;