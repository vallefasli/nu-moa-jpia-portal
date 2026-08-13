-- Migration 10: Add student_email column to public.users

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS student_email TEXT UNIQUE;
