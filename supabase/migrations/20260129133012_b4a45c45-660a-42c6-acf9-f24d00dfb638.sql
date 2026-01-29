-- Create table to track stage updates by admin
CREATE TABLE public.stage_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  stage integer NOT NULL CHECK (stage >= 1 AND stage <= 5),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  notification_type text NOT NULL DEFAULT 'update', -- 'update', 'new_match', 'visit_published', 'document_verified', 'handover_scheduled'
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(case_id, stage, notification_type)
);

-- Create table to track when client last viewed each stage  
CREATE TABLE public.client_stage_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage integer NOT NULL CHECK (stage >= 1 AND stage <= 5),
  last_viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(case_id, user_id, stage)
);

-- Enable RLS
ALTER TABLE public.stage_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_stage_views ENABLE ROW LEVEL SECURITY;

-- RLS for stage_notifications
CREATE POLICY "Admins can manage all notifications"
ON public.stage_notifications
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their case notifications"
ON public.stage_notifications
FOR SELECT
USING (case_id IN (
  SELECT c.id FROM cases c
  JOIN profiles p ON c.client_id = p.id
  WHERE p.user_id = auth.uid()
));

-- RLS for client_stage_views
CREATE POLICY "Users can view their own stage views"
ON public.client_stage_views
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own stage views"
ON public.client_stage_views
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all stage views"
ON public.client_stage_views
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.stage_notifications;