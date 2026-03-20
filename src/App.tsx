import { useState } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/hero/Hero'
import { MemoryWall } from './components/memories/MemoryWall'
import { SubmitMemory } from './components/memories/SubmitMemory'
import { MediaGallery } from './components/gallery/MediaGallery'
import { SpotifyEmbed } from './components/music/SpotifyEmbed'
import { AboutMZ } from './components/about/AboutMZ'
import { useMemories } from './hooks/useMemories'

export function App() {
  const { memories, loading, submitMemory } = useMemories()
  const [submitOpen, setSubmitOpen] = useState(false)

  return (
    <div className="min-h-screen bg-navy">
      <Header onSubmitClick={() => setSubmitOpen(true)} />

      <main>
        <Hero />
        <MemoryWall memories={memories} loading={loading} />
        <MediaGallery memories={memories} />
        <SpotifyEmbed />
        <AboutMZ />
      </main>

      <Footer />

      {/* Submit memory modal */}
      <SubmitMemory
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onSubmit={submitMemory}
      />

      {/* Mobile FAB for submit */}
      <button
        onClick={() => setSubmitOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-ssu-blue hover:bg-ssu-blue-light text-cream shadow-lg shadow-ssu-blue/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
        aria-label="Share a memory"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  )
}
