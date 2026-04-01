ALTER TABLE public.waitlist_tokens
ADD COLUMN url text GENERATED ALWAYS AS ('https://uni-key.ch/apply?token=' || token) STORED;