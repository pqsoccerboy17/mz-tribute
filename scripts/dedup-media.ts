/**
 * Media Deduplication Script
 *
 * Downloads all media-only memories from Supabase, computes MD5 hashes,
 * and removes exact duplicates (keeping the first occurrence).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

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
  created_at: string
}

async function hashUrl(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url)
    if (!resp.ok) return null
    const buffer = await resp.arrayBuffer()
    return createHash('md5').update(Buffer.from(buffer)).digest('hex')
  } catch {
    return null
  }
}

async function main() {
  if (DRY_RUN) console.log('*** DRY RUN -- no database changes ***\n')

  // Fetch all media-only memories
  const { data: memories, error } = await supabase
    .from('memories')
    .select('id, media_urls, created_at')
    .is('content', null)
    .eq('source', 'whatsapp')
    .eq('is_approved', true)
    .order('created_at', { ascending: true })

  if (error || !memories) {
    console.error('Failed to fetch memories:', error?.message)
    process.exit(1)
  }

  console.log(`Found ${memories.length} media-only memories`)
  console.log('Computing hashes (this may take a minute)...\n')

  // Hash each media URL
  const hashMap = new Map<string, MediaMemory>()
  const duplicates: { original: MediaMemory; duplicate: MediaMemory; hash: string }[] = []
  let processed = 0

  for (const mem of memories as MediaMemory[]) {
    const url = mem.media_urls[0]
    if (!url) continue

    const hash = await hashUrl(url)
    processed++

    if (processed % 25 === 0) {
      console.log(`  Processed ${processed}/${memories.length}...`)
    }

    if (!hash) {
      console.warn(`  Could not hash: ${url}`)
      continue
    }

    if (hashMap.has(hash)) {
      duplicates.push({
        original: hashMap.get(hash)!,
        duplicate: mem,
        hash,
      })
    } else {
      hashMap.set(hash, mem)
    }
  }

  console.log(`\n--- Results ---`)
  console.log(`  Total processed: ${processed}`)
  console.log(`  Unique files: ${hashMap.size}`)
  console.log(`  Exact duplicates found: ${duplicates.length}`)

  if (duplicates.length === 0) {
    console.log('\nNo duplicates to remove.')
    return
  }

  console.log('\nDuplicates:')
  for (const dup of duplicates) {
    console.log(`  Hash: ${dup.hash.slice(0, 12)}...`)
    console.log(`    Keep:   ${dup.original.id} (${dup.original.created_at})`)
    console.log(`    Remove: ${dup.duplicate.id} (${dup.duplicate.created_at})`)
  }

  if (DRY_RUN) {
    console.log(`\n*** DRY RUN -- would remove ${duplicates.length} duplicates ***`)
    return
  }

  // Remove duplicates via RPC
  console.log(`\nRemoving ${duplicates.length} duplicates...`)
  let removed = 0

  for (const dup of duplicates) {
    const { error: rpcError } = await supabase.rpc('set_memory_approval', {
      memory_id: dup.duplicate.id,
      approved: false,
    })

    if (rpcError) {
      console.warn(`  Failed to remove ${dup.duplicate.id}: ${rpcError.message}`)
    } else {
      removed++
    }
  }

  console.log(`\nRemoved ${removed} duplicate records.`)
  console.log(`Remaining approved media: ${hashMap.size}`)
}

main().catch(console.error)
