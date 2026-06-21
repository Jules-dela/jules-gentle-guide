
CREATE TABLE public.application_rejections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reason TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  ip_address TEXT,
  user_agent TEXT,
  payload JSONB,
  error_detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.application_rejections TO authenticated;
GRANT ALL ON public.application_rejections TO service_role;

ALTER TABLE public.application_rejections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read rejections"
  ON public.application_rejections
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_application_rejections_created_at
  ON public.application_rejections (created_at DESC);
CREATE INDEX idx_application_rejections_reason
  ON public.application_rejections (reason);
