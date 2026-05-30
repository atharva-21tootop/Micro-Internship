import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { fadeUp } from './landingMotion'

const matches = [
  { title: 'React Frontend Intern', company: 'Nova Labs', score: 94, skills: ['React', 'TypeScript', 'CSS'], reason: 'Strong overlap with your web stack and portfolio projects.' },
  { title: 'ML Research Assistant', company: 'DataForge', score: 88, skills: ['Python', 'TensorFlow'], reason: 'Matches AI/ML coursework and listed project experience.' },
  { title: 'DevOps Micro-Intern', company: 'CloudNine', score: 81, skills: ['Docker', 'Linux'], reason: 'Good fit for systems electives and lab certifications.' },
]

const AIRecommendationShowcase = () => (
  <section className="landing-section landing-ai-showcase">
    <div className="landing-ai-grid">
      <motion.div
        className="landing-ai-copy"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
      >
        <span className="landing-section-label">
          <Sparkles size={16} /> AI Engine
        </span>
        <h2>Recommendations that explain themselves</h2>
        <p>
          Every suggestion includes a match score, skill alignment, and human-readable reasoning —
          so you apply with confidence, not guesswork.
        </p>
        <ul className="landing-ai-bullets">
          <li><CheckCircle2 size={18} /> Match score out of 100</li>
          <li><CheckCircle2 size={18} /> Skill overlap highlighting</li>
          <li><CheckCircle2 size={18} /> Personalized reasoning per role</li>
        </ul>
      </motion.div>

      <motion.div
        className="landing-ai-panel"
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="landing-ai-panel-header">
          <Sparkles size={18} />
          <span>AI Recommendations</span>
          <span className="landing-live-pill">Live</span>
        </div>
        {matches.map((m, i) => (
          <motion.div
            key={m.title}
            className="landing-ai-match-card"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.45 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="landing-ai-match-top">
              <div>
                <strong>{m.title}</strong>
                <small>{m.company}</small>
              </div>
              <span className="landing-score-ring">{m.score}%</span>
            </div>
            <div className="landing-ai-skills">
              {m.skills.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <p className="landing-ai-reason">{m.reason}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
)

export default AIRecommendationShowcase
