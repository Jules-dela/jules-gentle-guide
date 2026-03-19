CREATE POLICY "Clients can view their own cases"
ON public.cases
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);