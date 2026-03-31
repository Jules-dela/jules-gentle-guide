
CREATE TABLE public.apartments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link TEXT NOT NULL,
  description TEXT,
  assigned_client_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage apartments" ON public.apartments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
