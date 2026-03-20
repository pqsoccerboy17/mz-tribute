import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { MOCK_MEMORIES } from '../lib/mock-data'
import type { Memory, MemoryInsert } from '../lib/types'

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** Fetch all approved memories, newest first */
  const fetchMemories = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setMemories(MOCK_MEMORIES)
      setLoading(false)
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('memories')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setMemories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memories')
    } finally {
      setLoading(false)
    }
  }, [])

  /** Submit a new memory */
  const submitMemory = useCallback(
    async (memory: MemoryInsert): Promise<Memory | null> => {
      if (!isSupabaseConfigured) {
        const newMemory: Memory = {
          id: crypto.randomUUID(),
          author_name: memory.author_name,
          content: memory.content || null,
          media_urls: memory.media_urls || [],
          source: 'web',
          whatsapp_timestamp: null,
          era: memory.era || null,
          is_featured: false,
          is_approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setMemories((prev) => [newMemory, ...prev])
        return newMemory
      }

      try {
        const { data, error: insertError } = await supabase
          .from('memories')
          .insert({ ...memory, source: 'web' })
          .select()
          .single()

        if (insertError) throw insertError
        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit memory')
        return null
      }
    },
    []
  )

  /** Subscribe to real-time inserts */
  useEffect(() => {
    fetchMemories()

    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('memories-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'memories',
          filter: 'is_approved=eq.true',
        },
        (payload) => {
          setMemories((prev) => [payload.new as Memory, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchMemories])

  return { memories, loading, error, submitMemory, refetch: fetchMemories }
}
