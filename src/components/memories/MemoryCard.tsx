import { useState, useRef } from 'react'
import { Image as ImageIcon, Play, Film, Star, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import type { Memory } from '../../lib/types'
import { cn, formatDate, truncate, isVideoUrl } from '../../lib/utils'
import { useVideoThumbnail } from '../../hooks/useVideoThumbnail'
import { useAdmin } from '../../hooks/useAdmin'
import { useAdminActions } from '../../hooks/useAdminActions'

interface MemoryCardProps {
  memory: Memory
  onSelect: (index: number) => void
  browseIndex: number
  index?: number
}

function VideoThumbnail({ url }: { url: string }) {
  const { thumbnail, loading } = useVideoThumbnail(url, true)

  return (
    <div className="relative w-20 h-20 sm:w-16 sm:h-16 rounded-lg overflow-hidden ring-1 ring-bvb-yellow/15">
      {loading || !thumbnail ? (
        <div className={cn('w-full h-full', loading ? 'thumbnail-shimmer' : 'bg-navy-lighter')}>
          <div className="video-play-overlay">
            <Play className="w-6 h-6 text-bvb-yellow" />
          </div>
        </div>
      ) : (
        <>
          <img src={thumbnail} alt="" className="w-full h-full object-cover" />
          <div className="video-play-overlay">
            <Play className="w-5 h-5 text-bvb-yellow fill-bvb-yellow/30" />
          </div>
        </>
      )}
      <span className="video-badge">Video</span>
    </div>
  )
}

export function MemoryCard({ memory, onSelect, browseIndex, index = 0 }: MemoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { isAdmin } = useAdmin()
  const { hideMemory, showMemory, toggleFeatured } = useAdminActions()
  const [hideConfirm, setHideConfirm] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasMedia = memory.media_urls.length > 0
  const hasVideo = hasMedia && memory.media_urls.some(isVideoUrl)
  const isLong = (memory.content?.length || 0) > 200
  const displayText = expanded
    ? memory.content || ''
    : truncate(memory.content || '', 200)
  const isHidden = !memory.is_approved

  function handleHideClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (hideConfirm) {
      hideMemory(memory.id)
      setHideConfirm(false)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    } else {
      setHideConfirm(true)
      hideTimerRef.current = setTimeout(() => setHideConfirm(false), 2000)
    }
  }

  function handleFeatureClick(e: React.MouseEvent) {
    e.stopPropagation()
    toggleFeatured(memory.id, memory.is_featured)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: Math.min(index * 0.05, 0.3) }}
      className={cn(
        'group relative bg-navy-light rounded-xl p-5 cursor-pointer memory-card-accent',
        'border border-white/[0.04] hover:border-bvb-yellow/20',
        'transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-bvb-yellow/[0.03]',
        memory.is_featured && 'border-l-[3px] border-l-bvb-yellow bg-gradient-to-r from-bvb-yellow/[0.03] to-transparent',
        hasVideo && 'border-t-[2px] border-t-bvb-yellow/10',
        isHidden && 'opacity-50'
      )}
      onClick={() => onSelect(browseIndex)}
    >
      {/* Admin overlay buttons */}
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={handleFeatureClick}
            className="w-7 h-7 flex items-center justify-center bg-navy/80 backdrop-blur-sm rounded-full hover:bg-navy transition-colors cursor-pointer"
            title={memory.is_featured ? 'Remove featured' : 'Mark featured'}
          >
            <Star
              className={cn(
                'w-3.5 h-3.5',
                memory.is_featured
                  ? 'text-bvb-yellow fill-bvb-yellow'
                  : 'text-text-muted'
              )}
            />
          </button>
          {!isHidden ? (
            <button
              onClick={handleHideClick}
              className={cn(
                'w-7 h-7 flex items-center justify-center bg-navy/80 backdrop-blur-sm rounded-full transition-colors cursor-pointer',
                hideConfirm
                  ? 'bg-red-500/80 hover:bg-red-500'
                  : 'hover:bg-navy'
              )}
              title={hideConfirm ? 'Tap again to hide' : 'Hide memory'}
            >
              <EyeOff
                className={cn(
                  'w-3.5 h-3.5',
                  hideConfirm ? 'text-white' : 'text-text-muted'
                )}
              />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); showMemory(memory.id) }}
              className="w-7 h-7 flex items-center justify-center bg-pitch-green/80 backdrop-blur-sm rounded-full hover:bg-pitch-green transition-colors cursor-pointer"
              title="Unhide memory"
            >
              <EyeOff className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      )}

      {/* Hidden badge */}
      {isAdmin && isHidden && (
        <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-red-400 bg-red-400/15 border border-red-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Hidden
        </span>
      )}

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
          {memory.media_urls.slice(0, 3).map((url, i) =>
            isVideoUrl(url) ? (
              <VideoThumbnail key={i} url={url} />
            ) : (
              <div
                key={i}
                className="relative w-20 h-20 sm:w-16 sm:h-16 rounded-lg bg-navy-lighter overflow-hidden ring-1 ring-white/5"
              >
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )
          )}
          {memory.media_urls.length > 3 && (
            <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-lg bg-navy-lighter flex items-center justify-center ring-1 ring-white/5">
              <span className="text-text-muted text-xs">
                +{memory.media_urls.length - 3}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 text-text-muted text-xs pt-2 border-t border-white/[0.04]">
        <time>{formatDate(memory.whatsapp_timestamp || memory.created_at)}</time>
        {hasMedia && (
          <span className="flex items-center gap-1">
            {hasVideo ? <Film className="w-3 h-3 text-bvb-yellow/50" /> : <ImageIcon className="w-3 h-3" />}
            {memory.media_urls.length}
          </span>
        )}
        {memory.source === 'whatsapp' && (
          <span className="text-pitch-green-light text-[10px] uppercase tracking-wider">WhatsApp</span>
        )}
      </div>
    </motion.div>
  )
}
