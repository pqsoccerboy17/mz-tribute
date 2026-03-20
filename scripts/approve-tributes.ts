/**
 * Approve WhatsApp Tribute Messages for MZ Tribute Site
 *
 * This script:
 * 1. Re-parses the WhatsApp export to extract text tributes
 * 2. Inserts them into Supabase as new records (is_approved = false)
 * 3. Reviews each message against a reject list of noise/logistics
 * 4. Approves genuine tributes via the set_memory_approval RPC function
 *
 * REJECT criteria: pure logistics, player identification threads,
 * food/ride coordination, banter with zero MZ connection.
 *
 * GENEROUS rule: if there's any connection to MZ, the brotherhood,
 * the culture, grief, or celebration -- it gets approved.
 *
 * Usage: npx tsx scripts/approve-tributes.ts
 *        npx tsx scripts/approve-tributes.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')

// ---------------------------------------------------------------------------
// Messages to REJECT -- keyed by (sender, timestamp string, first 40 chars)
// These are logistics, banter, or player-ID threads with no MZ connection.
// ---------------------------------------------------------------------------

interface RejectRule {
  sender: string
  /** Substring match on the first ~80 chars of content */
  contentMatch: string
  reason: string
}

const REJECT_RULES: RejectRule[] = [
  // Pure logistics -- finding Peter Reynaud's contact info
  {
    sender: 'Joe Hunter',
    contentMatch: 'Has anyone gotten hold of Peter Reynaud',
    reason: 'Logistics - finding contact info',
  },
  {
    sender: 'Mike',
    contentMatch: 'What city does Peter live in',
    reason: 'Logistics - finding contact info',
  },
  // Sharing phone number, not a tribute
  {
    sender: 'Dave Kaufman',
    contentMatch: 'From JB',
    reason: 'Forwarded contact info / phone number',
  },
  // TV channel logistics
  {
    sender: 'Zippy',
    contentMatch: 'I just texted him.  What channel will the game be on',
    reason: 'Logistics - TV channel coordination',
  },
  // Joke about drug packaging, not about MZ
  {
    sender: 'Mike',
    contentMatch: 'They usually prefer you package tha kind stuff',
    reason: 'Banter - unrelated joke',
  },
  // Photo request -- no tribute content
  {
    sender: 'John Kinnear',
    contentMatch: 'I need the 1996 and 1998 team photo in here',
    reason: 'Logistics - photo request',
  },
  // Facebook friend logistics
  {
    sender: 'Matt Bernard',
    contentMatch: "I'm friends with seb on Facebook",
    reason: 'Logistics - finding someone on Facebook',
  },
  // Player identification thread (5 messages)
  {
    sender: 'Kai Edwards',
    contentMatch: 'Is he in This group or did we reach the quota',
    reason: 'Logistics - group membership question',
  },
  {
    sender: 'Cossack23',
    contentMatch: 'I know I butchered his last name. He was from Zimbabwe',
    reason: 'Player identification thread',
  },
  {
    sender: 'MDeuce',
    contentMatch: "That's not Tendai in the Pic",
    reason: 'Player identification thread',
  },
  {
    sender: 'Cossack23',
    contentMatch: "He's the reason Mike Mastin has the best GA average",
    reason: 'Player identification thread',
  },
  {
    sender: 'Mike',
    contentMatch: "Trev that's not Tendai",
    reason: 'Player identification thread',
  },
  {
    sender: 'MDeuce',
    contentMatch: 'Was his name Justin? Don',
    reason: 'Player identification thread',
  },
  // Lusty Lady banter
  {
    sender: 'Ben Langwith',
    contentMatch: 'Is photo from before or after the visit to the Lusty Lady',
    reason: 'Banter - not about MZ',
  },
  // Vague reply fragment
  {
    sender: 'Mike',
    contentMatch: 'I believe so.  My only start.  Trevor may know the year',
    reason: 'Vague reply fragment - no MZ content',
  },
  // Player identification
  {
    sender: 'Mike',
    contentMatch: "I believe that's Ian Mork who coached the Belizian",
    reason: 'Player identification - not about MZ',
  },
  // Pure RSVP logistics
  {
    sender: 'Taylor Varnadore',
    contentMatch: "I'm in for Saturday if you make something happen",
    reason: 'Logistics - RSVP',
  },
  {
    sender: 'Kelcey',
    contentMatch: 'Some PDP guys are going to Russian River Thursday',
    reason: 'Logistics - meetup coordination',
  },
  {
    sender: 'Zippy',
    contentMatch: "@\u2068~Taylor Varnadore\u2069 @\u2068Seidel\u2069",
    reason: 'Logistics - tagging people for event',
  },
  {
    sender: 'Drew Whalen',
    contentMatch: 'The app says it',
    reason: 'Logistics - ESPN channel info',
  },
  // Banter with no MZ connection
  {
    sender: 'Matt Bernard',
    contentMatch: 'Well said Stusan, I',
    reason: 'Banter between friends - no MZ content',
  },
  {
    sender: 'Mike',
    contentMatch: 'Work?  What',
    reason: 'Personal update about surgery - no MZ content',
  },
  {
    sender: 'Matt Bernard',
    contentMatch: 'Too many concussions, he still thinks Joe Hunter',
    reason: 'Banter - joke about Joe Hunter',
  },
  {
    sender: 'Zippy',
    contentMatch: 'You clearly don',
    reason: 'Banter - one-liner joke',
  },
  // Logistics requests
  {
    sender: 'Steven Browne',
    contentMatch: 'CZ AZ BZ send us pics of your travels',
    reason: 'Logistics - photo request',
  },
  // POLL - logistics
  {
    sender: 'Ben Langwith',
    contentMatch: 'POLL:',
    reason: 'Logistics - WhatsApp poll for event',
  },
  // Food logistics
  {
    sender: 'Kai Edwards',
    contentMatch: 'Capicolq or just turkey and ham',
    reason: 'Logistics - food planning',
  },
  {
    sender: 'Daly',
    contentMatch: 'Bummed to miss it guys! Let',
    reason: 'Logistics - RSVP regrets',
  },
  {
    sender: 'Ben Langwith',
    contentMatch: 'Heavy week',
    reason: 'Logistics - food/deli order planning',
  },
  // Jersey bag, logistics
  {
    sender: 'Shawn P',
    contentMatch: 'Video and document for me please',
    reason: 'Logistics - jersey bag, video request',
  },
  // Banter
  {
    sender: 'Matt Bernard',
    contentMatch: 'I love following along on the Lafon housemates',
    reason: 'Banter - joke about Eric Lafon',
  },
  // Reply fragment about video
  {
    sender: 'Brook Johnson',
    contentMatch: 'Not this one. It',
    reason: 'Reply fragment - clarifying which video',
  },
  // Banter about hat
  {
    sender: 'Shawn P',
    contentMatch: 'yes the Giants hat Owen is wearing',
    reason: 'Banter - discussing photo details',
  },
  // Camping joke
  {
    sender: 'Fred Jungemann',
    contentMatch: 'And no Mito',
    reason: 'Banter - camping joke',
  },
  // Van rental logistics
  {
    sender: 'Zippy',
    contentMatch: 'Guys, Langy has 2 vans reserved',
    reason: 'Logistics - van rental coordination',
  },
  // Thierry Henry banter
  {
    sender: 'Matt Bernard',
    contentMatch: 'Easy on the Thierry Henry celebrations',
    reason: 'Banter - joke to CZ',
  },
  // Kit brand discussion
  {
    sender: 'MDeuce',
    contentMatch: 'The year Lanzera made an appearance',
    reason: 'Kit brand nostalgia - no MZ connection',
  },
  // Vague tradition comment
  {
    sender: 'Mike',
    contentMatch: "I'm still bummed they stopped that tradition",
    reason: 'Vague reply - unclear context, no MZ content',
  },
  // Player memory with no MZ connection
  {
    sender: 'MDeuce',
    contentMatch: "I'm trying hard to remember",
    reason: 'Player identification - no MZ content',
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
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
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
// Parse WhatsApp chat
// ---------------------------------------------------------------------------

interface ParsedMessage {
  timestamp: Date
  sender: string
  text: string
  attachment: string | null
}

const SYSTEM_PATTERNS = [
  /Messages and calls are end-to-end encrypted/,
  /joined using this group/,
  /left$/,
  /was removed$/,
  /changed the subject/,
  /changed this group/,
  /changed the group/,
  /added you/,
  /created group/,
  /deleted this message/,
  /This message was deleted/,
  /You deleted this message/,
  /\d+ messages? omitted/,
]

const MEDIA_OMITTED = [
  'image omitted',
  'video omitted',
  'GIF omitted',
  'audio omitted',
  'sticker omitted',
  'Contact card omitted',
  'document omitted',
]

const TRIBUTE_START = new Date('2026-03-15T00:00:00Z')
const MIN_MESSAGE_LENGTH = 50

function parseChat(): ParsedMessage[] {
  const chatFile = join(PROJECT_ROOT, '.whatsapp-export', '_chat.txt')
  if (!existsSync(chatFile)) {
    console.error('_chat.txt not found. Run parse-whatsapp.ts first to extract the zip.')
    process.exit(1)
  }

  const content = readFileSync(chatFile, 'utf-8')
  const lines = content.split('\n')
  const lineRegex =
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}:\d{2}\s[AP]M)\]\s~?\s?([^:]+?):\s(.*)$/

  const messages: ParsedMessage[] = []
  let current: ParsedMessage | null = null

  for (const rawLine of lines) {
    const line = rawLine.replace(/[\u200e\u200f]/g, '')
    const match = line.match(lineRegex)

    if (match) {
      if (current) messages.push(current)
      const [, dateStr, timeStr, sender, text] = match
      const timestamp = new Date(`${dateStr} ${timeStr}`)

      const attachMatch = text.match(/<attached:\s*(.+?)>/)
      const attachment = attachMatch ? attachMatch[1].trim() : null
      const cleanText = attachment
        ? text.replace(/<attached:\s*.+?>/, '').trim()
        : text

      current = {
        timestamp,
        sender: sender.trim().replace(/^~\s*/, ''),
        text: cleanText,
        attachment,
      }
    } else if (current && line.trim()) {
      if (!/^\[?\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line.trim())) {
        current.text += '\n' + line.trim()
      }
    }
  }

  if (current) messages.push(current)
  return messages
}

