ALTER TABLE public.users
ADD COLUMN first_name TEXT,
ADD COLUMN middle_name TEXT,
ADD COLUMN last_name TEXT;

-- Best-effort backfill for existing users
UPDATE public.users 
SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = CASE 
    WHEN array_length(string_to_array(full_name, ' '), 1) > 1 
    THEN split_part(full_name, ' ', array_length(string_to_array(full_name, ' '), 1))
    ELSE ''
  END,
  middle_name = ''
WHERE first_name IS NULL;
