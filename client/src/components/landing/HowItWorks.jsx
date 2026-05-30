import { motion } from 'framer-motion'
import { UserPlus, Sparkles, Send, Award } from 'lucide-react'
import { fadeUp, staggerContainer } from './landingMotion'

const steps = [
  { icon: UserPlus, step: '01', title: 'Create Profile', text: 'Add skills, academics, and interests so the platform knows your strengths.' },
  { icon: Sparkles, step: '02', title: 'Get AI Recommendations', text: 'Receive ranked internships with match scores and clear reasoning.' },
  { icon: Send, step: '03', title: 'Apply for Internships', text: 'One-click applications with status tracking from day one.' },
  { icon: Award, step: '04', title: 'Gain Real Experience', text: 'Complete projects, earn achievements, and build your portfolio.' },
]

const HowItWorks = () => (
  <section className="landing-section landing-how">
    <motion.div
      className="landing-section-head"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
    >
      <span className="landing-section-label">How it works</span>
      <h2>From profile to placement in four steps</h2>
      <p>A guided journey designed for busy engineering students.</p>
    </motion.div>

    <motion.ol
      className="landing-timeline"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {steps.map((item, i) => {
        const Icon = item.icon
        return (
          <motion.li key={item.step} className="landing-timeline-item" variants={fadeUp} custom={i}>
            <div className="landing-timeline-marker">
              <Icon size={22} />
            </div>
            <div className="landing-timeline-card">
              <span className="landing-step-num">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </motion.li>
        )
      })}
    </motion.ol>
  </section>
)

export default HowItWorks