function getTextTributes(allMessages: ParsedMessage[]): ParsedMessage[] {
  return allMessages.filter((msg) => {
    if (msg.timestamp < TRIBUTE_START) return false
    if (SYSTEM_PATTERNS.some((p) => p.test(msg.text))) return false
    if (MEDIA_OMITTED.some((p) => msg.text.includes(p))) return false
    if (msg.attachment) return false // text-only
    if (msg.text.length < MIN_MESSAGE_LENGTH) return false
    return true
  })
}

// ---------------------------------------------------------------------------
// Check if message matches a reject rule
// ---------------------------------------------------------------------------

function findRejectReason(msg: ParsedMessage): string | null {
  for (const rule of REJECT_RULES) {
    if (msg.sender === rule.sender && msg.text.includes(rule.contentMatch)) {
      return rule.reason
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// SQL escape helper
// ---------------------------------------------------------------------------

function sqlEscape(str: string): string {
  return str.replace(/'/g, "''")
}

// ---------------------------------------------------------------------------
// Insert via Supabase API (when service role key is available)
// ---------------------------------------------------------------------------

async function insertViaApi(
  supabase: ReturnType<typeof createClient>,
  textTributes: ParsedMessage[],
  toApprove: Array<{ msg: ParsedMessage; index: number }>,
  toReject: Array<{ msg: ParsedMessage; index: number; reason: string }>
) {
  const FEATURED_THRESHOLD = 500
  const insertedIds: Map<number, string> = new Map()
  let insertCount = 0
  let insertFailed = 0

  for (let i = 0; i < textTributes.length; i++) {
    const msg = textTributes[i]
    const isFeatured = msg.text.length >= FEATURED_THRESHOLD

    const { data, error } = await supabase
      .from('memories')
      .insert({
        author_name: msg.sender,
        content: msg.text,
        media_urls: [],
        source: 'whatsapp',
        whatsapp_timestamp: msg.timestamp.toISOString(),
        is_featured: isFeatured,
        is_approved: false,
      })
      .select('id')
      .single()

    if (error) {
      console.warn(`  Insert failed #${i + 1} [${msg.sender}]: ${error.message}`)
      insertFailed++
    } else {
      insertedIds.set(i, data.id)
      insertCount++
    }
  }

  console.log(`  Inserted: ${insertCount} (${insertFailed} failed)`)

  // Approve genuine tributes via RPC
  console.log(`\nApproving ${toApprove.length} genuine tributes...`)
  let approveCount = 0

  for (const item of toApprove) {
    const id = insertedIds.get(item.index - 1)
    if (!id) continue

    const { error } = await supabase.rpc('set_memory_approval', {
      memory_id: id,
      approved: true,
    })

    if (!error) approveCount++
  }

  console.log(`  Approved: ${approveCount}`)
}

// ---------------------------------------------------------------------------
// Generate SQL for Supabase SQL Editor (when anon key is blocked by RLS)
// ---------------------------------------------------------------------------

function generateSql(
  textTributes: ParsedMessage[],
  toApprove: Array<{ msg: ParsedMessage; index: number }>,
  _toReject: Array<{ msg: ParsedMessage; index: number; reason: string }>
) {
  const FEATURED_THRESHOLD = 500
  const approveIndices = new Set(toApprove.map((a) => a.index))
  const lines: string[] = []

  function out(s: string) {
    lines.push(s)
    console.log(s)
  }

  out('-- ==========================================================================')
  out('-- MZ Tribute: Insert WhatsApp text tributes and approve genuine ones')
  out('-- Generated by scripts/approve-tributes.ts')
  out(`-- ${toApprove.length} approved, ${_toReject.length} rejected (stay is_approved = false)`)
  out('-- ==========================================================================')
  out('')
  out('BEGIN;')
  out('')

  for (let i = 0; i < textTributes.length; i++) {
    const msg = textTributes[i]
    const idx = i + 1
    const isApproved = approveIndices.has(idx)
    const isFeatured = msg.text.length >= FEATURED_THRESHOLD

    out(`-- #${idx} [${msg.sender}] ${isApproved ? 'APPROVED' : 'REJECTED'}`)
    out(`INSERT INTO memories (author_name, content, media_urls, source, whatsapp_timestamp, is_featured, is_approved)`)
    out(`VALUES (`)
    out(`  '${sqlEscape(msg.sender)}',`)
    out(`  '${sqlEscape(msg.text)}',`)
    out(`  '{}',`)
    out(`  'whatsapp',`)
    out(`  '${msg.timestamp.toISOString()}',`)
    out(`  ${isFeatured},`)
    out(`  ${isApproved}`)
    out(`);`)
    out('')
  }

  out('COMMIT;')

  // Write SQL file
  const sqlPath = join(PROJECT_ROOT, 'scripts', 'approve-tributes.sql')
  writeFileSync(sqlPath, lines.join('\n'), 'utf-8')
  console.log(`\nSQL written to: ${sqlPath}`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadEnv()
  const supabase = getSupabaseClient()

  if (DRY_RUN) console.log('*** DRY RUN -- no database writes ***\n')

  // Step 1: Parse the WhatsApp export
  console.log('Parsing WhatsApp export...')
  const allMessages = parseChat()
  const textTributes = getTextTributes(allMessages)
  console.log(`Found ${textTributes.length} text tributes (>= 50 chars, post-March 15)\n`)

  // Step 2: Classify each message
  const toApprove: Array<{ msg: ParsedMessage; index: number }> = []
  const toReject: Array<{ msg: ParsedMessage; index: number; reason: string }> = []

  for (let i = 0; i < textTributes.length; i++) {
    const msg = textTributes[i]
    const reason = findRejectReason(msg)
    if (reason) {
      toReject.push({ msg, index: i + 1, reason })
    } else {
      toApprove.push({ msg, index: i + 1 })
    }
  }

  // Step 3: Print rejection list
  console.log('='.repeat(80))
  console.log(`REJECTED: ${toReject.length} messages (noise/logistics -- will NOT appear on site)`)
  console.log('='.repeat(80))
  for (const item of toReject) {
    const preview = item.msg.text.slice(0, 120).replace(/\n/g, ' | ')
    console.log(`  #${item.index} [${item.msg.sender}] -- ${item.reason}`)
    console.log(`       "${preview}..."`)
    console.log()
  }

  // Step 4: Print approval list
  console.log('='.repeat(80))
  console.log(`APPROVED: ${toApprove.length} messages (genuine tributes to MZ)`)
  console.log('='.repeat(80))
  for (const item of toApprove) {
    const preview = item.msg.text.slice(0, 100).replace(/\n/g, ' | ')
    console.log(`  #${item.index} [${item.msg.sender}] "${preview}..."`)
  }

  if (DRY_RUN) {
    console.log('\n*** DRY RUN COMPLETE -- no changes made ***')
    console.log(`Would insert ${textTributes.length} records, approve ${toApprove.length}, reject ${toReject.length}`)
    return
  }

  // Step 5: Try Supabase API first, fall back to SQL generation
  //
  // Check for service role key -- anon key is blocked by RLS for inserts.
  // If SUPABASE_SERVICE_ROLE_KEY is set, use the API. Otherwise generate SQL.
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  if (hasServiceKey) {
    console.log('\nService role key detected. Inserting via Supabase API...')
    await insertViaApi(supabase, textTributes, toApprove, toReject)
  } else {
    console.log('\nNo service role key -- anon key cannot insert (RLS).')
    console.log('Generating SQL for Supabase SQL Editor...\n')
    generateSql(textTributes, toApprove, toReject)
  }

  // Final summary
  console.log('\n' + '='.repeat(80))
  console.log('FINAL SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total text tributes parsed: ${textTributes.length}`)
  console.log(`Approved (genuine tributes): ${toApprove.length}`)
  console.log(`Rejected (noise/logistics): ${toReject.length}`)
  if (!hasServiceKey) {
    console.log('\nCopy the SQL above into the Supabase SQL Editor and run it.')
    console.log(`It will insert all ${textTributes.length} tributes and approve the ${toApprove.length} genuine ones.`)
  }
}

main().catch(console.error)
