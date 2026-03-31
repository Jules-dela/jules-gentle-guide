
-- Block direct client INSERT on contract_signatures (sign_contract RPC is SECURITY DEFINER, so it bypasses RLS)
-- This prevents any direct client INSERT attempts outside the RPC
CREATE POLICY "Only case owner can insert signature via RPC" ON public.contract_signatures
  FOR INSERT TO authenticated
  WITH CHECK (
    case_id IN (
      SELECT c.id FROM cases c
      JOIN profiles p ON c.client_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Add explicit SELECT policy for contract_signatures so clients can view their own
CREATE POLICY "Clients can view own signatures" ON public.contract_signatures
  FOR SELECT TO authenticated
  USING (
    case_id IN (
      SELECT c.id FROM cases c
      JOIN profiles p ON c.client_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
