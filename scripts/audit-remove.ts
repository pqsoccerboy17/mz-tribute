/**
 * MZ Tribute Content Audit - Remove Non-Tribute Messages
 *
 * Strict audit of all approved WhatsApp memories. Removes messages that are
 * primarily logistics, banter, test data, or vague fragments with no direct
 * MZ tribute content.
 *
 * 7 messages identified for removal out of 71 approved:
 *   1. Zippy - Alumni bash schedule (pure logistics/itinerary)
 *   2. Ben Langwith - Van rentals, Costco run, breakfast planning
 *   3. Shawn P - "Video and document... jersey bag" (logistics)
 *   4. Kai Edwards - "Playing for Juve..." (vague fragment, no MZ reference)
 *   5. _test_ record #1
 *   6. _test_ record #2
 *   7. Chris Ziemer - "AZ in Birkenstocks..." (travel banter, no MZ mention)
 *
 * Usage: npx tsx scripts/audit-remove.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

// ---------------------------------------------------------------------------
// Memories to REMOVE - each reviewed individually against strict criteria
// ---------------------------------------------------------------------------

interface RemovalRecord {
  id: string
  expectedAuthor: string
  reason: string
  contentPreview: string
}

const REMOVALS: RemovalRecord[] = [
  {
    id: '8c93a0ca-35e9-43ea-b562-fea0d3b99e18',
    expectedAuthor: 'Zippy',
    reason: 'Event logistics/schedule - full alumni bash itinerary with times, locations, rides, pool/beach options. No tribute content.',
    contentPreview: 'Alright boys, schedule for the spring alumni bash is as follows: Date 3-21-26...',
  },
  {
    id: '1fb6b1b3-5495-4739-aa52-f9781adfdf9b',
    expectedAuthor: 'Ben Langwith',
    reason: 'Event logistics - van rentals, Costco run, breakfast planning, driver coordination. 90% logistics with a passing MZ mention.',
    contentPreview: "Guys, Let's rally the troops for Saturday. Mark your attendance in the poll. Just locked in two 15-passenger vans...",
  },
  {
    id: '1e7df400-c21a-4642-8a8e-3baff052d0f6',
    expectedAuthor: 'Shawn P',
    reason: 'Pure logistics - asking for video recording and reminding about a jersey bag. No tribute content.',
    contentPreview: 'Video and document for me please. Langey don\'t forget the jersey bag this time.',
  },
  {
    id: '8d35b3df-bb9d-431b-9b0a-0ddbe93d2a59',
    expectedAuthor: 'Kai Edwards',
    reason: 'Vague fragment - short comment about playing for a team with no direct MZ reference. His deep tribute story is kept.',
    contentPreview: 'Playing for Juve and living in Spak(spelling ?) Blessed to do both as so many others have',
  },
  {
    id: '3981a315-a4c2-46ad-88ed-9012a3921fb7',
    expectedAuthor: '_test_',
    reason: 'Test data - not a tribute.',
    contentPreview: '_test_',
  },
  {
    id: '4e442a60-26ff-4ef1-94b1-7aa3ce085d6b',
    expectedAuthor: '_test_',
    reason: 'Test data - not a tribute.',
    contentPreview: '_test_',
  },
  {
    id: '6b7ae097-0140-4277-90cf-c3e853a032e2',
    expectedAuthor: 'Chris Ziemer',
    reason: 'Travel update/banter - AZ at a concert and CZ achilles update. No mention of MZ or his legacy unlike CZ other Germany messages.',
    contentPreview: 'AZ in Birkenstocks in the pit at Kind Kaputt show in cologne. My Achilles is a bit tight...',
  },
]

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

  console.log('='.repeat(80))
  console.log('MZ TRIBUTE CONTENT AUDIT - STRICT REMOVAL PASS')
  console.log('='.repeat(80))
  console.log()

  // Step 1: Verify each memory exists and matches expectations
  console.log('Step 1: Verifying memories to remove...\n')

  const verified: RemovalRecord[] = []
  const notFound: RemovalRecord[] = []

  for (const record of REMOVALS) {
    const { data, error } = await supabase
      .from('memories')
      .select('id, author_name, content, is_approved')
      .eq('id', record.id)
      .single()

    if (error || !data) {
      console.log(`  [NOT FOUND] ${record.expectedAuthor} (${record.id})`)
      notFound.push(record)
      continue
    }

    if (!data.is_approved) {
      console.log(`  [ALREADY REMOVED] ${data.author_name} (${record.id})`)
      continue
    }

    if (data.author_name !== record.expectedAuthor) {
      console.log(`  [AUTHOR MISMATCH] Expected "${record.expectedAuthor}", got "${data.author_name}" (${record.id})`)
      console.log(`    Skipping for safety.`)
      continue
    }

    console.log(`  [VERIFIED] ${data.author_name} - "${(data.content || '').slice(0, 80)}..."`)
    verified.push(record)
  }

  console.log(`\nVerified: ${verified.length} of ${REMOVALS.length} memories\n`)

  if (verified.length === 0) {
    console.log('Nothing to remove. All memories either not found or already removed.')
    return
  }

  // Step 2: Print what we are removing
  console.log('='.repeat(80))
  console.log(`REMOVING: ${verified.length} messages`)
  console.log('='.repeat(80))

  for (let i = 0; i < verified.length; i++) {
    const r = verified[i]
    console.log(`\n  ${i + 1}. [${r.expectedAuthor}]`)
    console.log(`     ID: ${r.id}`)
    console.log(`     Reason: ${r.reason}`)
    console.log(`     Preview: "${r.contentPreview}"`)
  }

  // Step 3: Remove via set_memory_approval RPC
  console.log('\n' + '='.repeat(80))
  console.log('Step 3: Setting is_approved = false via set_memory_approval RPC...')
  console.log('='.repeat(80) + '\n')

  let rpcSuccess = 0
  let rpcFailed = 0
  const failedIds: string[] = []

  for (const record of verified) {
    const { error } = await supabase.rpc('set_memory_approval', {
      memory_id: record.id,
      approved: false,
    })

    if (error) {
      rpcFailed++
      failedIds.push(record.id)
      if (rpcFailed === 1) {
        console.log(`  RPC failed (likely RLS): ${error.message}`)
        console.log('  Will generate SQL fallback after attempting all...\n')
      }
      console.log(`  [FAILED] ${record.expectedAuthor} (${record.id})`)
    } else {
      rpcSuccess++
      console.log(`  [REMOVED] ${record.expectedAuthor} (${record.id})`)
    }
  }

  // Step 4: If any failed, try direct update as fallback
  if (rpcFailed > 0 && rpcSuccess === 0) {
    console.log('\n  RPC blocked by RLS. Trying direct update fallback...\n')

    let directSuccess = 0
    let directFailed = 0
    const stillFailed: string[] = []

    for (const id of failedIds) {
      const record = verified.find((r) => r.id === id)!
      const { error } = await supabase
        .from('memories')
        .update({ is_approved: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        directFailed++
        stillFailed.push(id)
        console.log(`  [FAILED] ${record.expectedAuthor} (${id})`)
      } else {
        directSuccess++
        console.log(`  [REMOVED] ${record.expectedAuthor} (${id})`)
      }
    }

    rpcSuccess += directSuccess
    rpcFailed = directFailed

    if (directFailed > 0) {
      failedIds.length = 0
      failedIds.push(...stillFailed)
    } else {
      failedIds.length = 0
    }
  }

  // Step 5: SQL fallback if both methods failed
  if (failedIds.length > 0) {
    console.log('\n' + '='.repeat(80))
    console.log('FALLBACK: Run this SQL in the Supabase SQL Editor')
    console.log('(Both RPC and direct update failed - likely RLS requires authenticated role)')
    console.log('='.repeat(80))
    console.log()
    console.log('-- MZ Tribute Audit: Set is_approved = false on non-tribute messages')
    console.log('-- Generated by scripts/audit-remove.ts')
    console.log()

    for (const id of failedIds) {
      const record = verified.find((r) => r.id === id)!
      console.log(`-- ${record.expectedAuthor}: ${record.reason}`)
    }

    console.log()
    console.log(`UPDATE memories`)
    console.log(`SET is_approved = false, updated_at = now()`)
    console.log(`WHERE id IN (`)
    for (let i = 0; i < failedIds.length; i++) {
      const comma = i < failedIds.length - 1 ? ',' : ''
      console.log(`  '${failedIds[i]}'${comma}`)
    }
    console.log(`);`)
  }

  // Step 6: Verify final state
  console.log('\n' + '='.repeat(80))
  console.log('Step 6: Verifying final state...')
  console.log('='.repeat(80) + '\n')

  const { data: remaining, error: countError } = await supabase
    .from('memories')
    .select('id', { count: 'exact' })
    .eq('source', 'whatsapp')
    .not('content', 'is', null)
    .eq('is_approved', true)

  if (!countError && remaining) {
    console.log(`  Approved WhatsApp memories remaining: ${remaining.length}`)
  }

  // Final summary
  console.log('\n' + '='.repeat(80))
  console.log('FINAL SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total memories audited:    71`)
  console.log(`Removed (non-tribute):     ${verified.length}`)
  console.log(`  - RPC/update succeeded:  ${rpcSuccess}`)
  console.log(`  - Failed (use SQL):      ${failedIds.length}`)
  console.log(`Kept (genuine tributes):   ${71 - verified.length}`)
  if (remaining && !countError) {
    console.log(`Approved in DB now:        ${remaining.length}`)
  }
  console.log()

  if (failedIds.length > 0) {
    console.log('ACTION REQUIRED: Copy the SQL above into the Supabase SQL Editor and run it.')
  } else if (rpcSuccess > 0) {
    console.log('All removals completed successfully.')
  }
}

main().catch(console.error)
