import HeaderPage from '../../components/public-components/HeaderPage';
import PageTransition from '../../components/public-components/PageTransition';
import MissionSection from '../../components/public-components/MissionSection';
import VisionSection from '../../components/public-components/VisionSection';
import ValuesSection from '../../components/public-components/ValuesSection';

const AboutPage = () => {
  return (
    <PageTransition>
      <HeaderPage 
        title="QUIENES SOMOS?"
        description="Conectamos personas con psicólogos profesionales para una atención mental accesible y efectiva."
      />
      <MissionSection />
      <VisionSection />
      <ValuesSection />
    </PageTransition>
  );
};

export default AboutPage;