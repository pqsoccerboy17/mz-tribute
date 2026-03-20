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
        'group relative bg-navy-light rounded-xl p-5 cursor-pointer memory-card-accent',
        'border border-white/[0.04] hover:border-bvb-yellow/20',
        'transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-bvb-yellow/[0.03]',
        memory.is_featured && 'border-l-[3px] border-l-bvb-yellow bg-gradient-to-r from-bvb-yellow/[0.03] to-transparent',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
      style={{ transition: 'opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, box-shadow 0.3s' }}
      onClick={() => onSelect(memory)}
    >
      {/* Author + era tag */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-cream text-sm">
          {memory.author_name}
        </h3>
        {memory.era && (
          <span className="text-[10px] text-bvb-yellow/70 bg-bvb-yellow/[0.08] border border-bvb-yellow/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
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
              className="text-bvb-yellow/70 text-xs mt-1 hover:text-bvb-yellow hover:underline cursor-pointer transition-colors"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Media thumbnails */}
      {hasMedia && (
        <div className="flex gap-2 mb-3">
          {memory.media_urls.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className="relative w-16 h-16 rounded-lg bg-navy-lighter overflow-hidden ring-1 ring-white/5"
            >
              {url.match(/\.(mp4|mov|webm)$/i) ? (
                <div className="w-full h-full flex items-center justify-center bg-navy-lighter">
                  <Play className="w-5 h-5 text-bvb-yellow/50" />
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
            <div className="w-16 h-16 rounded-lg bg-navy-lighter flex items-center justify-center ring-1 ring-white/5">
              <span className="text-text-muted text-xs">
                +{memory.media_urls.length - 3}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer -- matchday programme style */}
      <div className="flex items-center gap-3 text-text-muted text-xs pt-2 border-t border-white/[0.04]">
        <time>{formatDate(memory.whatsapp_timestamp || memory.created_at)}</time>
        {hasMedia && (
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            {memory.media_urls.length}
          </span>
        )}
        {memory.source === 'whatsapp' && (
          <span className="text-pitch-green-light text-[10px] uppercase tracking-wider">WhatsApp</span>
        )}
      </div>
    </div>
  )
}
