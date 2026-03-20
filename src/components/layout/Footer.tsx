export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy py-12">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="font-display text-2xl italic text-bvb-yellow mb-2">
          You'll Never Walk Alone
        </p>
        <p className="text-text-secondary text-sm mb-6">
          Marcus Ziemer -- SSU Men's Soccer -- 1983-2025
        </p>
        <div className="flex items-center justify-center gap-6 text-text-muted text-xs">
          <span>Built with love by the SSU Soccer family</span>
          <span>&middot;</span>
          <span>130+ alumni strong</span>
        </div>
      </div>
    </footer>
  )
}
