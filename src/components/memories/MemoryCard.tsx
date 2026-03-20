import { useState } from 'react'
import { Image as ImageIcon, Play } from 'lucide-react'
import type { Memory } from '../../lib/types'
import { cn, formatDate, truncate } from '../../lib/utils'
import { useIntersection } from '../../hooks/useIntersection'

interface MemoryCardProps {
  memory: Memory
  onSelect: (memory: Memory) => void
}

export function MemoryCard({ memory, onSelect }: MemoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { ref, isVisible } = useIntersection({ threshold: 0.15 })

  const hasMedia = memory.media_urls.length > 0
  const isLong = (memory.content?.length || 0) > 200
  const displayText = expanded
    ? memory.content || ''
    : truncate(memory.content || '', 200)

  return (
    <div
      ref={ref}
      className={cn(
        'group bg-navy-light border border-white/5 rounded-xl p-5 cursor-pointer',
        'transition-all duration-300 hover:border-ssu-blue/30 hover:shadow-lg hover:shadow-ssu-blue/5',
        'hover:-translate-y-0.5',
        memory.is_featured && 'border-l-2 border-l-bvb-yellow',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      style={{ transition: 'opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, box-shadow 0.3s' }}
      onClick={() => onSelect(memory)}
    >
      {/* Author + date */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-cream text-sm">
          {memory.author_name}
        </h3>
        {memory.era && (
          <span className="text-xs text-text-muted bg-navy-lighter px-2 py-0.5 rounded-full">
            {memory.era}
          </span>
        )}
      </div>

      {/* Content */}
      {memory.content && (
        <div className="mb-3">
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
            {displayText}
          </p>
          {isLong && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(!expanded)
              }}
              className="text-ssu-blue-light text-xs mt-1 hover:underline cursor-pointer"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Media indicator */}
      {hasMedia && (
        <div className="flex gap-2 mb-3">
          {memory.media_urls.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className="relative w-16 h-16 rounded-lg bg-navy-lighter overflow-hidden"
            >
              {url.match(/\.(mp4|mov|webm)$/i) ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-text-muted" />
                </div>
              ) : (
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          ))}
          {memory.media_urls.length > 3 && (
            <div className="w-16 h-16 rounded-lg bg-navy-lighter flex items-center justify-center">
              <span className="text-text-muted text-xs">
                +{memory.media_urls.length - 3}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 text-text-muted text-xs">
        <time>{formatDate(memory.whatsapp_timestamp || memory.created_at)}</time>
        {hasMedia && (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {memory.media_urls.length}
          </span>
        )}
        {memory.source === 'whatsapp' && (
          <span className="text-pitch-green">via WhatsApp</span>
        )}
      </div>
    </div>
  )
}
