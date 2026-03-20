# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Memorial tribute website for Marcus Ziemer, SSU Men's Soccer head coach (1983-2025). Preserves memories, photos, and videos from the 130+ member alumni WhatsApp community. Deployed at mz-tribute.vercel.app.

## Commands

- `npm run dev` -- Vite dev server at localhost:5173
- `npm run build` -- TypeScript check (`tsc -b`) then Vite production build
- `npm run lint` -- ESLint with TypeScript + React Hooks rules
- `npm run preview` -- serve production build locally
- `npm run parse-whatsapp` -- import WhatsApp chat exports to Supabase (uses tsx). Use `--incremental` to skip already-imported messages, `--dry-run` to preview without writing.
- `npx tsx scripts/dedup-media.ts` -- remove exact duplicate media by MD5 hash
- `npx tsx scripts/visual-dedup.ts` -- remove near-duplicate burst photos

No test framework is configured.

## Tech Stack

- React 19 + Vite 6.1 + Tailwind CSS 4 (CSS-first config via `@theme` in index.css)
- TypeScript 5.7 (strict mode)
- Supabase (PostgreSQL, storage, real-time subscriptions, auth)
- `motion` v12 (Framer Motion successor, import from `motion/react`)
- `lucide-react` for icons
- Vercel deployment (auto-deploy on push to main)

## Architecture

**Section order (App.tsx):** Header -> Hero -> MemoryWall -> MediaGallery -> SpotifyEmbed -> AboutMZ -> Footer. Entire app wrapped in `ErrorBoundary` -> `AdminProvider`.

**Data flow:** `useMemories` fetches from Supabase `memories` table with real-time subscription (INSERT/UPDATE/DELETE). Web submissions go through SubmitMemory modal -> `useMediaUpload` (files to storage bucket) -> insert with `source='web'`, immediately visible (DB default `is_approved=true`). WhatsApp imports land as `is_approved=false` and require admin curation. Gallery pulls `media_urls` arrays from all approved memories.

**Modal state** lives in App.tsx: SubmitMemory, MemoryDetail (with prev/next navigation via `useModalNavigation`), and LightboxModal all managed at the root level.

## Environment Variables

`.env.local` requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Mock data renders when these are missing (dev without Supabase).

## Key Patterns

- Design tokens in `src/index.css` using Tailwind v4 `@theme` directive -- no tailwind.config.js
- Supabase client in `src/lib/supabase.ts` -- `isSupabaseConfigured` checks env vars; mock data renders when missing
- AdminContext in `src/contexts/AdminContext.tsx` -- wraps app, provides `isAdmin`, `showHidden`
- Shared `useModalNavigation` hook for keyboard nav + scroll lock in modals
- Video thumbnails via Canvas API in `src/lib/video-thumbnail.ts` (client-side, cached per session)
- Real-time memory feed via Supabase subscriptions (INSERT, UPDATE, DELETE)
- `useMemories(includeHidden)` parameter for admin mode
- `isVideoUrl()` centralized in `src/lib/utils.ts` -- do not duplicate
- Animation: `motion/react` for scroll-triggered entrances (whileInView). CSS `@keyframes` for continuous loops (infinity-flow, pulse-glow, shimmer). `useIntersection` hook for scroll-triggered visibility
- Continuous CSS animations wrapped in `@media (prefers-reduced-motion: no-preference)` -- respect user motion preferences
- Nav scroll offset: Header.tsx `scrollTo()` calculates position minus 80px for the fixed header. CSS `scroll-margin-top: 80px` on `section[id]` as backup.

## Admin System

- Login: triple-tap MZ crest (mobile) or Ctrl+Shift+A (desktop). Password-only form (email hardcoded in AdminContext).
- Admin user: michaelduncan17@gmail.com in Supabase Auth
- When authenticated: overlays appear on cards (star, hide/unhide, rotate) with loading states and two-tap confirm
- AdminToolbar shows counts and "Show Hidden" toggle
- `useAdminActions` hook: hideMemory, showMemory, toggleFeatured, rotateMemory
- RLS: authenticated role can see all memories + update/delete
- `set_memory_approval` RPC secured with auth check

## Design System ("The Yellow Wall")

- SSU Blue (#003B6F), BVB Yellow (#FDE100), Terracotta (#B5573A), Pitch Green (#2D5A3D)
- Navy backgrounds (#0A1628), Cream text (#F5F0E8)
- Display font: Instrument Serif, Body: Inter
- Dark mode primary with cream text
- Stadium atmosphere: floodlight glow, pitch lines, terrace patterns, film grain
- Mobile-first -- entire community accesses via phones
- Custom CSS classes in index.css: stat-card, memory-card-accent, film-grain, pitch-lines, floodlight-glow, broadcast-frame, masonry-grid

## Content Curation Rules

- WhatsApp imports must be reviewed before going live (is_approved = false on import). Web submissions go live immediately.
- WhatsApp parser must strip U+200E/200F before regex matching
- 3+ rounds of curation: automated filter, agent review, visual audit
- Generous with MZ culture (music, Pliny, BVB, YNWA) but strict on pure logistics
- Dedup media by MD5 hash (exact) and timestamp proximity (burst photos)
- Preserve authentic voice -- crude humor, alcohol references, inside jokes are MZ's culture
- "You'll Never Walk Alone" is the spiritual tagline
- No stock imagery, only real community photos

## File Conventions

- Components grouped by feature: hero/, memories/, gallery/, music/, about/, admin/, layout/
- One component per file, named export matching filename
- Hooks in src/hooks/, utilities in src/lib/, contexts in src/contexts/
- Scripts in scripts/ (run with `npx tsx`)
- Migrations in supabase/migrations/

## Input Validation

Client-side (SubmitMemory.tsx) and DB constraints (migration 004) enforce limits:
- Author name: 100 chars max
- Content: 5,000 chars client-side, 20,000 chars DB (accommodates long WhatsApp imports)
- Files: 5 max, 50MB each, MIME type must start with `image/` or `video/`
- 2-minute cooldown between submissions (localStorage)
- Era restricted to: player, post-grad, colleague, family
- All limits defined in `src/lib/constants.ts`

## Database Schema

- `memories` table: id, author_name, content, media_urls[], source ('whatsapp'|'web'), whatsapp_timestamp, era ('player'|'post-grad'|'colleague'|'family'), is_featured, is_approved, rotation, created_at, updated_at
- CHECK constraints: author_name <= 100 chars, content <= 20,000 chars, media_urls <= 10 items, era must be valid enum
- `media` table: exists but unused (media_urls on memories is source of truth)
- Storage bucket: tribute-media (public read, authenticated write)
- RLS: anon SELECT approved only, anon INSERT allowed, authenticated SELECT all, authenticated UPDATE/DELETE
