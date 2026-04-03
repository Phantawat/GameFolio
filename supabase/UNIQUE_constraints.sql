SELECT conname FROM pg_constraint
WHERE conrelid = 'public.applications'::regclass
AND contype = 'u';