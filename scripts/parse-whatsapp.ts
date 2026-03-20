/**
 * WhatsApp Chat Export Parser + Supabase Importer
 *
 * Extracts tribute messages, photos, and videos from the SSU Men's Soccer
 * Alumni WhatsApp chat export and imports them into Supabase.
 *
 * Usage: npm run parse-whatsapp
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
 *           (or SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for full access)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { execSync } from 'child_process'
import { join, dirname, extname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { readdir } from 'fs/promises'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')

// Find the newest WhatsApp zip by modification time
function findZip(): string {
  const files = readdirSync(PROJECT_ROOT)
  const zips = files
    .filter((f) => f.startsWith('WhatsApp') && f.endsWith('.zip'))
    .map((f) => {
      const full = resolve(PROJECT_ROOT, f)
      if (!full.startsWith(PROJECT_ROOT)) throw new Error(`Path traversal blocked: ${f}`)
      return { name: f, mtime: statSync(full).mtimeMs }
    })
    .sort((a, b) => b.mtime - a.mtime)

  if (zips.length === 0) {
    console.error('No WhatsApp .zip export found in project root')
    process.exit(1)
  }

  console.log(`Found ${zips.length} zip(s), using newest: ${zips[0].name}`)
  return join(PROJECT_ROOT, zips[0].name)
}

const ZIP_PATH = findZip()
const EXTRACT_DIR = join(PROJECT_ROOT, '.whatsapp-export')
const STORAGE_BUCKET = 'tribute-media'

// Tribute window: messages from March 15 onward are tributes
const TRIBUTE_START = new Date('2026-03-15T00:00:00Z')

// Minimum message length to import (skip short reactions)
const MIN_MESSAGE_LENGTH = 50

// Messages longer than this are auto-featured
const FEATURED_THRESHOLD = 500

// System message patterns to skip
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

// Media placeholder patterns
const MEDIA_OMITTED = [
  'image omitted',
  'video omitted',
  'GIF omitted',
  'audio omitted',
  'sticker omitted',
  'Contact card omitted',
  'document omitted',
]

// ---------------------------------------------------------------------------
// Supabase client (use service role key if available, else anon)
// ---------------------------------------------------------------------------

function getSupabaseClient() {
  // Try service role first (for admin operations)
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    ''

  if (!url || !key) {
    console.error(
      'Missing Supabase credentials. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY'
    )
    console.error('or VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY in .env.local')
    process.exit(1)
  }

  return createClient(url, key)
}

// ---------------------------------------------------------------------------
// Load env from .env.local
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
// Extract zip
// ---------------------------------------------------------------------------

function extractZip() {
  if (!existsSync(ZIP_PATH)) {
    console.error(`WhatsApp export not found at: ${ZIP_PATH}`)
    process.exit(1)
  }

  if (!existsSync(EXTRACT_DIR)) {
    mkdirSync(EXTRACT_DIR, { recursive: true })
  }

  console.log('Extracting WhatsApp export...')
  execSync(`unzip -o -q "${ZIP_PATH}" -d "${EXTRACT_DIR}"`)
  console.log('Extracted.')
}

// ---------------------------------------------------------------------------
// Parse chat
// ---------------------------------------------------------------------------

interface ParsedMessage {
  timestamp: Date
  sender: string
  text: string
  attachment: string | null
}

function parseChat(): ParsedMessage[] {
  // Find the chat text file
  const chatFile = join(EXTRACT_DIR, '_chat.txt')
  if (!existsSync(chatFile)) {
    console.error('_chat.txt not found in export')
    process.exit(1)
  }

  const content = readFileSync(chatFile, 'utf-8')
  const lines = content.split('\n')
  const messages: ParsedMessage[] = []

  // WhatsApp format: [M/D/YY, H:MM:SS AM/PM] ~? Sender: Message
  const lineRegex =
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}:\d{2}\s[AP]M)\]\s~?\s?([^:]+?):\s(.*)$/

  let current: ParsedMessage | null = null

  for (const rawLine of lines) {
    // Strip Unicode directional marks (U+200E LTR, U+200F RTL) that WhatsApp
    // prepends to timestamps. These break the regex, causing messages from
    // different senders to merge into one card.
    const line = rawLine.replace(/[\u200e\u200f]/g, '')
    const match = line.match(lineRegex)

    if (match) {
      // Save previous message
      if (current) messages.push(current)

      const [, dateStr, timeStr, sender, text] = match
      const timestamp = new Date(`${dateStr} ${timeStr}`)

      // Check for attachment (also strip Unicode marks from attachment tags)
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
      // Continuation line -- only if it doesn't look like a new message
      // (safety check in case regex misses an edge case)
      if (!/^\[?\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line.trim())) {
        current.text += '\n' + line.trim()
      }
    }
  }

  // Push last message
  if (current) messages.push(current)

  return messages
}

// ---------------------------------------------------------------------------
// Filter tribute messages
// ---------------------------------------------------------------------------

function filterTributes(messages: ParsedMessage[]): ParsedMessage[] {
  return messages.filter((msg) => {
    // Must be after the tribute start date
    if (msg.timestamp < TRIBUTE_START) return false

    // Skip system messages
    if (SYSTEM_PATTERNS.some((p) => p.test(msg.text))) return false

    // Skip media omitted placeholders
    if (MEDIA_OMITTED.some((p) => msg.text.includes(p))) return false

    // Skip very short messages (reactions, single emojis, etc.)
    // But keep messages with attachments even if text is short
    if (!msg.attachment && msg.text.length < MIN_MESSAGE_LENGTH) return false

    return true
  })
}

// ---------------------------------------------------------------------------
// Deduplicate sender names
// ---------------------------------------------------------------------------

function normalizeSender(name: string): string {
  // Remove phone number prefixes like +1 234 567 8901
  if (/^\+?\d[\d\s-]{8,}$/.test(name)) return name

  // Common misspellings and variations
  return name
    .replace(/^~\s*/, '')
    .trim()
}

