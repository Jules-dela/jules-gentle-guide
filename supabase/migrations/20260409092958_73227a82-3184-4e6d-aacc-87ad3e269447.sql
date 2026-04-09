
-- Drop the broken policy
DROP POLICY "Clients can view their visit videos" ON storage.objects;

-- Recreate with correct folder index ([2] = case_id in path visits/<case_id>/...)
CREATE POLICY "Clients can view their visit videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'visit-videos'
  AND (storage.foldername(name))[2] IN (
    SELECT c.id::text
    FROM cases c
    JOIN profiles p ON c.client_id = p.id
    WHERE p.user_id = auth.uid()
  )
);
