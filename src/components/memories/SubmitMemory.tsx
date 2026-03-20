import { useState, useRef, type FormEvent } from 'react'
import { X, Upload, Check, Loader2 } from 'lucide-react'
import { ERAS, MAX_FILES, MAX_FILE_SIZE_MB, MAX_AUTHOR_LENGTH, MAX_CONTENT_LENGTH, SUBMISSION_COOLDOWN_MS, ACCEPTED_MIME_PREFIXES } from '../../lib/constants'
import { useMediaUpload } from '../../hooks/useMediaUpload'
import { cn } from '../../lib/utils'
import type { MemoryInsert } from '../../lib/types'

const COOLDOWN_KEY = 'mz-tribute-last-submit'

function getCooldownRemaining(): number {
  const last = localStorage.getItem(COOLDOWN_KEY)
  if (!last) return 0
  const elapsed = Date.now() - Number(last)
  return Math.max(0, SUBMISSION_COOLDOWN_MS - elapsed)
}

function isValidMediaType(file: File): boolean {
  return ACCEPTED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))
}

interface SubmitMemoryProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (memory: MemoryInsert) => Promise<unknown>
}

type SubmitState = 'idle' | 'uploading' | 'submitting' | 'success' | 'error'

export function SubmitMemory({ isOpen, onClose, onSubmit }: SubmitMemoryProps) {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [era, setEra] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [state, setState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFiles, progress } = useMediaUpload()

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const rejected: string[] = []
    const valid = selected.filter((f) => {
      if (!isValidMediaType(f)) {
        rejected.push(`${f.name} (unsupported format)`)
        return false
      }
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        rejected.push(`${f.name} (exceeds ${MAX_FILE_SIZE_MB}MB)`)
        return false
      }
      return true
    })
    if (rejected.length > 0) {
      setErrorMsg(`Rejected: ${rejected.join(', ')}`)
      setState('error')
    }
    setFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES))
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    // Check cooldown
    const remaining = getCooldownRemaining()
    if (remaining > 0) {
      const secs = Math.ceil(remaining / 1000)
      setState('error')
      setErrorMsg(`Please wait ${secs} seconds before submitting again.`)
      return
    }

    try {
      let mediaUrls: string[] = []

      if (files.length > 0) {
        setState('uploading')
        mediaUrls = await uploadFiles(files)
      }

      setState('submitting')
      await onSubmit({
        author_name: name.trim().slice(0, MAX_AUTHOR_LENGTH),
        content: content.trim().slice(0, MAX_CONTENT_LENGTH) || null,
        media_urls: mediaUrls,
        era: era || undefined,
      })

      // Record submission time for cooldown
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()))

      setState('success')

      // Reset after showing success
      setTimeout(() => {
        setName('')
        setContent('')
        setEra('')
        setFiles([])
        setState('idle')
        onClose()
      }, 2000)
    } catch {
      setState('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-navy-light border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-3 rounded-full hover:bg-navy-lighter transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        {/* Success state */}
        {state === 'success' ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pitch-green/20 mb-4">
              <Check className="w-8 h-8 text-pitch-green" />
            </div>
            <p className="font-display text-xl text-cream">
              Thank you for sharing.
            </p>
            <p className="text-text-secondary mt-2">
              MZ would have loved this.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="font-display text-2xl text-cream mb-1">
              Share a Memory
            </h2>
            <p className="text-text-secondary text-sm mb-6">
              Tell us about your time with MZ. Every story matters.
            </p>

            {/* Name */}
            <label className="block mb-4">
              <span className="text-text-secondary text-sm">
                Your Name <span className="text-terracotta">*</span>
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={MAX_AUTHOR_LENGTH}
                placeholder="How MZ knew you"
                className="mt-1 w-full bg-navy border border-white/10 rounded-lg px-4 py-2.5 text-cream placeholder:text-text-muted focus:outline-none focus:border-ssu-blue transition-colors"
              />
            </label>

            {/* Memory */}
            <label className="block mb-4">
              <div className="flex justify-between items-baseline">
                <span className="text-text-secondary text-sm">Your Memory</span>
                {content.length > MAX_CONTENT_LENGTH * 0.8 && (
                  <span className={cn(
                    'text-xs tabular-nums',
                    content.length >= MAX_CONTENT_LENGTH ? 'text-terracotta' : 'text-text-muted'
                  )}>
                    {content.length}/{MAX_CONTENT_LENGTH}
                  </span>
                )}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                maxLength={MAX_CONTENT_LENGTH}
                placeholder="A story, a moment, something MZ said that stuck with you..."
                className="mt-1 w-full bg-navy border border-white/10 rounded-lg px-4 py-2.5 text-cream placeholder:text-text-muted focus:outline-none focus:border-ssu-blue transition-colors resize-none"
              />
            </label>

            {/* Era */}
            <label className="block mb-4">
              <span className="text-text-secondary text-sm">
                How did you know MZ?
              </span>
              <select
                value={era}
                onChange={(e) => setEra(e.target.value)}
                className="mt-1 w-full bg-navy border border-white/10 rounded-lg px-4 py-2.5 text-cream focus:outline-none focus:border-ssu-blue transition-colors cursor-pointer"
              >
                <option value="">Select one (optional)</option>
                {ERAS.filter((e) => e.value !== 'all').map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </label>

            {/* File upload */}
            <div className="mb-6">
              <span className="text-text-secondary text-sm block mb-2">
                Photos / Videos (up to {MAX_FILES}, {MAX_FILE_SIZE_MB}MB each)
              </span>

              {/* File list */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-navy-lighter rounded-lg px-3 py-1.5 text-sm text-text-secondary"
                    >
                      <span className="truncate max-w-[150px]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        aria-label={`Remove ${file.name}`}
                        className="p-1 text-text-muted hover:text-terracotta cursor-pointer rounded-full hover:bg-white/5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {files.length < MAX_FILES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add photos or videos"
                  className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-white/10 rounded-lg text-text-secondary text-sm hover:border-ssu-blue/50 hover:text-cream transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Add files
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Error */}
            {state === 'error' && (
              <p className="text-terracotta text-sm mb-4">{errorMsg}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!name.trim() || state === 'uploading' || state === 'submitting'}
              className={cn(
                'w-full py-3 rounded-lg font-medium transition-all cursor-pointer',
                'bg-ssu-blue text-cream hover:bg-ssu-blue-light',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center justify-center gap-2'
              )}
            >
              {(state === 'uploading' || state === 'submitting') && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {state === 'uploading'
                ? `Uploading... ${progress}%`
                : state === 'submitting'
                  ? 'Sharing...'
                  : 'Share This Memory'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
