-- ==============================================================================
-- 🎮 GameFolio: Email Uniqueness Hardening
-- ==============================================================================
-- Goal: Block duplicate emails regardless of letter case.
-- Run in Supabase SQL Editor.
-- ==============================================================================

-- 1) Normalize existing emails in public.users (trim + lowercase)
UPDATE public.users
SET email = lower(trim(email))
WHERE email <> lower(trim(email));

-- 2) Safety check for duplicates that would conflict after normalization
-- If this returns rows, resolve/merge those users before creating the index.
-- SELECT lower(trim(email)) AS normalized_email, count(*)
-- FROM public.users
-- GROUP BY normalized_email
-- HAVING count(*) > 1;

-- 3) Replace case-sensitive unique constraint with case-insensitive unique index
-- Keep original unique constraint if present? We drop by known name fallback.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_email_key'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_email_key;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique_idx
ON public.users ((lower(trim(email))));

-- 4) Optional but recommended: normalize auth.users too (Supabase-managed table)
-- This should be safe; if your project restricts writes to auth schema, skip this.
-- UPDATE auth.users
-- SET email = lower(trim(email))
-- WHERE email IS NOT NULL AND email <> lower(trim(email));
