import { ChevronDown } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden film-grain">
      {/* Gradient background with pitch lines texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-light to-navy pitch-lines" />

      {/* Radial glow behind the text */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,59,111,0.4)_0%,transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* SSU Crest / MZ monogram */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-2 border-bvb-yellow/30 bg-ssu-blue/20 animate-pulse-glow">
            <span className="font-display text-4xl text-bvb-yellow">MZ</span>
          </div>
        </div>

        {/* Name */}
        <h1
          className="font-display text-5xl sm:text-7xl lg:text-8xl text-cream mb-4 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          Marcus Ziemer
        </h1>

        {/* Years */}
        <p
          className="text-text-secondary text-lg sm:text-xl tracking-[0.3em] uppercase mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          1983 &mdash; 2025
        </p>

        {/* Tagline */}
        <p
          className="font-display text-2xl sm:text-3xl italic text-bvb-yellow animate-fade-in-up"
          style={{ animationDelay: '0.45s' }}
        >
          You'll Never Walk Alone
        </p>

        {/* Subtitle */}
        <p
          className="mt-6 text-text-secondary max-w-xl mx-auto text-base sm:text-lg leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          Head Coach, SSU Men's Soccer. 40+ years of brotherhood,
          music, and the beautiful game.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
        <ChevronDown className="w-6 h-6 text-text-muted" />
      </div>
    </section>
  )
}
