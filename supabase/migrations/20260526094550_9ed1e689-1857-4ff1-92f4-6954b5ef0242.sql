-- Lock down waitlist_tokens: remove public read/update access.
-- Edge functions use the service role and bypass RLS, so they still work.
DROP POLICY IF EXISTS "Public can select by exact token" ON public.waitlist_tokens;
DROP POLICY IF EXISTS "Anyone can mark token as used" ON public.waitlist_tokens;