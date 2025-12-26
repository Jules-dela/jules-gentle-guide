-- Create table to track submission rate limits
CREATE TABLE IF NOT EXISTS public.rate_limit_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient rate limit queries
CREATE INDEX idx_rate_limit_ip_time ON public.rate_limit_submissions(ip_address, created_at DESC);

-- Enable RLS (deny all public access, service role only)
ALTER TABLE public.rate_limit_submissions ENABLE ROW LEVEL SECURITY;

-- No RLS policies = only service role can access (which is what we want)