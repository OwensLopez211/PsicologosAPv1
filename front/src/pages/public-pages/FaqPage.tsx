import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/animations/PageTransition';

const FAQPage = () => {
  return (
    <PageTransition>
      <HeaderPage 
        title="Centro de ayuda"
        description="Preguntas frecuentes"
      />
      
      <section className="container mx-auto px-6 py-12">
      </section>
    </PageTransition>
  );
};

export default FAQPage;