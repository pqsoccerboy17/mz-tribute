import { useState, useMemo } from 'react'
import type { Memory } from '../../lib/types'
import { MemoryCard } from './MemoryCard'
import { MemoryDetail } from './MemoryDetail'
import { MemoryFilter } from './MemoryFilter'
import { Container } from '../layout/Container'
import { useIntersection } from '../../hooks/useIntersection'
import { cn } from '../../lib/utils'

interface MemoryWallProps {
  memories: Memory[]
  loading: boolean
}

export function MemoryWall({ memories, loading }: MemoryWallProps) {
  const [filter, setFilter] = useState('all')
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const { ref, isVisible } = useIntersection()

  const filteredMemories = useMemo(() => {
    if (filter === 'all') return memories
    if (filter === 'stories')
      return memories.filter((m) => m.content && m.content.length > 50)
    if (filter === 'photos')
      return memories.filter((m) =>
        m.media_urls.some((url) => !url.match(/\.(mp4|mov|webm)$/i))
      )
    if (filter === 'videos')
      return memories.filter((m) =>
        m.media_urls.some((url) => url.match(/\.(mp4|mov|webm)$/i))
      )
    return memories
  }, [memories, filter])

  // Separate featured memories for the top row
  const featured = filteredMemories.filter((m) => m.is_featured)
  const rest = filteredMemories.filter((m) => !m.is_featured)

  return (
    <Container id="memories" className="py-16 sm:py-24">
      {/* Section header */}
      <div
        ref={ref}
        className={cn(
          'mb-8 transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
      >
        <h2 className="font-display text-3xl sm:text-4xl text-cream mb-2">
          Memories
        </h2>
        <p className="text-text-secondary mb-6">
          {memories.length} tributes from the SSU Soccer family
        </p>
        <MemoryFilter activeFilter={filter} onFilterChange={setFilter} />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-ssu-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Featured memories row */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {featured.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onSelect={setSelectedMemory}
            />
          ))}
        </div>
      )}

      {/* Masonry grid for the rest */}
      <div className="masonry-grid">
        {rest.map((memory) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            onSelect={setSelectedMemory}
          />
        ))}
      </div>

      {/* Empty state */}
      {!loading && filteredMemories.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg">No memories found for this filter.</p>
          <p className="text-sm mt-2">Try "All" to see everything.</p>
        </div>
      )}

      {/* Detail modal */}
      {selectedMemory && (
        <MemoryDetail
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
        />
      )}
    </Container>
  )
}
