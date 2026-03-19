-- Add client-filled fields to contract_signatures for forensic record
ALTER TABLE public.contract_signatures
  ADD COLUMN IF NOT EXISTS client_full_name text,
  ADD COLUMN IF NOT EXISTS client_date_of_birth text,
  ADD COLUMN IF NOT EXISTS client_nationality text,
  ADD COLUMN IF NOT EXISTS client_initials text;

-- Update sign_contract to store these fields
CREATE OR REPLACE FUNCTION public.sign_contract(p_case_id uuid, p_contract_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_new_status case_status;
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

  -- Store sensitive metadata in admin-only table
  INSERT INTO contract_signatures (
    case_id, signature_image, ip_address, user_agent, device_info, signed_at,
    client_full_name, client_date_of_birth, client_nationality, client_initials
  )
  VALUES (
    p_case_id,
    p_contract_data->>'signature_image',
    p_contract_data->>'ip_address',
    p_contract_data->>'user_agent',
    p_contract_data->'device_info',
    COALESCE((p_contract_data->>'timestamp')::timestamptz, now()),
    p_contract_data->>'client_full_name',
    p_contract_data->>'client_date_of_birth',
    p_contract_data->>'client_nationality',
    p_contract_data->>'client_initials'
  );

  -- Determine the furthest valid stage based on existing data
  v_new_status := 'search_in_progress';

  IF EXISTS (SELECT 1 FROM key_handover WHERE case_id = p_case_id) THEN
    v_new_status := 'key_handover_scheduled';
  ELSIF EXISTS (
    SELECT 1 FROM case_documents WHERE case_id = p_case_id
    AND status = 'validated'
    HAVING COUNT(*) = (SELECT COUNT(*) FROM case_documents WHERE case_id = p_case_id)
  ) AND EXISTS (SELECT 1 FROM case_documents WHERE case_id = p_case_id) THEN
    v_new_status := 'application_review';
  ELSIF EXISTS (SELECT 1 FROM case_documents WHERE case_id = p_case_id AND status IN ('uploaded', 'validated')) THEN
    v_new_status := 'documents_preparation';
  ELSIF EXISTS (SELECT 1 FROM property_proposals WHERE case_id = p_case_id AND client_status = 'liked' AND visit_published = true) THEN
    v_new_status := 'visit_in_progress';
  ELSIF EXISTS (SELECT 1 FROM property_proposals WHERE case_id = p_case_id) THEN
    v_new_status := 'proposals_available';
  END IF;

  -- Store non-sensitive data + client fields in cases table and advance status
  UPDATE cases
  SET contract_data = jsonb_build_object(
    'signed', true,
    'timestamp', COALESCE(p_contract_data->>'timestamp', now()::text),
    'client_full_name', p_contract_data->>'client_full_name',
    'client_date_of_birth', p_contract_data->>'client_date_of_birth',
    'client_nationality', p_contract_data->>'client_nationality',
    'client_initials', p_contract_data->>'client_initials'
  ),
  status = v_new_status
  WHERE id = p_case_id;
END;
$function$;