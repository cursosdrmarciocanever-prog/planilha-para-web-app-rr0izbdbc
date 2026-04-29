CREATE TABLE IF NOT EXISTS public.form_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    form_id TEXT NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, form_id)
);

ALTER TABLE public.form_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own drafts" ON public.form_drafts;
CREATE POLICY "Users can manage their own drafts" ON public.form_drafts
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_form_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_form_drafts_updated_at_trigger ON public.form_drafts;
CREATE TRIGGER set_form_drafts_updated_at_trigger
BEFORE UPDATE ON public.form_drafts
FOR EACH ROW EXECUTE FUNCTION public.set_form_drafts_updated_at();
