import { useState, useMemo } from 'react'
import { Play, Image as ImageIcon } from 'lucide-react'
import type { Memory } from '../../lib/types'
import { Container } from '../layout/Container'
import { LightboxModal } from './LightboxModal'
import { useIntersection } from '../../hooks/useIntersection'
import { cn } from '../../lib/utils'

interface MediaGalleryProps {
  memories: Memory[]
}

interface GalleryItem {
  url: string
  type: 'image' | 'video'
  author: string
}

export function MediaGallery({ memories }: MediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { ref, isVisible } = useIntersection()

  // Flatten all media from memories into a gallery
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
    <Container id="gallery" className="py-16 sm:py-24">
      <div
        ref={ref}
        className={cn(
          'mb-8 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
      >
        <h2 className="font-display text-3xl sm:text-4xl text-cream mb-2">
          Gallery
        </h2>
        <p className="text-text-secondary flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          {items.length} photos and videos from the community
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square rounded-lg overflow-hidden bg-navy-lighter group cursor-pointer"
          >
            {item.type === 'video' ? (
              <>
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <img
                src={item.url}
                alt={`Shared by ${item.author}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="text-white text-xs truncate">{item.author}</span>
            </div>
          </button>
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
  )
}