// ---------------------------------------------------------------------------
// Upload media files
// ---------------------------------------------------------------------------

async function uploadMedia(
  supabase: ReturnType<typeof createClient>,
  filename: string
): Promise<string | null> {
  const filePath = resolve(EXTRACT_DIR, filename)
  if (!filePath.startsWith(EXTRACT_DIR)) {
    console.warn(`  Path traversal blocked: ${filename}`)
    return null
  }
  if (!existsSync(filePath)) {
    console.warn(`  Media file not found: ${filename}`)
    return null
  }

  const ext = extname(filename).toLowerCase()
  const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
  const isVideo = ['.mp4', '.mov', '.3gp', '.avi'].includes(ext)

  if (!isImage && !isVideo) {
    console.warn(`  Skipping unsupported file type: ${filename}`)
    return null
  }

  const fileBuffer = readFileSync(filePath)
  const storagePath = `whatsapp/${crypto.randomUUID()}${ext}`
  const contentType = isImage ? `image/${ext.slice(1)}` : `video/${ext.slice(1)}`

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType,
      cacheControl: '31536000',
      upsert: false,
    })

  if (error) {
    console.warn(`  Upload failed for ${filename}: ${error.message}`)
    return null
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath)

  return publicUrl
}

// ---------------------------------------------------------------------------
// Upload standalone media (photos/videos without associated tribute text)
// ---------------------------------------------------------------------------

