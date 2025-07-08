
-- Add supervisor_id column to employees table
ALTER TABLE public.employees 
ADD COLUMN supervisor_id TEXT REFERENCES public.employees(id);
