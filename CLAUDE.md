# MZ Tribute - Project Instructions

## What This Is
Memorial tribute website for Marcus Ziemer, SSU Men's Soccer head coach (1983-2025). Preserves memories, photos, and videos from the 130+ member alumni WhatsApp community.

## Tech Stack
- React 19 + Vite + Tailwind CSS 4 (CSS-first config)
- TypeScript 5 (strict mode)
- Supabase (PostgreSQL, storage, real-time, auth)
- Vercel deployment (mz-tribute.vercel.app)
- Motion library (Framer Motion compatible) for animations

## Design System ("The Yellow Wall")
- SSU Blue (#003B6F), BVB Yellow (#FDE100), Terracotta (#B5573A)
- Display font: Instrument Serif, Body: Inter
- Dark mode primary with cream text
- Stadium atmosphere: floodlight glow, pitch lines, terrace patterns, film grain
- Mobile-first -- entire community accesses via phones

## Key Patterns
- Design tokens in `src/index.css` using Tailwind v4 `@theme` directive
- Supabase client in `src/lib/supabase.ts` (always connected, no placeholder fallback)
- AdminContext in `src/contexts/AdminContext.tsx` -- wraps app, provides `isAdmin`, `showHidden`
- Shared `useModalNavigation` hook for keyboard nav + scroll lock in modals
- Video thumbnails via Canvas API in `src/lib/video-thumbnail.ts` (client-side, cached)
- Real-time memory feed via Supabase subscriptions (INSERT, UPDATE, DELETE)
- `useMemories(includeHidden)` parameter for admin mode
- `isVideoUrl()` centralized in `src/lib/utils.ts` -- do not duplicate

## Admin System
- Login: triple-tap MZ crest (mobile) or Ctrl+Shift+A (desktop)
- Admin user: michaelduncan17@gmail.com in Supabase Auth
- When authenticated: overlays appear on cards (star, trash, rotate)
- AdminToolbar shows counts and "Show Hidden" toggle
- RLS: authenticated role can see all memories + update/delete
- `set_memory_approval` RPC secured with auth check

## Content Curation Rules
- EVERY message must be reviewed before going live (is_approved = false on import)
- WhatsApp parser must strip U+200E/200F before regex matching
- 3+ rounds of curation: automated filter, agent review, visual audit
- Generous with MZ culture (music, Pliny, BVB, YNWA) but strict on pure logistics
- Dedup media by MD5 hash (exact) and timestamp proximity (burst photos)

## File Conventions
- Components grouped by feature: hero/, memories/, gallery/, music/, about/, admin/
- One component per file, named export matching filename
- Hooks in src/hooks/, utilities in src/lib/, contexts in src/contexts/
- Scripts in scripts/ (parse-whatsapp, upload-media, curate-memories, dedup-media)
- Migrations in supabase/migrations/

## Database Schema
- `memories` table: id, author_name, content, media_urls[], source, whatsapp_timestamp, era, is_featured, is_approved, rotation, created_at, updated_at
- `media` table: exists but unused (media_urls on memories is source of truth)
- Storage bucket: tribute-media (public, with upload policies)
- RLS: anon SELECT approved only, authenticated SELECT all, authenticated UPDATE/DELETE

## Commands
- `npm run dev` -- local development
- `npm run build` -- production build
- `npm run parse-whatsapp` -- import WhatsApp chat data (imports as is_approved=false)
- `npx tsx scripts/dedup-media.ts` -- remove exact duplicate media by MD5 hash
- `npx tsx scripts/visual-dedup.ts` -- remove near-duplicate burst photos
