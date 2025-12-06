-- Make university column nullable to allow form submission without university
ALTER TABLE public.housing_applications ALTER COLUMN university DROP NOT NULL;