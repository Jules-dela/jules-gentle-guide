
-- Create admin-only table for sensitive contract metadata
CREATE TABLE public.contract_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL UNIQUE REFERENCES public.cases(id) ON DELETE CASCADE,
  signature_image TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_signatures ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage contract signatures"
  ON public.contract_signatures FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view contract signatures"
  ON public.contract_signatures FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Update sign_contract RPC to store sensitive data separately
CREATE OR REPLACE FUNCTION public.sign_contract(p_case_id UUID, p_contract_data JSONB)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
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

  -- Store sensitive metadata in admin-only table
  INSERT INTO contract_signatures (case_id, signature_image, ip_address, user_agent, device_info, signed_at)
  VALUES (
    p_case_id,
    p_contract_data->>'signature_image',
    p_contract_data->>'ip_address',
    p_contract_data->>'user_agent',
    p_contract_data->'device_info',
    COALESCE((p_contract_data->>'timestamp')::timestamptz, now())
  );

  -- Store only non-sensitive data in cases table (visible to client)
  UPDATE cases
  SET contract_data = jsonb_build_object(
    'signed', true,
    'timestamp', COALESCE(p_contract_data->>'timestamp', now()::text)
  )
  WHERE id = p_case_id;
END;
$$;
