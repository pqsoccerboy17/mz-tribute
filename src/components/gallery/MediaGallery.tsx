import { useState, useMemo } from 'react'
import { Play, Image as ImageIcon, EyeOff, RotateCw, Loader2, Check } from 'lucide-react'
import { motion } from 'motion/react'
import type { Memory } from '../../lib/types'
import { Container } from '../layout/Container'
import { LightboxModal } from './LightboxModal'
import { useIntersection } from '../../hooks/useIntersection'
import { useVideoThumbnail } from '../../hooks/useVideoThumbnail'
import { cn, isVideoUrl } from '../../lib/utils'
import { useAdmin } from '../../hooks/useAdmin'
import { useAdminActions } from '../../hooks/useAdminActions'

interface MediaGalleryProps {
  memories: Memory[]
}

interface GalleryItem {
  url: string
  type: 'image' | 'video'
  author: string
  memoryId: string
  isApproved: boolean
}

function VideoGridItem({ item, index, onClick }: { item: GalleryItem; index: number; onClick: () => void }) {
  const { thumbnail, loading } = useVideoThumbnail(item.url, true)

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.03, 0.36), duration: 0.3 }}
      onClick={onClick}
      className="relative aspect-square rounded-lg overflow-hidden bg-navy-lighter group cursor-pointer ring-1 ring-bvb-yellow/15"
    >
      {loading || !thumbnail ? (
        <div className={cn('w-full h-full', loading ? 'thumbnail-shimmer' : 'bg-navy-lighter')} />
      ) : (
        <img
          src={thumbnail}
          alt={`Video shared by ${item.author}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}

      {/* Play overlay */}
      <div className="video-play-overlay">
        <div className="w-12 h-12 rounded-full bg-navy/60 backdrop-blur-sm flex items-center justify-center ring-2 ring-bvb-yellow/30">
          <Play className="w-5 h-5 text-bvb-yellow fill-bvb-yellow/30 ml-0.5" />
        </div>
      </div>

      {/* VIDEO badge */}
      <span className="video-badge">Video</span>

      {/* Author on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
        <span className="text-white text-xs truncate">{item.author}</span>
      </div>
    </motion.button>
  )
}

function AdminGalleryOverlay({ item }: { item: GalleryItem }) {
  const { hideMemory } = useAdminActions()
  const [confirmHide, setConfirmHide] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleHide(e: React.MouseEvent) {
    e.stopPropagation()
    if (loading || success) return
    if (confirmHide) {
      setConfirmHide(false)
      setLoading(true)
      const ok = await hideMemory(item.memoryId)
      setLoading(false)
      if (ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 800)
      }
    } else {
      setConfirmHide(true)
      setTimeout(() => setConfirmHide(false), 3000)
    }
  }

  return (
    <>
      {/* Full-item overlay while hiding */}
      {(loading || success) && (
        <div className={cn(
          'absolute inset-0 z-20 flex items-center justify-center rounded-lg transition-opacity',
          loading ? 'bg-navy/70' : 'bg-pitch-green/30'
        )}>
          {loading ? (
            <Loader2 className="w-6 h-6 text-cream animate-spin" />
          ) : (
            <Check className="w-6 h-6 text-pitch-green" />
          )}
        </div>
      )}
      <div className="absolute top-1.5 right-1.5 flex gap-1 z-10">
        <button
          onClick={handleHide}
          disabled={loading || success}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-colors cursor-pointer',
            confirmHide
              ? 'bg-red-500/80 hover:bg-red-500'
              : 'bg-navy/80 hover:bg-navy'
          )}
          title={confirmHide ? 'Tap again to hide' : 'Hide memory'}
        >
          <EyeOff className={cn('w-4 h-4', confirmHide ? 'text-white' : 'text-text-muted')} />
        </button>
      </div>
    </>
  )
}

function AdminRotateOverlay({ item }: { item: GalleryItem }) {
  const { rotateMemory } = useAdminActions()

  function handleRotate(e: React.MouseEvent) {
    e.stopPropagation()
    // Rotate from 0 since we don't track per-image rotation in the gallery view
    rotateMemory(item.memoryId, 0)
  }

  if (item.type === 'video') return null

  return (
    <div className="absolute top-1.5 left-1.5 z-10">
      <button
        onClick={handleRotate}
        className="w-8 h-8 flex items-center justify-center bg-navy/80 backdrop-blur-sm rounded-full hover:bg-navy transition-colors cursor-pointer"
        title="Rotate photo"
      >
        <RotateCw className="w-4 h-4 text-text-muted" />
      </button>
    </div>
  )
}

function AdminUnhideOverlay({ item }: { item: GalleryItem }) {
  const { showMemory } = useAdminActions()
  const [loading, setLoading] = useState(false)

  async function handleUnhide(e: React.MouseEvent) {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    await showMemory(item.memoryId)
    setLoading(false)
  }

  return (
    <div className="absolute bottom-1.5 right-1.5 z-10">
      <button
        onClick={handleUnhide}
        disabled={loading}
        className="w-8 h-8 flex items-center justify-center bg-pitch-green/80 backdrop-blur-sm rounded-full hover:bg-pitch-green transition-colors cursor-pointer"
        title="Unhide"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : (
          <EyeOff className="w-4 h-4 text-white" />
        )}
      </button>
    </div>
  )
}

export function MediaGallery({ memories }: MediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { ref, isVisible } = useIntersection()
  const { isAdmin } = useAdmin()

  const items: GalleryItem[] = useMemo(() => {
    const result: GalleryItem[] = []
    for (const memory of memories) {
      for (const url of memory.media_urls) {
        result.push({
          url,
          type: isVideoUrl(url) ? 'video' : 'image',
          author: memory.author_name,
          memoryId: memory.id,
          isApproved: memory.is_approved,
        })
      }
    }
    return result
  }, [memories])

  if (items.length === 0) return null

  return (
    <div className="relative">
      <div className="absolute inset-0 floodlight-glow pointer-events-none opacity-50" />

      <Container id="gallery" className="relative py-16 sm:py-24">
        <div className="section-divider mb-12" />

        <div
          ref={ref}
          className={cn(
            'mb-8 transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
        >
          <div className="flex items-center gap-4 mb-2">
            <h2 className="font-display text-3xl sm:text-4xl text-cream">
              Gallery
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-pitch-green/20 to-transparent" />
          </div>
          <p className="text-text-secondary flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            {items.length} photos and videos from the community
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {items.map((item, i) => (
            <div key={`${item.memoryId}-${item.url}`} className={cn('relative', !item.isApproved && isAdmin && 'opacity-50')}>
              {/* Hidden badge + unhide button for admin */}
              {isAdmin && !item.isApproved && (
                <>
                  <span className="absolute top-1.5 left-1/2 -translate-x-1/2 z-20 text-xs font-bold text-red-400 bg-red-400/15 border border-red-400/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    Hidden
                  </span>
                  <AdminUnhideOverlay item={item} />
                </>
              )}

              {/* Admin overlays */}
              {isAdmin && item.isApproved && (
                <>
                  <AdminGalleryOverlay item={item} />
                  <AdminRotateOverlay item={item} />
                </>
              )}

              {item.type === 'video' ? (
                <VideoGridItem
                  item={item}
                  index={i}
                  onClick={() => setLightboxIndex(i)}
                />
              ) : (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.03, 0.36), duration: 0.3 }}
                  onClick={() => setLightboxIndex(i)}
                  className="relative aspect-square rounded-lg overflow-hidden bg-navy-lighter group cursor-pointer ring-1 ring-white/5"
                >
                  <img
                    src={item.url}
                    alt={`Shared by ${item.author}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-white text-xs truncate">{item.author}</span>
                  </div>
                </motion.button>
              )}
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <LightboxModal
            items={items}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </Container>
    </div>
  )
}
