import { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'

interface HeaderProps {
  onSubmitClick: () => void
}

export function Header({ onSubmitClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-navy/95 backdrop-blur-md border-b border-white/5 py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-display text-xl tracking-wide text-cream hover:text-bvb-yellow transition-colors cursor-pointer"
        >
          MZ
        </button>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-text-secondary">
          <button
            onClick={() => scrollTo('memories')}
            className="hover:text-cream transition-colors cursor-pointer"
          >
            Memories
          </button>
          <button
            onClick={() => scrollTo('gallery')}
            className="hover:text-cream transition-colors cursor-pointer"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollTo('music')}
            className="hover:text-cream transition-colors cursor-pointer"
          >
            Music
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="hover:text-cream transition-colors cursor-pointer"
          >
            About MZ
          </button>
        </nav>

        <button
          onClick={onSubmitClick}
          className="bg-ssu-blue hover:bg-ssu-blue-light text-cream text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Share a Memory
        </button>
      </div>
    </header>
  )
}
