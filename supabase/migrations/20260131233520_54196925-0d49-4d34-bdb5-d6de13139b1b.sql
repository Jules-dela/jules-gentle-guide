-- Add contract_data JSONB column to cases table for storing signature info
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS contract_data jsonb DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.cases.contract_data IS 'Stores contract signing data: signature_image, ip_address, timestamp, user_agent, device_info';