async function uploadStandaloneMedia(
  supabase: ReturnType<typeof createClient>,
  messages: ParsedMessage[]
) {
  // Find messages that are just media (attachment + short/no text) from the tribute window
  const mediaMessages = messages.filter(
    (msg) =>
      msg.timestamp >= TRIBUTE_START &&
      msg.attachment &&
      msg.text.length < MIN_MESSAGE_LENGTH &&
      !MEDIA_OMITTED.some((p) => msg.text.includes(p))
  )

  console.log(
    `\nUploading ${mediaMessages.length} standalone media files...`
  )

  let uploaded = 0
  for (const msg of mediaMessages) {
    if (!msg.attachment) continue

    const url = await uploadMedia(supabase, msg.attachment)
    if (!url) continue

    // Create a memory with just the media
    const { error } = await supabase.from('memories').insert({
      author_name: normalizeSender(msg.sender),
      content: msg.text || null,
      media_urls: [url],
      source: 'whatsapp',
      whatsapp_timestamp: msg.timestamp.toISOString(),
      is_featured: false,
      is_approved: true,
    })

    if (error) {
      console.warn(`  Failed to insert media memory: ${error.message}`)
    } else {
      uploaded++
    }
  }

  console.log(`  Uploaded ${uploaded} standalone media memories.`)
}

// ---------------------------------------------------------------------------
// Upload standalone media -- incremental (skip already-imported)
// ---------------------------------------------------------------------------

async function uploadStandaloneMediaIncremental(
  supabase: ReturnType<typeof createClient>,
  messages: ParsedMessage[],
  existingKeys: Set<string>
) {
  const mediaMessages = messages.filter(
    (msg) =>
      msg.timestamp >= TRIBUTE_START &&
      msg.attachment &&
      msg.text.length < MIN_MESSAGE_LENGTH &&
      !MEDIA_OMITTED.some((p) => msg.text.includes(p))
  )

  // Filter out already-imported media
  const newMedia = mediaMessages.filter(
    (msg) => !isAlreadyImported(existingKeys, msg.sender, msg.timestamp)
  )

  console.log(
    `\nStandalone media: ${mediaMessages.length} total, ${newMedia.length} new`
  )

  let uploaded = 0
  for (const msg of newMedia) {
    if (!msg.attachment) continue

    if (DRY_RUN) {
      console.log(`  [NEW MEDIA] ${normalizeSender(msg.sender)}: ${msg.attachment}`)
      uploaded++
      continue
    }

    const url = await uploadMedia(supabase, msg.attachment)
    if (!url) continue

    const { error } = await supabase.from('memories').insert({
      author_name: normalizeSender(msg.sender),
      content: msg.text || null,
      media_urls: [url],
      source: 'whatsapp',
      whatsapp_timestamp: msg.timestamp.toISOString(),
      is_featured: false,
      is_approved: true,
    })

    if (error) {
      console.warn(`  Failed to insert media memory: ${error.message}`)
    } else {
      uploaded++
    }
  }

  console.log(`  Uploaded ${uploaded} new standalone media memories.`)
}

// ---------------------------------------------------------------------------
// Incremental import: fetch existing records to skip duplicates
// ---------------------------------------------------------------------------

function makeDedupeKey(author: string, timestamp: string): string {
  return `${author}|${timestamp}`
}

async function fetchExistingKeys(
  supabase: ReturnType<typeof createClient>
): Promise<Set<string>> {
  const keys = new Set<string>()
  let offset = 0
  const PAGE_SIZE = 1000

  while (true) {
    const { data, error } = await supabase
      .from('memories')
      .select('author_name, whatsapp_timestamp')
      .eq('source', 'whatsapp')
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error('Failed to fetch existing memories:', error.message)
      process.exit(1)
    }

    if (!data || data.length === 0) break

    for (const row of data) {
      if (row.whatsapp_timestamp) {
        keys.add(makeDedupeKey(row.author_name, new Date(row.whatsapp_timestamp).toISOString()))
      }
    }

    offset += PAGE_SIZE
    if (data.length < PAGE_SIZE) break
  }

  return keys
}

function isAlreadyImported(
  existingKeys: Set<string>,
  sender: string,
  timestamp: Date
): boolean {
  return existingKeys.has(makeDedupeKey(normalizeSender(sender), timestamp.toISOString()))
}

