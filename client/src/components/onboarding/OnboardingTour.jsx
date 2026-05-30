import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getTourStepsForRole } from './onboardingSteps'
import './OnboardingTour.css'

const OnboardingTour = ({ run, role, onComplete, onSkip }) => {
  const steps = getTourStepsForRole(role)
  const [index, setIndex] = useState(0)
  const [spot, setSpot] = useState(null)

  const step = steps[index]
  const isCenter = !step?.target || step.placement === 'center'
  const progress = ((index + 1) / steps.length) * 100

  const measureTarget = useCallback(() => {
    if (!run || !step?.target) {
      setSpot(null)
      return
    }
    const el = document.querySelector(step.target)
    if (!el) {
      setSpot(null)
      return
    }
    const rect = el.getBoundingClientRect()
    const pad = 8
    setSpot({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    })
  }, [run, step])

  useLayoutEffect(() => {
    measureTarget()
    window.addEventListener('resize', measureTarget)
    window.addEventListener('scroll', measureTarget, true)
    return () => {
      window.removeEventListener('resize', measureTarget)
      window.removeEventListener('scroll', measureTarget, true)
    }
  }, [measureTarget, index, run])

  useEffect(() => {
    if (run) setIndex(0)
  }, [run])

  useEffect(() => {
    if (!run) return undefined
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [run])

  if (!run || !step) return null

  const handleNext = () => {
    if (index < steps.length - 1) setIndex((i) => i + 1)
    else onComplete()
  }

  const handlePrev = () => {
    if (index > 0) setIndex((i) => i - 1)
  }

  const tooltipStyle = () => {
    if (isCenter || !spot) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }
    const top = spot.top + spot.height + 16
    const left = Math.min(Math.max(spot.left, 16), window.innerWidth - 360)
    return { top: Math.min(top, window.innerHeight - 220), left }
  }

  return createPortal(
    <div className="onboarding-root" role="dialog" aria-modal="true" aria-label="Product tour">
      <div className="onboarding-overlay" onClick={onSkip} />
      {spot && !isCenter && (
        <div
          className="onboarding-spotlight"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
          }}
        />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className={`onboarding-tooltip ${isCenter ? 'centered' : ''}`}
          style={tooltipStyle()}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <div className="onboarding-progress">
            <div className="onboarding-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <button type="button" className="onboarding-skip" onClick={onSkip} aria-label="Skip tour">
            <X size={18} />
            Skip
          </button>
          <h3>{step.title}</h3>
          <p>{step.content}</p>
          <div className="onboarding-footer">
            <span className="onboarding-step-count">
              {index + 1} of {steps.length}
            </span>
            <div className="onboarding-actions">
              <button
                type="button"
                className="saas-btn saas-btn-outline btn-sm"
                onClick={handlePrev}
                disabled={index === 0}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button type="button" className="saas-btn saas-btn-primary btn-sm" onClick={handleNext}>
                {index === steps.length - 1 ? 'Finish' : 'Next'}
                {index < steps.length - 1 && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body,
  )
}

export default OnboardingTour
