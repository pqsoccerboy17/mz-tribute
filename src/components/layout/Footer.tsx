export function Footer() {
  return (
    <footer className="relative border-t border-pitch-green/10 bg-[#060e1a] py-16 overflow-hidden">
      {/* Faint terrace pattern */}
      <div className="absolute inset-0 terrace-pattern opacity-50" />

      <div className="relative mx-auto max-w-6xl px-4 text-center">
        {/* YNWA in stadium-banner style */}
        <p className="font-display text-3xl sm:text-4xl italic text-bvb-yellow mb-3 drop-shadow-[0_0_20px_rgba(253,225,0,0.1)]">
          You'll Never Walk Alone
        </p>

        {/* Pitch line divider */}
        <div className="section-divider mb-6 max-w-xs mx-auto" />

        <p className="text-text-secondary text-sm mb-1">
          Marcus Ziemer
        </p>
        <p className="text-text-muted text-xs mb-8 tracking-wider uppercase">
          SSU Men's Soccer -- 1983-2025
        </p>

        <div className="flex items-center justify-center gap-4 text-text-muted text-xs">
          <span>Built with love by the SSU Soccer family</span>
          <span className="text-bvb-yellow/30">&bull;</span>
          <span>130+ alumni strong</span>
        </div>
      </div>
    </footer>
  )
}
