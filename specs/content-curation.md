# Content Curation System

## Problem
The WhatsApp parser imported 74 text tributes and 149 media entries using only date + length as filters. Many text entries are logistics, banter, and event planning -- not tributes to Marcus. Example: "Langey don't forget the jersey bag this time" is not a tribute.

## Requirements

### 1. Immediate Cleanup (one-time)
- Review all 74 text memories in Supabase
- Mark non-MZ content as `is_approved = false`
- Generous filter: stories about his culture, personality, brotherhood, music, soccer, European trips all count
- Only remove logistics, event planning, off-topic banter, short reactions

### 2. Media Management
- Keep all 149 media entries (photos of MZ are inherently tributes)
- Add admin ability to remove individual photos
- Add photo rotation (90-degree increments) for poorly-oriented images

### 3. User Self-Management (web submissions)
- Web submissions default to `is_approved = true` (trust the community)
- Users can edit their own submission after posting
- Users can delete their own submission
- No editing/deleting other people's posts
- Track submissions by browser fingerprint or simple session token

### 4. Visual Punch-Up
- Strengthen BVB Dortmund and SSU Soccer theming
- More pitch/stadium atmosphere in the design
- The site should feel like MZ: soccer, music, energy, brotherhood

## Implementation Steps

1. **Curate existing data** -- Script reads all text memories, classifies each as tribute/not-tribute, updates `is_approved` in Supabase
2. **Fix parser for future imports** -- Add MZ-relevance keyword check to `filterTributes()`
3. **Add user edit/delete** -- Track submission ownership via localStorage token, add edit/delete buttons to user's own cards
4. **Frontend visual punch-up** -- BVB/SSU soccer theme strengthening via /frontend-design
