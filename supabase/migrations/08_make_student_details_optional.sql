-- Make student-specific details optional so Admins and Officers don't need them
ALTER TABLE public.users ALTER COLUMN student_no DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN program DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN year_level DROP NOT NULL;
