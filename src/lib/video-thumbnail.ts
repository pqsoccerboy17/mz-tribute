/** Client-side video thumbnail extraction via Canvas API */

const cache = new Map<string, string | null>()

/**
 * Extract a poster frame from a video URL at 0.5 seconds.
 * Returns a data URL (JPEG) or null on failure.
 * Results are cached per session.
 */
export function extractVideoThumbnail(
  videoUrl: string
): Promise<string | null> {
  if (cache.has(videoUrl)) {
    return Promise.resolve(cache.get(videoUrl)!)
  }

  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    const timeout = setTimeout(() => {
      cleanup()
      cache.set(videoUrl, null)
      resolve(null)
    }, 5000)

    function cleanup() {
      clearTimeout(timeout)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      video.removeEventListener('loadedmetadata', onLoaded)
      video.src = ''
      video.load()
    }

    function onSeeked() {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 320
        canvas.height = video.videoHeight || 180
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
          cache.set(videoUrl, dataUrl)
          cleanup()
          resolve(dataUrl)
          return
        }
      } catch {
        // Canvas tainted or draw failed
      }
      cache.set(videoUrl, null)
      cleanup()
      resolve(null)
    }

    function onError() {
      cache.set(videoUrl, null)
      cleanup()
      resolve(null)
    }

    function onLoaded() {
      // Seek to 0.5s or 10% of duration, whichever is less
      video.currentTime = Math.min(0.5, video.duration * 0.1)
    }

    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
    video.src = videoUrl
  })
}
