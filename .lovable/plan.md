

## Problem

Videos uploaded by admins in the Visit Report section are stored in the `visit_videos` table but **never fetched or displayed** in the client portal's `VisitReport.tsx` component. Clients cannot see visit videos at all.

The screenshot also shows the admin's own video player rendering as a black box — that may be a browser/codec issue with the uploaded file, but the client-side gap is the core problem.

## Plan

### 1. Add video fetching to the client VisitReport component
**File:** `src/components/portal/VisitReport.tsx`

- Add `visit_video_url` to the `VisitData` interface
- In `fetchVisitData()`, query `visit_videos` table for the proposal's video URL alongside the existing photo/pros/cons query
- Store the video URL in state

### 2. Display the video in the client portal
**File:** `src/components/portal/VisitReport.tsx`

- Add a "Visit Video" section between the photo gallery and the agent notes card
- Render a `<video>` element with `controls`, `playsInline`, and `preload="metadata"` attributes
- Only show this section when a video URL exists
- Style consistently with the existing rounded card design

### 3. Ensure RLS allows clients to read visit_videos
- Check if the `visit_videos` table has a SELECT RLS policy for authenticated users whose case matches. If not, add one via migration.

### Technical details

- The `visit_videos` table has columns: `id`, `proposal_id`, `video_url`, `created_at`
- Videos are stored in public Supabase storage, so the URL should be directly playable
- The query joins through `proposal_id` which is already available in the component via `apartment.id`

