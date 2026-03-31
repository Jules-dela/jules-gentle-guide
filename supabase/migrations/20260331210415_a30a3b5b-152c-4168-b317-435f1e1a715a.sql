
-- Create a SECURITY DEFINER function for client proposal feedback updates
-- This restricts clients to only updating allowed columns
CREATE OR REPLACE FUNCTION public.client_update_proposal_feedback(
  p_proposal_id uuid,
  p_client_status proposal_status,
  p_rejection_reasons text[] DEFAULT '{}',
  p_rejection_notes text DEFAULT NULL,
  p_client_visit_questions text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the proposal belongs to the caller's case
  IF NOT EXISTS (
    SELECT 1 FROM property_proposals pp
    JOIN cases c ON pp.case_id = c.id
    JOIN profiles p ON c.client_id = p.id
    WHERE pp.id = p_proposal_id
      AND p.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Only allow updating feedback columns
  UPDATE property_proposals
  SET client_status = p_client_status,
      rejection_reasons = p_rejection_reasons,
      rejection_notes = p_rejection_notes,
      client_visit_questions = p_client_visit_questions
  WHERE id = p_proposal_id;
END;
$$;

-- Drop the permissive UPDATE policy that allowed clients to update any column
DROP POLICY IF EXISTS "Clients can update proposal feedback" ON public.property_proposals;
