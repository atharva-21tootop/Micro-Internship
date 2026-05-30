export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
}

export const floatY = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
  },
}

export const floatYAlt = {
  animate: {
    y: [0, 12, 0],
    transition: { duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 },
  },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}
