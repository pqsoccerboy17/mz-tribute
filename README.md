# MZ Tribute

Memorial tribute website for Marcus Ziemer, head coach of SSU Men's Soccer (1983-2025).

## Tech Stack

- React 19 + Vite 7 + Tailwind CSS 4
- TypeScript 5 (strict)
- Supabase (database, storage, real-time)
- Vercel

## Quick Start

```bash
npm install
npm run dev
```

The site runs with mock data until Supabase is configured.

## Environment Variables

Create `.env.local`:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```
src/
  components/
    about/       - MZ biography section
    gallery/     - Photo/video grid with lightbox
    hero/        - Full-viewport hero
    layout/      - Header, Footer, Container
    memories/    - Memory wall, cards, submission form
    music/       - Spotify playlist embed
  hooks/         - useMemories, useMediaUpload, useIntersection
  lib/           - Supabase client, types, utilities, constants
scripts/
  parse-whatsapp.ts - WhatsApp chat export importer
supabase/
  migrations/    - Database schema SQL
```

## Deployment

Deployed to Vercel at mz-tribute.vercel.app. Push to main triggers auto-deploy.
