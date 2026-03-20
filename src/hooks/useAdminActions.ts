import { supabase } from '../lib/supabase'

export function useAdminActions() {
  async function hideMemory(id: string) {
    const { error } = await supabase
      .from('memories')
      .update({ is_approved: false })
      .eq('id', id)
    if (error) throw error
  }

  async function showMemory(id: string) {
    const { error } = await supabase
      .from('memories')
      .update({ is_approved: true })
      .eq('id', id)
    if (error) throw error
  }

  async function toggleFeatured(id: string, current: boolean) {
    const { error } = await supabase
      .from('memories')
      .update({ is_featured: !current })
      .eq('id', id)
    if (error) throw error
  }

  async function rotateMemory(id: string, current: number) {
    const { error } = await supabase
      .from('memories')
      .update({ rotation: (current + 90) % 360 })
      .eq('id', id)
    if (error) throw error
  }

  return { hideMemory, showMemory, toggleFeatured, rotateMemory }
}
