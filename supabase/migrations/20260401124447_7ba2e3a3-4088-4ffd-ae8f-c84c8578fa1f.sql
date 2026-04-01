
CREATE POLICY "Anyone can mark token as used"
  ON public.waitlist_tokens
  FOR UPDATE
  TO anon, authenticated
  USING (used = false)
  WITH CHECK (used = true);
