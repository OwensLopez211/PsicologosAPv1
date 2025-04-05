import Hero from '../../components/public-components/Hero'
import MobileHero from '../../components/public-components/MobileHero'
import HowItWorks from '../../components/public-components/HowItWorks'
import PsychologistCTA from '../../components/public-components/PsychologistCTA'
import PageTransition from '../../components/animations/PageTransition'
import useScreenSize from '../../hooks/useScreenSize'

const HomePage = () => {
  const { isMobile } = useScreenSize();

  return (
    <PageTransition>
      {isMobile ? <MobileHero /> : <Hero />}
      <HowItWorks />
      <PsychologistCTA />
    </PageTransition>
  )
}

export default HomePage