# MZ Tribute - Project Instructions

## What This Is
Memorial tribute website for Marcus Ziemer, SSU Men's Soccer head coach (1983-2025). Preserves memories, photos, and videos from the 130+ member alumni WhatsApp community.

## Tech Stack
- React 19 + Vite 7 + Tailwind CSS 4 (CSS-first config)
- TypeScript 5 (strict mode)
- Supabase (PostgreSQL, storage, real-time)
- Vercel deployment

## Design System ("Stadium Hymnal")
- SSU Blue (#003B6F), BVB Yellow (#FDE100), Terracotta (#B5573A)
- Display font: Instrument Serif, Body: Inter
- Dark mode primary with cream text
- Mobile-first -- entire community accesses via phones

## Key Patterns
- Design tokens in `src/index.css` using Tailwind v4 `@theme` directive
- Supabase client in `src/lib/supabase.ts` with `isSupabaseConfigured` guard
- Mock data in `src/lib/mock-data.ts` for development without Supabase
- Scroll-triggered animations via `useIntersection` hook
- Real-time memory feed via Supabase subscriptions in `useMemories`

## File Conventions
- Components grouped by feature: hero/, memories/, gallery/, music/, about/
- One component per file, named export matching filename
- Hooks in src/hooks/, utilities in src/lib/

## Content Guidelines
- Preserve authentic voice -- crude humor, alcohol references, inside jokes are MZ's culture
- Focus on post-March 15 tribute content for imports
- "You'll Never Walk Alone" is the spiritual tagline
- No stock imagery, only real community photos

## Commands
- `npm run dev` -- local development
- `npm run build` -- production build
- `npm run parse-whatsapp` -- import WhatsApp chat data to Supabase
