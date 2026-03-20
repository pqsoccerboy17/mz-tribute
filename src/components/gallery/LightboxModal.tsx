import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxItem {
  url: string
  type: 'image' | 'video'
  author: string
}

interface LightboxModalProps {
  items: LightboxItem[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function LightboxModal({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  const item = items[currentIndex]
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < items.length - 1

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1)
    },
    [currentIndex, hasPrev, hasNext, onClose, onNavigate]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/60 text-sm">
        {currentIndex + 1} / {items.length}
      </div>

      {/* Nav: Previous */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(currentIndex - 1)
          }}
          className="absolute left-2 sm:left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Nav: Next */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(currentIndex + 1)
          }}
          className="absolute right-2 sm:right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Media */}
      <div
        className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center px-12"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'video' ? (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay
            className="max-w-full max-h-[85vh] rounded-lg"
          />
        ) : (
          <img
            key={item.url}
            src={item.url}
            alt={`Photo by ${item.author}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        )}
      </div>

      {/* Author credit */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
        Shared by {item.author}
      </div>
    </div>
  )
}
