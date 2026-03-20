import { Container } from '../layout/Container'
import { useIntersection } from '../../hooks/useIntersection'
import { cn } from '../../lib/utils'
import { InfinitySymbol } from './InfinitySymbol'
import { LifeTimeline } from './LifeTimeline'

const STATS = [
  { number: '42', label: 'Years at SSU' },
  { number: 'infinity', label: 'Lives Touched', sublabel: 'and counting' },
  { number: '360', label: 'Career Wins' },
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
            Marcus Ziemer first walked onto the SSU campus in 1983 as a two-time
            all-conference player. He never left. From player to assistant coach
            under Peter Reynaud in 1989, to head coach in 1991, MZ spent 42 years
            building one of Division II's most respected programs. His career record
            of 360-200-70 included a 2002 NCAA National Championship, 8 CCAA
            conference titles, and 6 Coach of the Year honors. But ask any of his
            players, and they won't lead with the wins. They'll tell you about the
            culture.
          </p>

          <p>
            Soccer wasn't just Marcus's career -- it was the family bloodline. His
            wife Trish was an SSU women's soccer star and part of the 1990 NCAA D-II
            national championship team. Their son Thomas played at the highest youth
            levels. Daughter Taylor went pro, currently playing for 1. FC Koln in
            Germany's Frauen-Bundesliga. Daughter Tera was named Division II National
            Player of the Year in 2022 at Western Washington. His brothers -- Ben
            (BZ), Chris (CZ), and Andrew (AZ) -- all coach across Northern
            California. Their father Herb started the Sebastopol Youth Soccer League
            in 1975. The Ziemers didn't just play the game. They grew it across an
            entire region.
          </p>

          <p>
            MZ was a music guy. Van Morrison was gospel. Road trips had soundtracks.
            Concerts were team bonding. He believed that culture wasn't something you
            talked about -- it was something you lived. And he lived it louder than
            anyone.
          </p>

          <p>
            He loved European football with his whole heart, especially Borussia
            Dortmund. Traveling to Germany with his brothers for BVB matches was
            sacred. His last adventure was exactly that: watching BVB beat Augsburg
            2-0 at Signal Iduna Park on March 14, 2026, then sharing "You'll Never
            Walk Alone" with his 130+ alumni family on WhatsApp. It was the last
            message they'd receive from their coach.
          </p>

          <p>
            Marcus passed away on March 17, 2026, from injuries sustained in an
            accident after the match. He was 63. Trish and Taylor were with him. The
            outpouring of love from his players, colleagues, and the soccer community
            has been overwhelming. This site exists to collect and preserve those
            memories -- the stories, the photos, the inside jokes, and the moments
            that made MZ who he was.
          </p>

          {/* Life timeline -- milestones from birth to forever */}
          <LifeTimeline isVisible={isVisible} />

          {/* Legacy stats -- matchday programme layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-10">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="stat-card text-center p-5 rounded-xl bg-navy-lighter/80 border border-white/[0.04]"
              >
                <div className="font-display text-2xl sm:text-3xl text-bvb-yellow mb-1">
                  {stat.number === 'infinity' ? (
                    <InfinitySymbol isVisible={isVisible} />
                  ) : (
                    stat.number
                  )}
                </div>
                <div className="text-text-muted text-[11px] uppercase tracking-[0.15em]">
                  {stat.label}
                </div>
                {stat.sublabel && (
                  <div className="text-bvb-yellow/40 text-[11px] italic mt-0.5">
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
