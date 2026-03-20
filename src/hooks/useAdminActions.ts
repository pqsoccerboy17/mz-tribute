import { supabase } from '../lib/supabase'
import { useRefetch } from '../contexts/RefetchContext'

/**
 * Admin mutation hook. Automatically refetches memories after
 * each successful action to keep UI in sync with database.
 * This is needed because Supabase realtime WebSocket can be unreliable.
 */
export function useAdminActions() {
  const refetch = useRefetch()

  async function hideMemory(id: string) {
    const { error } = await supabase
      .from('memories')
      .update({ is_approved: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      console.error('Failed to hide memory:', error.message)
      return false
    }
    refetch()
    return true
  }

  async function showMemory(id: string) {
    const { error } = await supabase
      .from('memories')
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      console.error('Failed to show memory:', error.message)
      return false
    }
    refetch()
    return true
  }

  async function toggleFeatured(id: string, current: boolean) {
    const { error } = await supabase
      .from('memories')
      .update({ is_featured: !current, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      console.error('Failed to toggle featured:', error.message)
      return false
    }
    refetch()
    return true
  }

  async function rotateMemory(id: string, current: number) {
    const { error } = await supabase
      .from('memories')
      .update({ rotation: (current + 90) % 360, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      console.error('Failed to rotate:', error.message)
      return false
    }
    refetch()
    return true
  }

  return { hideMemory, showMemory, toggleFeatured, rotateMemory }
}
