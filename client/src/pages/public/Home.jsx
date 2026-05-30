import FloatingBackground from '@/components/landing/FloatingBackground'
import HeroSection from '@/components/landing/HeroSection'
import FeatureGrid from '@/components/landing/FeatureGrid'
import HowItWorks from '@/components/landing/HowItWorks'
import AIRecommendationShowcase from '@/components/landing/AIRecommendationShowcase'
import StatsSection from '@/components/landing/StatsSection'
import OrgBenefits from '@/components/landing/OrgBenefits'
import FinalCTA from '@/components/landing/FinalCTA'
import '@/components/landing/Landing.css'
import './Home.css'

const Home = () => (
  <div className="home-landing">
    <FloatingBackground />
    <div className="landing-page-inner">
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <AIRecommendationShowcase />
      <StatsSection />
      <OrgBenefits />
      <FinalCTA />
    </div>
  </div>
)

export default Home
