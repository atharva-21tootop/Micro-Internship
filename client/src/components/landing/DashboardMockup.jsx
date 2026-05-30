import { motion } from 'framer-motion'
import { Sparkles, Briefcase, CheckCircle, TrendingUp } from 'lucide-react'
import { floatY, floatYAlt } from './landingMotion'

const DashboardMockup = () => (
  <div className="landing-mockup-wrap">
    <motion.div className="landing-mockup-frame" variants={floatY} animate="animate" initial={false}>
      <div className="landing-mockup-topbar">
        <span className="landing-mockup-dot" />
        <span className="landing-mockup-dot" />
        <span className="landing-mockup-dot" />
        <span className="landing-mockup-title">MicroIntern Dashboard</span>
      </div>
      <div className="landing-mockup-body">
        <div className="landing-mockup-sidebar">
          <span className="active" />
          <span />
          <span />
          <span />
        </div>
        <div className="landing-mockup-main">
          <div className="landing-mockup-stat-row">
            <div className="landing-mini-stat"><strong>12</strong><small>Applications</small></div>
            <div className="landing-mini-stat"><strong>94%</strong><small>Profile</small></div>
            <div className="landing-mini-stat accent"><strong>AI</strong><small>Match</small></div>
          </div>
          <div className="landing-mockup-card-row">
            <div className="landing-mock-internship">
              <Briefcase size={16} />
              <div>
                <strong>Frontend Intern</strong>
                <small>TechCorp · Remote</small>
              </div>
              <span className="landing-pill">92% match</span>
            </div>
            <div className="landing-mock-internship">
              <Briefcase size={16} />
              <div>
                <strong>Data Analyst</strong>
                <small>Analytics Co</small>
              </div>
              <span className="landing-pill">87% match</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    <motion.div className="landing-float-card landing-float-card-1" variants={floatYAlt} animate="animate">
      <Sparkles size={18} />
      <div>
        <strong>AI Recommended</strong>
        <p>3 new matches for your skills</p>
      </div>
    </motion.div>

    <motion.div
      className="landing-float-card landing-float-card-2"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
    >
      <CheckCircle size={18} />
      <div>
        <strong>Application Sent</strong>
        <p>Frontend Intern · Pending</p>
      </div>
    </motion.div>

    <motion.div
      className="landing-float-card landing-float-card-3"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
    >
      <TrendingUp size={18} />
      <div>
        <strong>Profile 78%</strong>
        <p>Add 2 skills to boost match</p>
      </div>
    </motion.div>
  </div>
)

export default DashboardMockup
