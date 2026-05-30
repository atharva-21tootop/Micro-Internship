import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Users, Briefcase, Building2, TrendingUp } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { fadeUp, staggerContainer } from './landingMotion'
import DashboardMockup from './DashboardMockup'
import ExplainerVideoCard from './ExplainerVideoCard'

const trustStats = [
  { icon: Users, value: '1,000+', label: 'Students' },
  { icon: Briefcase, value: '500+', label: 'Internships' },
  { icon: Building2, value: '150+', label: 'Organizations' },
  { icon: TrendingUp, value: '95%', label: 'Success Rate' },
]

const HeroSection = () => (
  <section className="landing-hero">
    <motion.div
      className="landing-hero-grid"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="landing-hero-copy">
        <motion.span className="landing-eyebrow" variants={fadeUp} custom={0}>
          MITAOE Computer Department · Verified Micro-Internships
        </motion.span>
        <motion.h1 variants={fadeUp} custom={1}>
          Launch Your Career
          <span className="landing-gradient-text"> Before Graduation</span>
        </motion.h1>
        <motion.p className="landing-hero-sub" variants={fadeUp} custom={2}>
          MicroIntern connects MITAOE students with verified organizations through AI-powered matching,
          faculty oversight, and real project-based internships you can complete alongside your degree.
        </motion.p>
        <motion.div className="landing-hero-cta" variants={fadeUp} custom={3}>
          <Link to={ROUTES.internships.browse} className="landing-btn landing-btn-primary landing-btn-ripple">
            Explore Internships
            <ArrowRight size={18} />
          </Link>
          <Link to={ROUTES.register} className="landing-btn landing-btn-glass">
            Get Started
          </Link>
        </motion.div>
        <motion.div className="landing-trust-row" variants={fadeUp} custom={4}>
          {trustStats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="landing-trust-item">
              <Icon size={18} />
              <div>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div className="landing-hero-visual" variants={fadeUp} custom={2}>
        <DashboardMockup />
        <ExplainerVideoCard />
      </motion.div>
    </motion.div>
  </section>
)

export default HeroSection
