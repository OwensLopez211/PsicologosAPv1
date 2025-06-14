import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/animations/PageTransition';
import MissionSection from '../../components/public-components/MissionSection';
import VisionSection from '../../components/public-components/VisionSection';
import ValuesSection from '../../components/public-components/ValuesSection';

const AboutPage = () => {
  return (
    <PageTransition>
      <HeaderPage 
        title="Quienes somos"
        description="Conectamos personas con psicólogos profesionales para una atención accesible y efectiva."
      />
      <MissionSection />
      <VisionSection />
      <ValuesSection />
    </PageTransition>
  );
};

export default AboutPage;