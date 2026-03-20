import { ChevronDown } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden film-grain">
      {/* Deep stadium darkness with pitch lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050d1a] via-navy to-navy pitch-lines pitch-center-circle" />

      {/* Floodlight glow from above -- warm amber like stadium lights at night */}
      <div className="absolute inset-0 floodlight-glow animate-flicker" />

      {/* BVB yellow wall glow -- faint golden atmosphere rising from below */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(253,225,0,0.06)_0%,transparent_60%)]" />

      {/* Stadium silhouette -- abstract terrace curves at top */}
      <div className="absolute top-0 left-0 right-0 h-32 opacity-20">
        <svg viewBox="0 0 1440 128" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,128 C240,40 480,10 720,30 C960,50 1200,20 1440,80 L1440,0 L0,0 Z"
            fill="rgba(0,59,111,0.4)"
          />
          <path
            d="M0,128 C360,60 600,20 720,40 C840,60 1080,30 1440,90 L1440,0 L0,0 Z"
            fill="rgba(0,59,111,0.2)"
          />
        </svg>
      </div>

      {/* Terrace diagonal pattern -- subtle */}
      <div className="absolute inset-0 terrace-pattern" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        {/* SSU Crest / MZ monogram -- crest-shaped */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex flex-col items-center">
            {/* Shield shape */}
            <div className="relative">
              <svg viewBox="0 0 80 96" className="w-20 h-24 sm:w-24 sm:h-28">
                {/* Shield outline */}
                <path
                  d="M40,2 L76,18 L76,52 C76,72 60,88 40,94 C20,88 4,72 4,52 L4,18 Z"
                  fill="rgba(0,59,111,0.3)"
                  stroke="rgba(253,225,0,0.5)"
                  strokeWidth="1.5"
                />
                {/* Inner shield */}
                <path
                  d="M40,8 L70,22 L70,50 C70,68 56,82 40,88 C24,82 10,68 10,50 L10,22 Z"
                  fill="rgba(0,59,111,0.5)"
                  stroke="rgba(253,225,0,0.15)"
                  strokeWidth="0.5"
                />
                {/* MZ text */}
                <text
                  x="40"
                  y="56"
                  textAnchor="middle"
                  fontFamily="Georgia, serif"
                  fontSize="28"
                  fontWeight="bold"
                  fill="#FDE100"
                >
                  MZ
                </text>
                {/* Small soccer ball */}
                <circle cx="40" cy="22" r="5" fill="none" stroke="rgba(253,225,0,0.4)" strokeWidth="0.8" />
                <path d="M40,17 L40,27 M35,20 L45,24 M45,20 L35,24" stroke="rgba(253,225,0,0.25)" strokeWidth="0.5" />
              </svg>
              {/* Glow behind shield */}
              <div className="absolute inset-0 animate-pulse-glow rounded-full" />
            </div>
          </div>
        </div>

        {/* Name */}
        <h1
          className="font-display text-5xl sm:text-7xl lg:text-8xl text-cream mb-4 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          Marcus Ziemer
        </h1>

        {/* Decorative pitch line under name */}
        <div
          className="flex items-center justify-center gap-3 mb-6 animate-fade-in-up"
          style={{ animationDelay: '0.25s' }}
        >
          <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-bvb-yellow/40" />
          <span className="text-bvb-yellow/60 text-xs tracking-[0.4em] uppercase font-medium">
            SSU Men's Soccer
          </span>
          <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-bvb-yellow/40" />
        </div>

        {/* Years */}
        <p
          className="text-text-secondary text-lg sm:text-xl tracking-[0.3em] uppercase mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          1983 &mdash; 2025
        </p>

        {/* Tagline -- bigger, more commanding */}
        <p
          className="font-display text-3xl sm:text-4xl italic text-bvb-yellow animate-fade-in-up drop-shadow-[0_0_20px_rgba(253,225,0,0.15)]"
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

      {/* Bottom pitch line -- the touchline */}
      <div className="absolute bottom-20 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pitch-green/20 to-transparent" />

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
        <ChevronDown className="w-6 h-6 text-bvb-yellow/40" />
      </div>
    </section>
  )
}
