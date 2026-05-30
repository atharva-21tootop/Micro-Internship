import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, Sparkles } from 'lucide-react'
import { floatY } from './landingMotion'

const SLIDES = [
  {
    title: 'What is MicroIntern?',
    text: 'MITAOE\'s verified micro-internship portal connecting students, organizations, and faculty in one trusted platform.',
  },
  {
    title: 'For Students',
    text: 'Discover short-term internships, build your profile, and apply with AI-powered skill matching.',
  },
  {
    title: 'AI Recommendations',
    text: 'Our engine scores each opportunity against your skills and explains why you are a strong fit.',
  },
  {
    title: 'For Organizations',
    text: 'Post internships, review applicants, and access motivated student talent from MITAOE.',
  },
  {
    title: 'Faculty Verification',
    text: 'Every listing and organization is reviewed by department admins for quality and safety.',
  },
  {
    title: 'Real Career Impact',
    text: 'Track applications, earn achievements, and gain industry exposure before graduation.',
  },
]

const ExplainerVideoCard = () => {
  const [open, setOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [modalIndex, setModalIndex] = useState(0)
  const hoverTimerRef = useRef(null)

  useEffect(() => () => {
    if (hoverTimerRef.current) clearInterval(hoverTimerRef.current)
  }, [])

  const handleHoverStart = () => {
    if (hoverTimerRef.current) clearInterval(hoverTimerRef.current)
    hoverTimerRef.current = setInterval(() => {
      setPreviewIndex((i) => (i + 1) % SLIDES.length)
    }, 2800)
  }

  const handleHoverEnd = () => {
    if (hoverTimerRef.current) clearInterval(hoverTimerRef.current)
    setPreviewIndex(0)
  }

  return (
    <>
      <motion.div
        className="landing-explainer-card"
        variants={floatY}
        animate="animate"
        initial={false}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      >
        <div className="landing-explainer-glow" />
        <div className="landing-explainer-inner">
          <span className="landing-explainer-badge">
            <Sparkles size={14} /> AI Explainer · ~45 sec
          </span>
          <h3>What is MicroIntern?</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={previewIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="landing-explainer-preview"
            >
              {SLIDES[previewIndex].text}
            </motion.p>
          </AnimatePresence>
          <button type="button" className="landing-play-btn" onClick={() => setOpen(true)} aria-label="Play explainer">
            <span className="landing-play-pulse" />
            <Play size={22} fill="currentColor" />
          </button>
          <span className="landing-explainer-hint">Hover for preview · Click to watch</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="landing-video-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="landing-video-modal"
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="landing-modal-close" onClick={() => setOpen(false)} aria-label="Close">
                <X size={22} />
              </button>
              <div className="landing-modal-player">
                <div className="landing-modal-slide-visual">
                  <Sparkles size={40} />
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={modalIndex}
                    className="landing-modal-slide-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h2>{SLIDES[modalIndex].title}</h2>
                    <p>{SLIDES[modalIndex].text}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="landing-modal-progress">
                  {SLIDES.map((_, i) => (
                    <span key={i} className={i <= modalIndex ? 'filled' : ''} />
                  ))}
                </div>
              </div>
              <div className="landing-modal-controls">
                <button
                  type="button"
                  className="saas-btn saas-btn-outline btn-sm"
                  disabled={modalIndex === 0}
                  onClick={() => setModalIndex((i) => Math.max(0, i - 1))}
                >
                  Previous
                </button>
                <span>{modalIndex + 1} / {SLIDES.length}</span>
                {modalIndex < SLIDES.length - 1 ? (
                  <button
                    type="button"
                    className="saas-btn saas-btn-primary btn-sm"
                    onClick={() => setModalIndex((i) => i + 1)}
                  >
                    Next
                  </button>
                ) : (
                  <button type="button" className="saas-btn saas-btn-primary btn-sm" onClick={() => setOpen(false)}>
                    Got it
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ExplainerVideoCard
