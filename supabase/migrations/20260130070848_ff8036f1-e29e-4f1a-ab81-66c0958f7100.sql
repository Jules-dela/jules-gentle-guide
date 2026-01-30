-- Add moving_date column to housing_applications
ALTER TABLE public.housing_applications 
ADD COLUMN moving_date date NULL;