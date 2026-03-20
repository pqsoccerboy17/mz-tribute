/** Era options for memory categorization */
export const ERAS = [
  { value: 'all', label: 'All Memories' },
  { value: 'player', label: 'Player Days' },
  { value: 'post-grad', label: 'After Graduation' },
  { value: 'colleague', label: 'Coaching Colleague' },
  { value: 'family', label: 'Family & Friends' },
] as const

/** Filter options for the memory wall */
export const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'stories', label: 'Stories' },
  { value: 'photos', label: 'Photos' },
  { value: 'videos', label: 'Videos' },
] as const

/** Spotify playlist for "The Sonoma State Sound" */
export const SPOTIFY_PLAYLIST_ID = '51kBceCg0BEAmyZcnwU0RW'

/** Max file upload constraints */
export const MAX_FILES = 5
export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

/** Accepted file types for upload */
export const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
}

/** Supabase storage bucket name */
export const STORAGE_BUCKET = 'tribute-media'
