-- Create housing_applications table to store all form submissions
CREATE TABLE public.housing_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Personal Info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  university TEXT NOT NULL,
  
  -- Housing Preferences
  neighbourhood TEXT,
  budget TEXT,
  rooms TEXT,
  duration TEXT,
  property_type TEXT,
  
  -- Additional Preferences
  roommate_preference TEXT,
  furnished BOOLEAN DEFAULT false,
  near_transport BOOLEAN DEFAULT false,
  pets_allowed BOOLEAN DEFAULT false,
  smoking_allowed BOOLEAN DEFAULT false,
  
  -- Other
  notes TEXT,
  privacy_accepted BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.housing_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous users) to INSERT applications
-- This is necessary since visitors submitting the form are not logged in
CREATE POLICY "Anyone can submit applications"
ON public.housing_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No SELECT policy for public - only backend/service role can read applications
-- This protects applicant data from being exposed