
-- Reset all existing contract data so clients must re-sign the updated contract
UPDATE public.cases SET contract_data = NULL WHERE contract_data IS NOT NULL;

-- Remove old contract signatures since the previous contract was incorrect
DELETE FROM public.contract_signatures;
