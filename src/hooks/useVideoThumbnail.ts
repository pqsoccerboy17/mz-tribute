import { useEffect, useState } from 'react'
import { extractVideoThumbnail } from '../lib/video-thumbnail'

/** Extract a poster frame from a video URL */
export function useVideoThumbnail(url: string | null, isVideo: boolean) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!url || !isVideo) return

    setLoading(true)
    extractVideoThumbnail(url).then((result) => {
      setThumbnail(result)
      setLoading(false)
    })
  }, [url, isVideo])

  return { thumbnail, loading }
}
