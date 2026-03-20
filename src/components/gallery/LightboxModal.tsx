import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useVideoThumbnail } from '../../hooks/useVideoThumbnail'
import { useModalNavigation } from '../../hooks/useModalNavigation'

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

function LightboxVideo({ url }: { url: string }) {
  const { thumbnail } = useVideoThumbnail(url, true)

  return (
    <div className="broadcast-frame overflow-hidden">
      <video
        key={url}
        src={url}
        poster={thumbnail || undefined}
        controls
        autoPlay
        playsInline
        preload="auto"
        className="max-w-full max-h-[85vh] rounded-lg"
      />
    </div>
  )
}

export function LightboxModal({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  const item = items[currentIndex]
  const { hasPrev, hasNext, goNext, goPrev } = useModalNavigation({
    totalItems: items.length,
    currentIndex,
    onNavigate,
    onClose,
  })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
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

        {/* Counter + Author */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
          <span className="text-bvb-yellow text-sm font-medium tabular-nums">
            {currentIndex + 1} / {items.length}
          </span>
          <span className="text-white/40 text-sm">
            {item.author}
          </span>
        </div>

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

        {/* Media */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center px-12"
          onClick={(e) => e.stopPropagation()}
        >
          {item.type === 'video' ? (
            <LightboxVideo url={item.url} />
          ) : (
            <img
              key={item.url}
              src={item.url}
              alt={`Photo by ${item.author}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          )}
        </motion.div>

        {/* Video indicator */}
        {item.type === 'video' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-bvb-yellow/60 text-xs uppercase tracking-wider">
            Video
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
