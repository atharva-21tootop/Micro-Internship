import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { fadeUp, staggerContainer } from './landingMotion'

const stats = [
  { end: 500, suffix: '+', label: 'Internships' },
  { end: 1000, suffix: '+', label: 'Students' },
  { end: 150, suffix: '+', label: 'Organizations' },
  { end: 95, suffix: '%', label: 'Success Rate' },
]

const useCountUp = (end, active, duration = 1800) => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active) return undefined
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setValue(Math.round(end * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [end, active, duration])

  return value
}

const StatItem = ({ end, suffix, label, active }) => {
  const count = useCountUp(end, active)
  return (
    <motion.div className="landing-stat-card" variants={fadeUp}>
      <strong>
        {count}
        {suffix}
      </strong>
      <span>{label}</span>
    </motion.div>
  )
}

const StatsSection = () => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="landing-section landing-stats" ref={ref}>
      <motion.div
        className="landing-stats-grid"
        variants={staggerContainer}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {stats.map((stat) => (
          <StatItem key={stat.label} {...stat} active={inView} />
        ))}
      </motion.div>
    </section>
  )
}

export default StatsSection
