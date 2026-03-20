/**
 * Curate WhatsApp Memories for MZ Tribute
 *
 * Reads all text memories from Supabase, evaluates whether each is a genuine
 * tribute to Marcus Ziemer, and sets is_approved = false on noise/off-topic
 * messages. Generous -- only removes clear non-tributes.
 *
 * After manual review of all 74 records, 3 were identified as noise:
 * - #37 Dave Kaufman: logistics ("Let me check with Jen Beatty / Standby / Amphibious / What city does Peter live in?")
 * - #69 Ben Langwith: logistics poll ("POLL: Tour De Sonoma - Sat 3.21.26 / Riding in Van / Driving Myself")
 * - #71 Shawn P: banter/logistics ("jersey bag", "avocado or Dijon", "I'll bring a case of wine")
 *
 * Usage: npx tsx scripts/curate-memories.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

// ---------------------------------------------------------------------------
// IDs to reject (manually reviewed -- these are not tributes to MZ)
// ---------------------------------------------------------------------------

const REJECT_IDS: Record<string, string> = {
  // Dave Kaufman: "Let me check with Jen Beatty / Standby / Amphibious / What city does Peter live in?"
  // Pure logistics and coordination, no tribute content.
  'a309bdd4-cdae-4af5-acc0-9cb2c89a7167': 'Logistics/coordination - no tribute content',

  // Ben Langwith: "POLL: Tour De Sonoma - Sat 3.21.26 (Dillon Beach) / OPTION: Yes - Riding in the Van / OPTION: Yes - Driving Myself"
  // A WhatsApp poll for event logistics - no tribute content.
  '4c04f4a7-5e3a-4f99-bdce-aebfc4ed0d0d': 'Logistics poll - no tribute content',

  // Shawn P: "Video and document for me please. Langey don't forget the jersey bag this time. / If I see avocado or Dijon I'm calling Bs / I'll bring a case of wine..."
  // Banter about food, jersey bags, and what to bring - no tribute content.
  '0799decf-5b6c-4b16-b916-133bd0fdc63f': 'Banter/logistics - jersey bag, food, wine',
}

// ---------------------------------------------------------------------------
// Load .env.local
// ---------------------------------------------------------------------------

function loadEnv() {
  const envPath = join(PROJECT_ROOT, '.env.local')
  if (!existsSync(envPath)) return
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx)
    const val = trimmed.slice(eqIdx + 1)
    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------

function getSupabaseClient() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''

  if (!url || !key) {
    console.error('Missing Supabase credentials.')
    process.exit(1)
  }

  return createClient(url, key)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadEnv()
  const supabase = getSupabaseClient()

  // Fetch all WhatsApp text memories
  console.log('Fetching WhatsApp text memories from Supabase...\n')

  const { data: memories, error: fetchError } = await supabase
    .from('memories')
    .select('id, author_name, content, is_approved, is_featured, whatsapp_timestamp')
    .eq('source', 'whatsapp')
    .not('content', 'is', null)
    .order('whatsapp_timestamp', { ascending: true })

  if (fetchError) {
    console.error('Error fetching memories:', fetchError.message)
    process.exit(1)
  }

  if (!memories || memories.length === 0) {
    console.log('No WhatsApp text memories found.')
    return
  }

  console.log(`Found ${memories.length} WhatsApp text memories.\n`)

  // Classify each memory
  const toReject: Array<{ id: string; authorName: string; content: string; reason: string }> = []
  const toKeep: Array<{ id: string; authorName: string; contentPreview: string }> = []

  for (const mem of memories) {
    const content = (mem.content || '').trim()
    if (!content) continue

    const reason = REJECT_IDS[mem.id]
    if (reason) {
      toReject.push({
        id: mem.id,
        authorName: mem.author_name,
        content,
        reason,
      })
    } else {
      toKeep.push({
        id: mem.id,
        authorName: mem.author_name,
        contentPreview: content.slice(0, 100),
      })
    }
  }

  // Print what we're keeping
  console.log('='.repeat(80))
  console.log(`KEEPING: ${toKeep.length} memories (genuine tributes)`)
  console.log('='.repeat(80))
  for (const item of toKeep) {
    console.log(`  [${item.authorName}] "${item.contentPreview}..."`)
  }

  // Print what we're removing
  console.log('\n' + '='.repeat(80))
  console.log(`REMOVING: ${toReject.length} memories (noise/off-topic)`)
  console.log('='.repeat(80))
  if (toReject.length === 0) {
    console.log('  (none)')
  }
  for (const item of toReject) {
    console.log(`\n  [${item.authorName}] (ID: ${item.id})`)
    console.log(`  Reason: ${item.reason}`)
    console.log(`  Content: "${item.content.slice(0, 300)}${item.content.length > 300 ? '...' : ''}"`)
  }

  if (toReject.length === 0) {
    console.log('\nNo memories to remove.')
    return
  }

  // Attempt to update in Supabase
  console.log(`\n\nUpdating ${toReject.length} memories to is_approved = false...\n`)

  let updateSuccess = 0
  let updateFailed = 0
  const failedIds: string[] = []

  for (const item of toReject) {
    const { error: updateError, count } = await supabase
      .from('memories')
      .update({ is_approved: false, updated_at: new Date().toISOString() })
      .eq('id', item.id)

    if (updateError) {
      updateFailed++
      failedIds.push(item.id)
      if (updateFailed === 1) {
        console.warn(`  Update failed (RLS may be blocking): ${updateError.message}`)
      }
    } else {
      updateSuccess++
      console.log(`  Updated: ${item.authorName} (${item.id})`)
    }
  }

  console.log(`\nUpdate results: ${updateSuccess} succeeded, ${updateFailed} failed`)

  // If updates failed due to RLS, output SQL for the Supabase SQL Editor
  if (updateFailed > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('FALLBACK: Run this SQL in the Supabase SQL Editor')
    console.log('(Updates failed -- likely RLS requires authenticated role)')
    console.log('='.repeat(80))
    console.log()
    console.log('-- Set is_approved = false on non-tribute messages')
    console.log(`UPDATE memories SET is_approved = false, updated_at = now()`)
    console.log(`WHERE id IN (`)
    for (let i = 0; i < failedIds.length; i++) {
      const comma = i < failedIds.length - 1 ? ',' : ''
      console.log(`  '${failedIds[i]}'${comma}`)
    }
    console.log(`);`)
  }

  // Final summary
  console.log('\n' + '='.repeat(80))
  console.log('FINAL SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total memories reviewed: ${memories.length}`)
  console.log(`Kept as tributes: ${toKeep.length}`)
  console.log(`Marked as non-tribute: ${toReject.length}`)
  if (updateSuccess > 0) {
    console.log(`Successfully updated in DB: ${updateSuccess}`)
  }
  if (updateFailed > 0) {
    console.log(`Failed to update (use SQL fallback above): ${updateFailed}`)
  }
}

main().catch(console.error)
