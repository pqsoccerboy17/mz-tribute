import { useState, useEffect, useMemo } from 'react'
import { AdminProvider } from './contexts/AdminContext'
import { useAdmin } from './hooks/useAdmin'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/hero/Hero'
import { MemoryWall } from './components/memories/MemoryWall'
import { SubmitMemory } from './components/memories/SubmitMemory'
import { MediaGallery } from './components/gallery/MediaGallery'
import { SpotifyEmbed } from './components/music/SpotifyEmbed'
import { AboutMZ } from './components/about/AboutMZ'
import { AdminLogin } from './components/admin/AdminLogin'
import { AdminToolbar } from './components/admin/AdminToolbar'
import { useMemories } from './hooks/useMemories'

function AppContent() {
  const { isAdmin, showHidden } = useAdmin()
  const { memories, loading, submitMemory } = useMemories(isAdmin && showHidden)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  // Keyboard shortcut: Ctrl+Shift+A opens admin login
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        if (!isAdmin) {
          setLoginOpen(true)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAdmin])

  // Compute counts for the admin toolbar
  const { totalCount, hiddenCount } = useMemo(() => {
    if (!isAdmin) return { totalCount: 0, hiddenCount: 0 }
    const hidden = memories.filter((m) => !m.is_approved).length
    return { totalCount: memories.length, hiddenCount: hidden }
  }, [memories, isAdmin])

  function handleAdminTrigger() {
    if (!isAdmin) {
      setLoginOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-navy">
      <Header
        onSubmitClick={() => setSubmitOpen(true)}
        onAdminTrigger={handleAdminTrigger}
      />

      {isAdmin && (
        <AdminToolbar totalCount={totalCount} hiddenCount={hiddenCount} />
      )}

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

      {/* Admin login modal */}
      <AdminLogin
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
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

export function App() {
  return (
    <AdminProvider>
      <AppContent />
    </AdminProvider>
  )
}
