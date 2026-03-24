DO $$ 
BEGIN
  -- Create enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'log_status_enum') THEN
    CREATE TYPE log_status_enum AS ENUM ('sucesso', 'erro', 'pendente');
  END IF;
END $$;

-- Ensure table exists (it should from previous migrations, but just in case)
CREATE TABLE IF NOT EXISTS public.logs_automacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  funcao TEXT NOT NULL,
  status TEXT NOT NULL,
  mensagem_erro TEXT
);

-- Add new columns based on the requirements
ALTER TABLE public.logs_automacao ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.logs_automacao ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Temporarily map existing invalid status data to a valid enum value to avoid casting errors
UPDATE public.logs_automacao 
SET status = 'sucesso' 
WHERE status NOT IN ('sucesso', 'erro', 'pendente');

-- Drop old dependent policies first before altering column type just in case
DROP POLICY IF EXISTS "Allow authenticated read access on logs_automacao" ON public.logs_automacao;
DROP POLICY IF EXISTS "Users can view their own logs" ON public.logs_automacao;

-- Alter the column type to the new enum
ALTER TABLE public.logs_automacao ALTER COLUMN status TYPE log_status_enum USING status::log_status_enum;

-- Enable RLS
ALTER TABLE public.logs_automacao ENABLE ROW LEVEL SECURITY;

-- Create the new policy allowing authenticated users to view only their own logs
CREATE POLICY "Users can view their own logs" ON public.logs_automacao
  FOR SELECT TO authenticated USING (usuario_id = auth.uid());
