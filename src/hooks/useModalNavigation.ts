import { useEffect, useCallback } from 'react'

interface UseModalNavigationOptions {
  totalItems: number
  currentIndex: number
  onNavigate: (index: number) => void
  onClose: () => void
  enabled?: boolean
}

/** Shared navigation logic for LightboxModal and MemoryDetail */
export function useModalNavigation({
  totalItems,
  currentIndex,
  onNavigate,
  onClose,
  enabled = true,
}: UseModalNavigationOptions) {
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < totalItems - 1

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1)
  }, [hasNext, currentIndex, onNavigate])

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1)
  }, [hasPrev, currentIndex, onNavigate])

  // Keyboard navigation
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onClose, goNext, goPrev])

  // Body scroll lock
  useEffect(() => {
    if (!enabled) return

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [enabled])

  return { hasPrev, hasNext, goNext, goPrev }
}
