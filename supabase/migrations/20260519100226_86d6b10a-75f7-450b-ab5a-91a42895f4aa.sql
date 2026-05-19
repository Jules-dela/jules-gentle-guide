CREATE TABLE public.payment_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  intake_submission_id UUID,
  email TEXT,
  event_type TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  deposit_paid BOOLEAN,
  stripe_session_id TEXT,
  source TEXT,
  message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX payment_events_created_at_idx ON public.payment_events (created_at DESC);
CREATE INDEX payment_events_email_idx ON public.payment_events (lower(email));
CREATE INDEX payment_events_submission_idx ON public.payment_events (intake_submission_id);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment events"
  ON public.payment_events
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage payment events"
  ON public.payment_events
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));