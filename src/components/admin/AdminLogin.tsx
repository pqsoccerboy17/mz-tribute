import { useState } from 'react'
import { X } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'

interface AdminLoginProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminLogin({ isOpen, onClose }: AdminLoginProps) {
  const { login } = useAdmin()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await login(password)
      onClose()
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-navy-light border border-bvb-yellow/20 rounded-2xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-navy-lighter transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 text-text-secondary" />
        </button>

        <h2 className="font-display text-xl text-cream mb-1">Admin Login</h2>
        <p className="text-text-muted text-sm mb-5">Enter admin password</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-text-secondary text-sm mb-1">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
              className="w-full bg-navy border border-white/10 rounded-lg px-3 py-2 text-cream text-sm focus:outline-none focus:border-bvb-yellow/40 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-bvb-yellow/90 hover:bg-bvb-yellow text-navy font-semibold text-sm py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(253,225,0,0.15)]"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
