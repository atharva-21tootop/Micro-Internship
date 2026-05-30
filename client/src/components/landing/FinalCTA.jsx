import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { fadeUp } from './landingMotion'

const FinalCTA = () => (
  <section className="landing-section landing-final-cta">
    <motion.div
      className="landing-cta-inner"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
    >
      <motion.div
        className="landing-cta-glow"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <Sparkles className="landing-cta-icon" size={32} />
      <h2>Ready to Start Your Career Journey?</h2>
      <p>Join MITAOE students and verified organizations on the platform built for your future.</p>
      <div className="landing-hero-cta">
        <Link to={ROUTES.register} className="landing-btn landing-btn-primary landing-btn-ripple">
          Create Account
          <ArrowRight size={18} />
        </Link>
        <Link to={ROUTES.internships.browse} className="landing-btn landing-btn-glass">
          Explore Internships
        </Link>
      </div>
    </motion.div>
  </section>
)

export default FinalCTA
