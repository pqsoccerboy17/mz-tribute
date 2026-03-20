import { motion } from 'motion/react'

interface LifeTimelineProps {
  isVisible?: boolean
}

const MILESTONES = [
  { year: 1962, label: 'Born', shortLabel: 'Born', coaching: false },
  { year: 1983, label: 'Arrived at SSU', shortLabel: 'SSU', coaching: false },
  { year: 1991, label: 'Head Coach', shortLabel: 'Coach', coaching: true },
  { year: 2002, label: 'National Champions', shortLabel: 'Champions', coaching: true },
  { year: 2026, label: 'Forever', shortLabel: 'Forever', coaching: true },
]

const START_YEAR = 1962
const END_YEAR = 2026
const COACHING_START = 1991
const SPAN = END_YEAR - START_YEAR

function pct(year: number) {
  return ((year - START_YEAR) / SPAN) * 100
}

/** Visual timeline of MZ's life milestones */
export function LifeTimeline({ isVisible = false }: LifeTimelineProps) {
  return (
    <div className="py-8">
      {/* Desktop: horizontal timeline */}
      <div className="hidden sm:block">
        <HorizontalTimeline isVisible={isVisible} />
      </div>

      {/* Mobile: vertical timeline */}
      <div className="sm:hidden">
        <VerticalTimeline isVisible={isVisible} />
      </div>
    </div>
  )
}

function HorizontalTimeline({ isVisible }: { isVisible: boolean }) {
  const coachingStart = pct(COACHING_START)

  return (
    <div className="relative h-24 mx-4">
      {/* Full life span line */}
      <div className="absolute top-10 left-0 right-0 h-px bg-text-muted/30" />

      {/* Coaching years highlight */}
      <motion.div
        className="absolute top-[38px] h-[3px] rounded-full bg-bvb-yellow/40"
        style={{ left: `${coachingStart}%`, right: '0%', transformOrigin: 'left' }}
        initial={{ scaleX: 0 }}
        animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
      />

      {/* Milestone dots and labels */}
      {MILESTONES.map((m, i) => (
        <motion.div
          key={m.year}
          className="absolute flex flex-col items-center"
          style={{ left: `${pct(m.year)}%`, transform: 'translateX(-50%)' }}
          initial={{ opacity: 0, y: 8 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 + i * 0.15 }}
        >
          {/* Year label */}
          <span className="font-display text-sm text-bvb-yellow mb-2">
            {m.year === 1962 ? 'c.1962' : m.year}
          </span>

          {/* Dot */}
          <div
            className={`w-3 h-3 rounded-full border-2 ${
              m.coaching
                ? 'bg-bvb-yellow border-bvb-yellow'
                : 'bg-navy border-text-muted/60'
            }`}
          />

          {/* Description -- short labels to prevent overlap */}
          <span className="text-[11px] text-text-muted uppercase tracking-[0.12em] mt-2 whitespace-nowrap">
            {m.shortLabel}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

function VerticalTimeline({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-text-muted/30" />

      {/* Coaching highlight on the line */}
      <motion.div
        className="absolute left-[11px] w-[3px] rounded-full bg-bvb-yellow/40"
        style={{
          top: `${pct(COACHING_START)}%`,
          bottom: '0%',
          transformOrigin: 'top',
        }}
        initial={{ scaleY: 0 }}
        animate={isVisible ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
      />

      <div className="space-y-5">
        {MILESTONES.map((m, i) => (
          <motion.div
            key={m.year}
            className="relative flex items-center gap-3"
            initial={{ opacity: 0, x: -8 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 + i * 0.15 }}
          >
            {/* Dot */}
            <div
              className={`absolute -left-8 w-3 h-3 rounded-full border-2 ${
                m.coaching
                  ? 'bg-bvb-yellow border-bvb-yellow'
                  : 'bg-navy border-text-muted/60'
              }`}
              style={{ transform: 'translateX(6px)' }}
            />

            {/* Year */}
            <span className="font-display text-sm text-bvb-yellow min-w-[3.5rem]">
              {m.year === 1962 ? 'c.1962' : m.year}
            </span>

            {/* Label -- full labels on mobile where there's room */}
            <span className="text-xs text-text-muted uppercase tracking-[0.12em]">
              {m.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
