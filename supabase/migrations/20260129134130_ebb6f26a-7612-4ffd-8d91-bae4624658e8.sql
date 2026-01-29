-- Add unique constraint for stage_notifications upsert
ALTER TABLE public.stage_notifications 
ADD CONSTRAINT stage_notifications_case_stage_type_unique 
UNIQUE (case_id, stage, notification_type);

-- Add unique constraint for client_stage_views upsert
ALTER TABLE public.client_stage_views 
ADD CONSTRAINT client_stage_views_case_user_stage_unique 
UNIQUE (case_id, user_id, stage);