import { motion } from 'framer-motion'
import { Megaphone, Users, ShieldCheck, Zap } from 'lucide-react'
import { fadeUp, staggerContainer } from './landingMotion'

const benefits = [
  { icon: Megaphone, title: 'Post Internships', text: 'Create listings in minutes with skills, duration, and stipend details.' },
  { icon: Users, title: 'Access Student Talent', text: 'Reach motivated MITAOE students filtered by skills and interests.' },
  { icon: ShieldCheck, title: 'Faculty-Verified Platform', text: 'Build trust with department oversight on every organization and listing.' },
  { icon: Zap, title: 'Faster Hiring', text: 'Review applications, match scores, and candidate profiles in one workspace.' },
]

const OrgBenefits = () => (
  <section className="landing-section landing-org">
    <motion.div
      className="landing-section-head"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
    >
      <span className="landing-section-label">For organizations</span>
      <h2>Hire MITAOE talent with confidence</h2>
      <p>Partner with a platform designed for micro-internships at scale.</p>
    </motion.div>

    <motion.div
      className="landing-org-grid"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {benefits.map((b, i) => {
        const Icon = b.icon
        return (
          <motion.div
            key={b.title}
            className="landing-org-card"
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -4 }}
          >
            <Icon size={24} />
            <h3>{b.title}</h3>
            <p>{b.text}</p>
          </motion.div>
        )
      })}
    </motion.div>
  </section>
)

export default OrgBenefits
