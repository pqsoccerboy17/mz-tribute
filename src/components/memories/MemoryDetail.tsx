import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { Memory } from '../../lib/types'
import { formatDate, isVideoUrl } from '../../lib/utils'
import { useVideoThumbnail } from '../../hooks/useVideoThumbnail'
import { useModalNavigation } from '../../hooks/useModalNavigation'

interface MemoryDetailProps {
  memories: Memory[]
  currentIndex: number
  onNavigate: (index: number) => void
  onClose: () => void
}

function DetailVideo({ url }: { url: string }) {
  const { thumbnail } = useVideoThumbnail(url, true)

  return (
    <div className="relative rounded-lg overflow-hidden bg-navy-lighter broadcast-frame">
      <video
        src={url}
        poster={thumbnail || undefined}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-lg"
      />
    </div>
  )
}

export function MemoryDetail({ memories, currentIndex, onNavigate, onClose }: MemoryDetailProps) {
  const memory = memories[currentIndex]
  const { hasPrev, hasNext, goNext, goPrev } = useModalNavigation({
    totalItems: memories.length,
    currentIndex,
    onNavigate,
    onClose,
  })

  const videos = memory.media_urls.filter(isVideoUrl)
  const photos = memory.media_urls.filter((url) => !isVideoUrl(url))

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Counter */}
        <div className="absolute top-4 left-4 z-10">
          <span className="text-bvb-yellow text-sm font-medium tabular-nums">
            {currentIndex + 1} / {memories.length}
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Nav: Previous */}
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
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
              goNext()
            }}
            className="absolute right-2 sm:right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Content panel */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative bg-navy-light border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Author */}
          <div className="mb-4">
            <h2 className="font-display text-2xl text-cream">
              {memory.author_name}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-text-muted text-sm">
              <time>
                {formatDate(memory.whatsapp_timestamp || memory.created_at)}
              </time>
              {memory.era && <span>&middot; {memory.era}</span>}
              {memory.source === 'whatsapp' && (
                <span className="text-pitch-green">&middot; via WhatsApp</span>
              )}
            </div>
          </div>

          {/* Content */}
          {memory.content && (
            <p className="text-text-secondary leading-relaxed whitespace-pre-line mb-6">
              {memory.content}
            </p>
          )}

          {/* Videos first -- full width */}
          {videos.length > 0 && (
            <div className="space-y-3 mb-4">
              {videos.map((url) => (
                <DetailVideo key={url} url={url} />
              ))}
            </div>
          )}

          {/* Photos in grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((url) => (
                <div
                  key={url}
                  className="relative rounded-lg overflow-hidden bg-navy-lighter aspect-square ring-1 ring-white/5"
                >
                  <img
                    src={url}
                    alt={`Photo shared by ${memory.author_name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          {memory.media_urls.length === 0 && !memory.content && (
            <div className="flex items-center justify-center py-8 text-text-muted">
              <ImageIcon className="w-8 h-8 mr-3 opacity-50" />
              <span>No additional content</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
