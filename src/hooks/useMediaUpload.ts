import { useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { STORAGE_BUCKET, MAX_FILE_SIZE_BYTES } from '../lib/constants'

interface UploadResult {
  url: string
  path: string
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  /** Upload a single file to Supabase storage */
  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File ${file.name} exceeds 50MB limit`)
        return null
      }

      if (!isSupabaseConfigured) {
        // Mock upload for development
        return {
          url: URL.createObjectURL(file),
          path: `mock/${file.name}`,
        }
      }

      const ext = file.name.split('.').pop()
      const path = `${crypto.randomUUID()}.${ext}`

      try {
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)

        return { url: publicUrl, path }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        return null
      }
    },
    []
  )

  /** Upload multiple files, returning array of URLs */
  const uploadFiles = useCallback(
    async (files: File[]): Promise<string[]> => {
      setUploading(true)
      setProgress(0)
      setError(null)

      const urls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const result = await uploadFile(files[i])
        if (result) {
          urls.push(result.url)
        }
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      setUploading(false)
      return urls
    },
    [uploadFile]
  )

  return { uploadFiles, uploading, progress, error }
}
