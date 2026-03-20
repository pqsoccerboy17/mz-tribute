import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const DIR = join(PROJECT_ROOT, '.whatsapp-export')
const BUCKET = 'tribute-media'

// Load env
const envContent = readFileSync(join(PROJECT_ROOT, '.env.local'), 'utf-8')
const env: Record<string, string> = {}
for (const line of envContent.split('\n')) {
  const eq = line.indexOf('=')
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function main() {
  const files = readdirSync(DIR)
    .filter((f) => /2026-03-1[5-9]|2026-03-2/.test(f))
    .filter((f) => /\.(jpg|mp4|png)$/i.test(f))

  console.log(`Uploading ${files.length} post-March-15 media files...`)

  let uploaded = 0
  let errors = 0

  for (const file of files) {
    const ext = extname(file).toLowerCase()
    const isVideo = ext === '.mp4'
    const contentType = isVideo ? 'video/mp4' : 'image/jpeg'
    const path = `whatsapp/${randomUUID()}${ext}`

    const buf = readFileSync(join(DIR, file))

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buf, { contentType, cacheControl: '31536000' })

    if (upErr) {
      errors++
      if (errors <= 5) console.log(`  Upload err: ${upErr.message}`)
      continue
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path)

    // Extract date from filename
    const dateMatch = file.match(
      /(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/
    )
    const ts = dateMatch
      ? new Date(
          +dateMatch[1],
          +dateMatch[2] - 1,
          +dateMatch[3],
          +dateMatch[4],
          +dateMatch[5],
          +dateMatch[6]
        ).toISOString()
      : new Date('2026-03-16').toISOString()

    const { error: dbErr } = await supabase.from('memories').insert({
      author_name: 'SSU Soccer Alumni',
      content: null,
      media_urls: [publicUrl],
      source: 'whatsapp',
      whatsapp_timestamp: ts,
      is_featured: false,
      is_approved: true,
    })

    if (dbErr) {
      errors++
      if (errors <= 5) console.log(`  DB err: ${dbErr.message}`)
    } else {
      uploaded++
    }

    if (uploaded % 25 === 0 && uploaded > 0)
      console.log(`  Progress: ${uploaded}/${files.length}`)
  }

  console.log(`\nDone. Uploaded: ${uploaded}, Errors: ${errors}`)
}

main().catch(console.error)
