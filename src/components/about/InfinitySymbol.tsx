import { motion } from 'motion/react'

interface InfinitySymbolProps {
  isVisible?: boolean
}

/** The lemniscate path -- figure-8 in an 80x36 viewbox */
const INFINITY_PATH =
  'M 40 18 C 40 4, 68 4, 68 18 C 68 32, 40 32, 40 18 C 40 4, 12 4, 12 18 C 12 32, 40 32, 40 18'

/** Animated infinity lemniscate -- MZ's impact is eternal */
export function InfinitySymbol({ isVisible = true }: InfinitySymbolProps) {
  return (
    <motion.div
      className="flex justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
    >
      <svg
        viewBox="0 0 80 36"
        className="w-20 h-9 sm:w-28 sm:h-12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Infinity"
        role="img"
      >
        {/* Base track -- subtle groove the comet travels along */}
        <path
          d={INFINITY_PATH}
          stroke="var(--color-bvb-yellow)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.08"
        />

        {/* Glow layer -- blurred animated segment for soft halo */}
        {isVisible && (
          <path
            d={INFINITY_PATH}
            className="infinity-glow"
            stroke="var(--color-bvb-yellow)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.25"
          />
        )}

        {/* Bright segment -- the comet tracing the eternal path */}
        {isVisible && (
          <path
            d={INFINITY_PATH}
            className="infinity-trace"
            stroke="var(--color-bvb-yellow)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
        )}
      </svg>
    </motion.div>
  )
}
