import { motion } from 'framer-motion'
import {
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Target,
  Building2,
  ClipboardList,
} from 'lucide-react'
import { fadeUp, staggerContainer } from './landingMotion'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Matching',
    description: 'Skill-based scores and reasoning help you apply where you are most likely to succeed.',
    accent: 'violet',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Organizations',
    description: 'Every partner is reviewed by faculty admins before listings go live on the portal.',
    accent: 'blue',
  },
  {
    icon: GraduationCap,
    title: 'Faculty Monitoring',
    description: 'Department oversight ensures quality internships aligned with academic standards.',
    accent: 'indigo',
  },
  {
    icon: Target,
    title: 'Skill-Based Opportunities',
    description: 'Filter and match by technologies, domains, and experience level that fit your profile.',
    accent: 'purple',
  },
  {
    icon: Building2,
    title: 'Real Industry Exposure',
    description: 'Work on live projects with mentors from startups and established companies.',
    accent: 'sky',
  },
  {
    icon: ClipboardList,
    title: 'Application Tracking',
    description: 'Monitor every stage from submission to acceptance in one unified dashboard.',
    accent: 'emerald',
  },
]

const FeatureGrid = () => (
  <section className="landing-section">
    <motion.div
      className="landing-section-head"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
    >
      <span className="landing-section-label">Why MicroIntern</span>
      <h2>Why Choose Micro Internships?</h2>
      <p>Built for students who want real experience — not just another job board.</p>
    </motion.div>

    <motion.div
      className="landing-features-grid"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {features.map((feature, i) => {
        const Icon = feature.icon
        return (
          <motion.article
            key={feature.title}
            className={`landing-feature-card accent-${feature.accent}`}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <span className="landing-feature-icon">
              <Icon size={22} />
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.article>
        )
      })}
    </motion.div>
  </section>
)

export default FeatureGrid
