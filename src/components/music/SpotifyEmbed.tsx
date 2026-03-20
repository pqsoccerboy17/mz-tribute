import { SPOTIFY_PLAYLIST_ID } from '../../lib/constants'
import { Container } from '../layout/Container'
import { useIntersection } from '../../hooks/useIntersection'
import { cn } from '../../lib/utils'

export function SpotifyEmbed() {
  const { ref, isVisible } = useIntersection()

  return (
    <Container id="music" className="py-16 sm:py-24">
      <div
        ref={ref}
        className={cn(
          'transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
      >
        <h2 className="font-display text-3xl sm:text-4xl text-cream mb-2">
          The Sonoma State Sound
        </h2>
        <p className="text-text-secondary mb-8 max-w-2xl">
          Music was the thread that ran through everything MZ built. Van Morrison on road trips.
          Metallica before big games. Sublime at house parties. Punk shows with players who became
          brothers. This playlist is the soundtrack of 40 years.
        </p>

        {/* Spotify embed */}
        <div className="rounded-xl overflow-hidden bg-navy-lighter">
          <iframe
            src={`https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`}
            width="100%"
            height="380"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-0"
            title="The Sonoma State Sound - Spotify Playlist"
          />
        </div>
      </div>
    </Container>
  )
}
