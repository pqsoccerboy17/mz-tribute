/**
 * Visual duplicate and non-tribute media cleanup.
 *
 * After visually auditing the gallery via browser screenshots,
 * this script removes:
 * 1. Non-tribute screenshots (Instagram dashboard, Apple Watch stats)
 * 2. Near-duplicate burst photos (keeps first of each timestamp group)
 *
 * Identifies near-duplicates by grouping media files that were
 * uploaded within 2 seconds of each other (WhatsApp burst pattern).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

// Load env
const envContent = readFileSync(join(PROJECT_ROOT, '.env.local'), 'utf-8')
const env: Record<string, string> = {}
for (const line of envContent.split('\n')) {
  const eq = line.indexOf('=')
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)
const DRY_RUN = process.argv.includes('--dry-run')

interface MediaMemory {
  id: string
  media_urls: string[]
  whatsapp_timestamp: string | null
  created_at: string
}

/** Check if an image is likely a screenshot/non-photo by file size and aspect ratio */
async function isScreenshot(url: string): Promise<boolean> {
  try {
    const resp = await fetch(url, { method: 'HEAD' })
    const contentType = resp.headers.get('content-type') || ''
    // PNG files in a WhatsApp photo export are almost always screenshots
    if (contentType.includes('png')) return true
    return false
  } catch {
    return false
  }
}

async function main() {
  if (DRY_RUN) console.log('*** DRY RUN ***\n')

  // Fetch all approved media-only memories
  const { data: memories, error } = await supabase
    .from('memories')
    .select('id, media_urls, whatsapp_timestamp, created_at')
    .is('content', null)
    .eq('source', 'whatsapp')
    .eq('is_approved', true)
    .order('whatsapp_timestamp', { ascending: true })

  if (error || !memories) {
    console.error('Failed to fetch:', error?.message)
    process.exit(1)
  }

  console.log(`Found ${memories.length} approved media memories\n`)

  const toRemove: { id: string; reason: string }[] = []

  // --- Pass 1: Find near-duplicate bursts (same timestamp within 2 seconds) ---
  console.log('Pass 1: Finding near-duplicate bursts...')

  const groups: MediaMemory[][] = []
  let currentGroup: MediaMemory[] = []

  for (const mem of memories as MediaMemory[]) {
    const ts = mem.whatsapp_timestamp || mem.created_at
    if (!ts) continue

    if (currentGroup.length === 0) {
      currentGroup.push(mem)
      continue
    }

    const lastTs = new Date(currentGroup[currentGroup.length - 1].whatsapp_timestamp || currentGroup[currentGroup.length - 1].created_at).getTime()
    const thisTs = new Date(ts).getTime()

    if (Math.abs(thisTs - lastTs) <= 2000) {
      // Within 2 seconds -- same burst
      currentGroup.push(mem)
    } else {
      if (currentGroup.length > 1) groups.push([...currentGroup])
      currentGroup = [mem]
    }
  }
  if (currentGroup.length > 1) groups.push(currentGroup)

  console.log(`  Found ${groups.length} burst groups`)

  for (const group of groups) {
    // Keep the first photo, remove the rest
    const urls = group.map((m) => m.media_urls[0]?.split('/').pop() || 'unknown')
    console.log(`  Burst (${group.length} items): keeping ${urls[0]}, removing ${urls.slice(1).join(', ')}`)

    for (let i = 1; i < group.length; i++) {
      toRemove.push({
        id: group[i].id,
        reason: `Near-duplicate burst (group of ${group.length}, keeping first)`,
      })
    }
  }

  // --- Pass 2: Find non-photo content (screenshots, app UIs) ---
  console.log('\nPass 2: Checking for screenshots and non-photo content...')

  for (const mem of memories as MediaMemory[]) {
    const url = mem.media_urls[0]
    if (!url) continue

    // Already marked for removal?
    if (toRemove.some((r) => r.id === mem.id)) continue

    // Check if it's a PNG (screenshots in WhatsApp exports are always PNG)
    if (url.toLowerCase().endsWith('.png')) {
      toRemove.push({ id: mem.id, reason: 'PNG file -- likely a screenshot, not a photo' })
      console.log(`  Screenshot (PNG): ${url.split('/').pop()}`)
    }
  }

  // --- Summary ---
  console.log(`\n--- Summary ---`)
  console.log(`  Total media: ${memories.length}`)
  console.log(`  To remove: ${toRemove.length}`)
  console.log(`  Will remain: ${memories.length - toRemove.length}`)

  if (toRemove.length === 0) {
    console.log('\nNothing to remove.')
    return
  }

  console.log('\nRemovals:')
  for (const item of toRemove) {
    console.log(`  ${item.id.slice(0, 8)}... -- ${item.reason}`)
  }

  if (DRY_RUN) {
    console.log(`\n*** DRY RUN -- would remove ${toRemove.length} items ***`)
    return
  }

  // Execute removals
  console.log(`\nRemoving ${toRemove.length} items...`)
  let removed = 0

  for (const item of toRemove) {
    const { error: rpcError } = await supabase.rpc('set_memory_approval', {
      memory_id: item.id,
      approved: false,
    })

    if (rpcError) {
      console.warn(`  Failed: ${item.id} -- ${rpcError.message}`)
    } else {
      removed++
    }
  }

  console.log(`\nDone. Removed ${removed} items. ${memories.length - removed} remaining.`)
}

main().catch(console.error)
