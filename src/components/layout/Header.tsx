import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '../../lib/utils'

interface HeaderProps {
  onSubmitClick: () => void
  onAdminTrigger: () => void
}

export function Header({ onSubmitClick, onAdminTrigger }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const tapTimesRef = useRef<number[]>([])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCrestClick = useCallback(() => {
    const now = Date.now()
    tapTimesRef.current.push(now)

    // Keep only taps within the last 1 second
    tapTimesRef.current = tapTimesRef.current.filter((t) => now - t < 1000)

    if (tapTimesRef.current.length >= 3) {
      tapTimesRef.current = []
      onAdminTrigger()
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [onAdminTrigger])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-navy/95 backdrop-blur-md border-b border-bvb-yellow/[0.06] py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
        {/* MZ crest mark - triple-tap opens admin login */}
        <button
          onClick={handleCrestClick}
          className="group flex items-center gap-2 cursor-pointer"
          aria-label="Home"
        >
          <svg viewBox="0 0 28 34" className="w-6 h-7">
            <path
              d="M14,1 L26,6 L26,18 C26,25 21,30 14,33 C7,30 2,25 2,18 L2,6 Z"
              fill="rgba(0,59,111,0.5)"
              stroke="rgba(253,225,0,0.4)"
              strokeWidth="1"
              className="group-hover:fill-[rgba(0,59,111,0.7)] transition-all"
            />
            <text
              x="14"
              y="21"
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontSize="11"
              fontWeight="bold"
              fill="#FDE100"
            >
              MZ
            </text>
          </svg>
        </button>

        <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-text-secondary">
          <button
            onClick={() => scrollTo('memories')}
            className="hover:text-bvb-yellow transition-colors cursor-pointer"
          >
            Memories
          </button>
          <button
            onClick={() => scrollTo('gallery')}
            className="hover:text-bvb-yellow transition-colors cursor-pointer"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollTo('music')}
            className="hover:text-bvb-yellow transition-colors cursor-pointer"
          >
            Music
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="hover:text-bvb-yellow transition-colors cursor-pointer"
          >
            About MZ
          </button>
        </nav>

        <button
          onClick={onSubmitClick}
          className="hidden sm:block bg-bvb-yellow/90 hover:bg-bvb-yellow text-navy text-sm font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer shadow-[0_0_12px_rgba(253,225,0,0.15)] hover:shadow-[0_0_20px_rgba(253,225,0,0.25)]"
        >
          Share a Memory
        </button>
      </div>
    </header>
  )
}
