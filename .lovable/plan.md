# Fix: videos uploaded via the new apartment uploader don't show in the client portal

## Diagnosis

Two admin code paths upload to the private `visit-videos` bucket using different storage path conventions:

- `src/components/admin/VisitReportUploader.tsx` → `visits/{caseId}/{timestamp}-{filename}`
- `src/components/admin/ApartmentUploader.tsx` → `{caseId}/{proposalId}/{timestamp}-{filename}` (newer flow you've been using)

The storage RLS policy `"Clients can view their visit videos"` on `storage.objects` checks:

```
(storage.foldername(name))[2] IN (SELECT c.id::text ... WHERE p.user_id = auth.uid())
```

That hardcoded `[2]` matches only the old `visits/{caseId}/...` pattern. For the new pattern, position `[2]` is the proposal ID, so the client is denied. `VisitReport.tsx` then calls `supabase.storage.from('visit-videos').createSignedUrl(...)`, gets null back, and the `<video>` element never renders.

Admins see the upload succeed (admin RLS allows everything), and the DB row in `visit_videos` is correctly created — that's why "it appears to succeed but the video isn't there" for clients.

Confirmed: the most recent `visit_videos` row (just uploaded, Epalinges proposal) has URL `…/visit-videos/{caseId}/{proposalId}/…WhatsApp Video….mp4` — exactly the broken path shape.

## Fix

Update the storage RLS policy so it grants access whenever **any** path segment of the object name matches one of the caller's case IDs. This covers both old (`visits/{caseId}/…`) and new (`{caseId}/{proposalId}/…`) layouts and any future variation, with no data migration needed.

New migration replacing the existing policy on `storage.objects`:

```sql
DROP POLICY IF EXISTS "Clients can view their visit videos" ON storage.objects;

CREATE POLICY "Clients can view their visit videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'visit-videos'
  AND EXISTS (
    SELECT 1
    FROM public.cases c
    JOIN public.profiles p ON p.id = c.client_id
    WHERE p.user_id = auth.uid()
      AND c.id::text = ANY (storage.foldername(name))
  )
);
```

No changes to the admin "manage" policy, no changes to the `visit_videos` table RLS, no client-side code changes, no re-upload required. After this migration the existing Epalinges video (and any other recent uploads via `ApartmentUploader`) will immediately render in the client portal.

## Out of scope

- Refactoring the two uploader components to share one path convention (worth doing later, but not required to unblock the client now).
- Any change to `VisitReportUploader.tsx`, `ApartmentUploader.tsx`, or `VisitReport.tsx`.
- Bucket size/MIME settings.

## Files touched

- One new migration under `supabase/migrations/` recreating the `"Clients can view their visit videos"` policy on `storage.objects`.
