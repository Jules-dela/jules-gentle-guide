CREATE TABLE public.intake_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deposit_paid BOOLEAN NOT NULL DEFAULT false,
  stripe_session_id TEXT,
  contract_signed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.intake_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit intake"
ON public.intake_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view intake submissions"
ON public.intake_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update intake submissions"
ON public.intake_submissions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete intake submissions"
ON public.intake_submissions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_intake_submissions_updated_at
BEFORE UPDATE ON public.intake_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();