import { Container } from '../layout/Container'
import { useIntersection } from '../../hooks/useIntersection'
import { cn } from '../../lib/utils'

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
        <h2 className="font-display text-3xl sm:text-4xl text-cream mb-8">
          About MZ
        </h2>

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

          {/* Legacy stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8">
            {[
              { number: '40+', label: 'Years Coaching' },
              { number: '130+', label: 'Alumni Family' },
              { number: '1983', label: 'Program Founded' },
              { number: '1', label: 'MZ' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-xl bg-navy-lighter border border-white/5"
              >
                <div className="font-display text-2xl sm:text-3xl text-bvb-yellow">
                  {stat.number}
                </div>
                <div className="text-text-muted text-xs mt-1 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <blockquote className="border-l-2 border-bvb-yellow pl-6 py-2">
            <p className="font-display text-xl italic text-cream">
              "You'll Never Walk Alone"
            </p>
            <cite className="text-text-muted text-sm mt-2 block not-italic">
              -- MZ's last message, from the BVB stands in Dortmund
            </cite>
          </blockquote>
        </div>
      </div>
    </Container>
  )
}
