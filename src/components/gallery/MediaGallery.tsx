import { useState, useMemo } from 'react'
import { Play, Image as ImageIcon } from 'lucide-react'
import { motion } from 'motion/react'
import type { Memory } from '../../lib/types'
import { Container } from '../layout/Container'
import { LightboxModal } from './LightboxModal'
import { useIntersection } from '../../hooks/useIntersection'
import { useVideoThumbnail } from '../../hooks/useVideoThumbnail'
import { cn } from '../../lib/utils'

interface MediaGalleryProps {
  memories: Memory[]
}

interface GalleryItem {
  url: string
  type: 'image' | 'video'
  author: string
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

export function MediaGallery({ memories }: MediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { ref, isVisible } = useIntersection()

  const items: GalleryItem[] = useMemo(() => {
    const result: GalleryItem[] = []
    for (const memory of memories) {
      for (const url of memory.media_urls) {
        result.push({
          url,
          type: url.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image',
          author: memory.author_name,
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
          {items.map((item, i) =>
            item.type === 'video' ? (
              <VideoGridItem
                key={i}
                item={item}
                index={i}
                onClick={() => setLightboxIndex(i)}
              />
            ) : (
              <motion.button
                key={i}
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
            )
          )}
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
