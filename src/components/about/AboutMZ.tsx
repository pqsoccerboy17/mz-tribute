import { useState, useEffect } from 'react'
import { Container } from '../layout/Container'
import { useIntersection } from '../../hooks/useIntersection'
import { cn } from '../../lib/utils'

/** Counter that slowly ticks up forever -- MZ's impact never stops growing */
function ForeverCounter() {
  const [count, setCount] = useState(130)

  useEffect(() => {
    // Tick up by 1 every 12 seconds -- slow and reverent
    const interval = setInterval(() => {
      setCount((c) => c + 1)
    }, 12000)

    return () => clearInterval(interval)
  }, [])

  return (
    <span className="tabular-nums">
      {count.toLocaleString()}
    </span>
  )
}

const STATS = [
  { number: '40+', label: 'Seasons' },
  { number: 'forever', label: 'Lives Touched', sublabel: 'and counting' },
  { number: '1983', label: 'First Whistle' },
  { number: 'BVB', label: 'Bis zum Tod', sublabel: 'Until death' },
]

export function AboutMZ() {
  const { ref, isVisible } = useIntersection()

  return (
    <Container id="about" className="py-16 sm:py-24">
      <div
        ref={ref}
        className={cn(
          'max-w-3xl mx-auto transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
      >
        {/* Section header -- matchday programme style */}
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-pitch-green/30" />
          <h2 className="font-display text-3xl sm:text-4xl text-cream">
            About MZ
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-pitch-green/30" />
        </div>

        <div className="space-y-6 text-text-secondary leading-relaxed">
          <p>
            Marcus Ziemer coached SSU Men's Soccer for over 40 years, from 1983 to 2025.
            In that time, he built one of the most respected programs in Division II -- not
            just for the wins, but for the culture. Every player who came through Sonoma State
            left with something bigger than a record on a stat sheet. They left with brothers.
          </p>

          <p>
            MZ was a music guy. Van Morrison was gospel. Road trips had soundtracks. Concerts
            were team bonding. He believed that culture wasn't something you talked about -- it
            was something you lived. And he lived it louder than anyone.
          </p>

          <p>
            He loved European football with his whole heart, especially Borussia Dortmund.
            Traveling to Germany with his brothers -- Ben (BZ), Chris (CZ), and Andrew (AZ) --
            for BVB matches was sacred. His last adventure was exactly that: a trip to Dortmund
            in March 2026, singing "You'll Never Walk Alone" in the stands with thousands of
            others. It was the last message he shared with his 130+ alumni family on WhatsApp.
          </p>

          <p>
            Marcus passed away on March 15, 2026, from an accident in Germany. The outpouring
            of love from his players, colleagues, and friends has been overwhelming. This site
            exists to collect and preserve those memories -- the stories, the photos, the inside
            jokes, and the moments that made MZ who he was.
          </p>

          {/* Legacy stats -- matchday programme layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-10">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="stat-card text-center p-5 rounded-xl bg-navy-lighter/80 border border-white/[0.04]"
              >
                <div className="font-display text-2xl sm:text-3xl text-bvb-yellow mb-1">
                  {stat.number === 'forever' ? <ForeverCounter /> : stat.number}
                </div>
                <div className="text-text-muted text-[10px] uppercase tracking-[0.15em]">
                  {stat.label}
                </div>
                {stat.sublabel && (
                  <div className="text-bvb-yellow/40 text-[9px] italic mt-0.5">
                    {stat.sublabel}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* YNWA quote -- stadium banner style */}
          <div className="relative py-8">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bvb-yellow/[0.03] to-transparent rounded-xl" />
            <blockquote className="relative border-l-[3px] border-bvb-yellow pl-6 py-2">
              <p className="font-display text-2xl sm:text-3xl italic text-cream leading-snug">
                "You'll Never Walk Alone"
              </p>
              <cite className="text-bvb-yellow/50 text-sm mt-3 block not-italic">
                MZ's last message -- from the BVB stands in Dortmund, March 2026
              </cite>
            </blockquote>
          </div>
        </div>
      </div>
    </Container>
  )
}
