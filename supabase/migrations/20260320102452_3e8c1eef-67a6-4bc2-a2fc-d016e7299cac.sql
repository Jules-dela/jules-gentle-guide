
-- Drop the overly permissive client UPDATE policy
DROP POLICY IF EXISTS "Clients can upload documents" ON public.case_documents;

-- Create a secure RPC function for client document uploads
CREATE OR REPLACE FUNCTION public.client_update_document_file(
  p_document_id uuid,
  p_file_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the document belongs to the client's case
  IF NOT EXISTS (
    SELECT 1 FROM case_documents cd
    JOIN cases c ON cd.case_id = c.id
    JOIN profiles p ON c.client_id = p.id
    WHERE cd.id = p_document_id
      AND p.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Only allow updating file_url and setting status to 'uploaded'
  -- Do not allow changing status, validated_at, or rejection_reason
  UPDATE case_documents
  SET file_url = p_file_url,
      status = 'uploaded'
  WHERE id = p_document_id
    AND status IN ('missing', 'rejected');
END;
$$;
