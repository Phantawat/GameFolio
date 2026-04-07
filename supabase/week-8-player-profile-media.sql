-- Player profile content enhancements:
-- 1) editable competitive experience + hardware details
-- 2) match highlight uploads with <= 2 minute duration metadata

ALTER TABLE public.player_profiles
ADD COLUMN IF NOT EXISTS competitive_experience TEXT,
ADD COLUMN IF NOT EXISTS hardware_details TEXT;

CREATE TABLE IF NOT EXISTS public.player_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_profile_id UUID NOT NULL REFERENCES public.player_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration_seconds INT NOT NULL CHECK (duration_seconds > 0 AND duration_seconds <= 120),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE public.player_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Player highlights are viewable by everyone" ON public.player_highlights;
CREATE POLICY "Player highlights are viewable by everyone"
ON public.player_highlights
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Players can insert own highlights" ON public.player_highlights;
CREATE POLICY "Players can insert own highlights"
ON public.player_highlights
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.player_profiles p
    WHERE p.id = player_highlights.player_profile_id
      AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Players can delete own highlights" ON public.player_highlights;
CREATE POLICY "Players can delete own highlights"
ON public.player_highlights
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.player_profiles p
    WHERE p.id = player_highlights.player_profile_id
      AND p.user_id = auth.uid()
  )
);

-- Storage bucket for player highlights
INSERT INTO storage.buckets (id, name, public)
VALUES ('player_highlights', 'player_highlights', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Player Highlights" ON storage.objects;
CREATE POLICY "Public Access Player Highlights"
ON storage.objects
FOR SELECT
USING (bucket_id = 'player_highlights');

DROP POLICY IF EXISTS "Player Upload Highlights" ON storage.objects;
CREATE POLICY "Player Upload Highlights"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'player_highlights'
  AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Player Delete Highlights" ON storage.objects;
CREATE POLICY "Player Delete Highlights"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'player_highlights'
  AND auth.role() = 'authenticated'
);
