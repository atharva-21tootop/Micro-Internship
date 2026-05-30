import { motion } from 'framer-motion'

const FloatingBackground = () => (
  <div className="landing-bg" aria-hidden>
    <motion.div
      className="landing-orb landing-orb-1"
      animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="landing-orb landing-orb-2"
      animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.12, 1] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    />
    <motion.div
      className="landing-orb landing-orb-3"
      animate={{ x: [0, 30, 0], y: [0, 50, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    <div className="landing-grid-overlay" />
  </div>
)

export default FloatingBackground
