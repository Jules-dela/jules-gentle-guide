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