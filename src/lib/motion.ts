/**
 * Pop-in used by every header window (contact.sh, control.md, the code and
 * audio menus): a quick springy scale-up from the corner it is anchored to.
 * Spread onto a framer-motion element inside <AnimatePresence>.
 */
export const POP_IN = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.92 },
  transition: { type: 'spring', stiffness: 380, damping: 26 },
} as const
