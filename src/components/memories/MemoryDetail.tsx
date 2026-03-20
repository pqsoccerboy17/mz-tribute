import { X, Image as ImageIcon } from 'lucide-react'
import type { Memory } from '../../lib/types'
import { formatDate } from '../../lib/utils'

interface MemoryDetailProps {
  memory: Memory
  onClose: () => void
}

export function MemoryDetail({ memory, onClose }: MemoryDetailProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-navy-light border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-navy-lighter transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

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

        {/* Media */}
        {memory.media_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {memory.media_urls.map((url, i) => (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden bg-navy-lighter aspect-square"
              >
                {url.match(/\.(mp4|mov|webm)$/i) ? (
                  <video
                    src={url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Photo shared by ${memory.author_name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
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
      </div>
    </div>
  )
}
