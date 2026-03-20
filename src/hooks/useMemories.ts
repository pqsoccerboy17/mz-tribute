import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { MOCK_MEMORIES } from '../lib/mock-data'
import type { Memory, MemoryInsert } from '../lib/types'

export function useMemories(includeHidden = false) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** Fetch memories, newest first. Admin can include hidden ones. */
  const fetchMemories = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setMemories(MOCK_MEMORIES)
      setLoading(false)
      return
    }

    try {
      let query = supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false })

      if (!includeHidden) {
        query = query.eq('is_approved', true)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setMemories(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memories')
    } finally {
      setLoading(false)
    }
  }, [includeHidden])

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

  /** Subscribe to real-time changes */
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
        },
        (payload) => {
          const newMemory = payload.new as Memory
          if (!includeHidden && !newMemory.is_approved) return
          setMemories((prev) => [newMemory, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'memories',
        },
        (payload) => {
          const updated = payload.new as Memory
          setMemories((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'memories',
        },
        (payload) => {
          const deleted = payload.old as { id: string }
          setMemories((prev) => prev.filter((m) => m.id !== deleted.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchMemories, includeHidden])

  return { memories, loading, error, submitMemory, refetch: fetchMemories }
}
