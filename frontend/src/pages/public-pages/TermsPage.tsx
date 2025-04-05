import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/animations/PageTransition';
import TermsContent from '../../components/public-components/TermsContent';

const TermsPage = () => {
  return (
    <PageTransition>
      <HeaderPage 
        title="Términos y Condiciones"
        description="Por favor, lee detenidamente nuestros términos y condiciones antes de utilizar nuestros servicios."
      />
      
      <section className="container mx-auto px-6 py-12">
        <TermsContent />
      </section>
    </PageTransition>
  );
};

export default TermsPage;