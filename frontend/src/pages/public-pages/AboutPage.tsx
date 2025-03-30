import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/public-components/PageTransition';
import MissionSection from '../../components/public-components/MissionSection';
import ValuesSection from '../../components/public-components/ValuesSection';

const AboutPage = () => {
  return (
    <PageTransition>
      <HeaderPage 
        title="Quiénes Somos"
        description="Conectamos personas con psicólogos profesionales para una atención mental accesible, personalizada y efectiva."
      />
      <MissionSection />
      <ValuesSection />
    </PageTransition>
  );
};

export default AboutPage;