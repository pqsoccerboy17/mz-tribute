/** Supabase database type definitions */
export interface Database {
  public: {
    Tables: {
      memories: {
        Row: Memory
        Insert: MemoryInsert
        Update: Partial<MemoryInsert>
      }
      media: {
        Row: Media
        Insert: MediaInsert
        Update: Partial<MediaInsert>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export interface Memory {
  id: string
  author_name: string
  content: string | null
  media_urls: string[]
  source: 'whatsapp' | 'web'
  whatsapp_timestamp: string | null
  era: string | null
  is_featured: boolean
  is_approved: boolean
  rotation: number
  created_at: string
  updated_at: string
}

export interface MemoryInsert {
  author_name: string
  content?: string | null
  media_urls?: string[]
  source?: 'whatsapp' | 'web'
  whatsapp_timestamp?: string | null
  era?: string | null
  is_featured?: boolean
  is_approved?: boolean
  rotation?: number
}

export interface Media {
  id: string
  memory_id: string | null
  storage_path: string
  url: string
  type: 'image' | 'video'
  thumbnail_url: string | null
  original_filename: string | null
  file_size_bytes: number | null
  width: number | null
  height: number | null
  created_at: string
}

export interface MediaInsert {
  memory_id?: string | null
  storage_path: string
  url: string
  type: 'image' | 'video'
  thumbnail_url?: string | null
  original_filename?: string | null
  file_size_bytes?: number | null
  width?: number | null
  height?: number | null
}
