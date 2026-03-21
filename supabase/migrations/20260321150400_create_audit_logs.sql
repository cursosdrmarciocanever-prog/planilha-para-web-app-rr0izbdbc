-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Clean existing matching policies to avoid duplicates on rerun
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow authenticated access" ON public.audit_logs;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Create New Policy for all authenticated users
CREATE POLICY "Allow authenticated access" ON public.audit_logs 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
