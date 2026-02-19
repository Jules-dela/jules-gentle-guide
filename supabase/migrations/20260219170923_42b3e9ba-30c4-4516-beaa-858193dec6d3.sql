
-- Create a secure RPC function for contract signing
CREATE OR REPLACE FUNCTION public.sign_contract(
  p_case_id UUID,
  p_contract_data JSONB
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user owns the case
  IF NOT EXISTS (
    SELECT 1 FROM cases c
    JOIN profiles p ON c.client_id = p.id
    WHERE c.id = p_case_id AND p.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Only allow signing if not already signed
  IF EXISTS (SELECT 1 FROM cases WHERE id = p_case_id AND contract_data IS NOT NULL) THEN
    RAISE EXCEPTION 'Contract already signed';
  END IF;
  
  UPDATE cases 
  SET contract_data = p_contract_data
  WHERE id = p_case_id;
END;
$$;
