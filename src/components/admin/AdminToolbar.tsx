import { Eye, EyeOff, LogOut } from 'lucide-react'
import { useAdmin } from '../../hooks/useAdmin'

interface AdminToolbarProps {
  totalCount: number
  hiddenCount: number
}

export function AdminToolbar({ totalCount, hiddenCount }: AdminToolbarProps) {
  const { isAdmin, logout, showHidden, toggleShowHidden } = useAdmin()

  if (!isAdmin) return null

  const approvedCount = totalCount - hiddenCount

  return (
    <div className="fixed top-[56px] left-0 right-0 z-40 bg-navy-lighter/95 backdrop-blur-md border-b border-bvb-yellow/10">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-bvb-yellow text-xs font-semibold uppercase tracking-wider">
            Admin Mode
          </span>
          <span className="text-text-muted text-xs">
            {approvedCount} approved / {hiddenCount} hidden
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleShowHidden}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all cursor-pointer ${
              showHidden
                ? 'bg-bvb-yellow/20 text-bvb-yellow border border-bvb-yellow/30'
                : 'bg-white/5 text-text-secondary border border-white/10 hover:border-white/20'
            }`}
          >
            {showHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showHidden ? 'Showing Hidden' : 'Show Hidden'}
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-red-400/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
