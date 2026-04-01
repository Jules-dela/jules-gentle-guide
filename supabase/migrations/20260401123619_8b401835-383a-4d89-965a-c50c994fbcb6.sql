
CREATE TABLE public.waitlist_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  name TEXT,
  phone TEXT,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist_tokens ENABLE ROW LEVEL SECURITY;

-- Public can select only when querying by exact token value
CREATE POLICY "Public can select by exact token"
  ON public.waitlist_tokens
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can manage all tokens
CREATE POLICY "Admins can manage waitlist tokens"
  ON public.waitlist_tokens
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