// ---------------------------------------------------------------------------
// Main import
// ---------------------------------------------------------------------------

const DRY_RUN = process.argv.includes('--dry-run')
const INCREMENTAL = process.argv.includes('--incremental')

async function main() {
  loadEnv()

  if (DRY_RUN) console.log('*** DRY RUN -- no database writes ***\n')
  if (INCREMENTAL) console.log('*** INCREMENTAL MODE -- skipping existing records ***\n')

  const supabase = getSupabaseClient()

  // Step 1: Extract
  extractZip()

  // Step 2: Parse
  console.log('\nParsing chat...')
  const allMessages = parseChat()
  console.log(`  Total messages: ${allMessages.length}`)

  // Count unique senders
  const senders = new Set(allMessages.map((m) => m.sender))
  console.log(`  Unique senders: ${senders.size}`)

  // Step 3: Filter tributes
  const tributes = filterTributes(allMessages)
  console.log(`  Tribute messages (post-March 15, >50 chars): ${tributes.length}`)

  // Step 4: List available media files
  const files = await readdir(EXTRACT_DIR)
  const mediaFiles = files.filter((f) => {
    const ext = extname(f).toLowerCase()
    return ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.3gp'].includes(ext)
  })
  console.log(`  Media files in export: ${mediaFiles.length}`)

  // Step 4b: If incremental, fetch existing records for dedup
  let existingKeys = new Set<string>()
  if (INCREMENTAL) {
    console.log('\nFetching existing records for dedup...')
    existingKeys = await fetchExistingKeys(supabase)
    console.log(`  Found ${existingKeys.size} existing records in database`)
  }

  // Step 5: Import tribute messages
  console.log('\nImporting tribute messages...')
  let imported = 0
  let featured = 0
  let skipped = 0

  for (const tribute of tributes) {
    // Skip if already in DB (incremental mode)
    if (INCREMENTAL && isAlreadyImported(existingKeys, tribute.sender, tribute.timestamp)) {
      skipped++
      continue
    }

    // Upload attachment if present
    let mediaUrls: string[] = []
    if (tribute.attachment) {
      if (!DRY_RUN) {
        const url = await uploadMedia(supabase, tribute.attachment)
        if (url) mediaUrls = [url]
      }
    }

    const isFeatured = tribute.text.length >= FEATURED_THRESHOLD

    if (DRY_RUN) {
      console.log(`  [NEW] ${normalizeSender(tribute.sender)}: "${tribute.text.slice(0, 80)}..."`)
      imported++
      if (isFeatured) featured++
      continue
    }

    const { error } = await supabase.from('memories').insert({
      author_name: normalizeSender(tribute.sender),
      content: tribute.text,
      media_urls: mediaUrls,
      source: 'whatsapp',
      whatsapp_timestamp: tribute.timestamp.toISOString(),
      is_featured: isFeatured,
      is_approved: false,
    })

    if (error) {
      console.warn(`  Failed to insert: ${error.message}`)
    } else {
      imported++
      if (isFeatured) featured++
    }
  }

  console.log(`  Imported: ${imported} tributes (${featured} featured)`)
  if (INCREMENTAL) console.log(`  Skipped (already in DB): ${skipped}`)

  // Step 6: Upload standalone media (with incremental dedup)
  if (INCREMENTAL) {
    await uploadStandaloneMediaIncremental(supabase, allMessages, existingKeys)
  } else {
    await uploadStandaloneMedia(supabase, allMessages)
  }

  // Summary
  console.log('\n--- Import Complete ---')
  console.log(`  Messages parsed: ${allMessages.length}`)
  console.log(`  Tributes imported: ${imported}`)
  if (INCREMENTAL) console.log(`  Tributes skipped (existing): ${skipped}`)
  console.log(`  Featured: ${featured}`)
  console.log(`  Media files available: ${mediaFiles.length}`)
  console.log('\nDone. Check your Supabase dashboard to verify.')
}

main().catch(console.error)
